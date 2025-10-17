const express = require('express');
const Application = require('../models/Application');
const ApplicationFeedback = require('../models/ApplicationFeedback');
const Notification = require('../models/Notification');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// Get all applications for admin management
router.get('/applications', auth, requireRole(['admin']), async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('applicant', 'name email phone')
      .populate('job', 'title department isTechnical')
      .sort({ createdAt: -1 });

    // Filter out applications with null job references
    const validApplications = applications.filter(app => app.job !== null);

    res.json(validApplications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

// Update application status with stage tracking
router.put('/applications/:applicationId/status', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, stage, comment, isRejection = false } = req.body;

    const application = await Application.findById(applicationId)
      .populate('applicant', 'name email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Create stage history entry
    const stageEntry = {
      stage: stage || status,
      status: status,
      comment: comment || '',
      changedBy: req.user._id,
      changedByRole: 'admin',
      changedAt: new Date(),
      isRejection
    };

    // Update application
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      {
        status,
        currentStage: stage || status,
        $push: { stageHistory: stageEntry }
      },
      { new: true }
    ).populate('applicant', 'name email phone').populate('job', 'title department');

    // Create notification for applicant
    const notification = new Notification({
      userId: application.applicant._id,
      applicationId: application._id,
      type: isRejection ? 'rejected' : 'status_update',
      title: isRejection ? 'Application Update' : 'Status Update',
      message: isRejection 
        ? `Your application for ${application.job.title} has been updated.`
        : `Your application for ${application.job.title} status has been updated to ${status}.`,
      metadata: {
        status,
        stage: stage || status,
        comment,
        changedBy: req.user.name
      }
    });

    await notification.save();

    // Add feedback if comment provided
    if (comment) {
      const feedback = new ApplicationFeedback({
        applicationId: application._id,
        stage: stage || status,
        comment,
        addedBy: req.user._id,
        addedByRole: 'admin',
        isInternal: false
      });

      await feedback.save();
    }

    res.json({
      message: 'Application status updated successfully',
      application: updatedApplication
    });

  } catch (error) {
    res.status(500).json({ message: 'Error updating application status', error: error.message });
  }
});

// Get application timeline with stage history
router.get('/applications/:applicationId/timeline', auth, async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const application = await Application.findById(applicationId)
      .populate('applicant', 'name email phone')
      .populate('job', 'title department')
      .populate('stageHistory.changedBy', 'name role');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Get feedback for this application - show all feedback (admin and bot)
    // Note: The existing feedback entries use 'applicationId' field and are stored in ApplicationFeedback collection
    const feedback = await ApplicationFeedback.find({ 
      applicationId: applicationId
    }).populate('reviewer', 'name role');

    // Get notifications for this application
    const notifications = await Notification.find({ 
      applicationId,
      userId: req.user._id 
    }).sort({ createdAt: -1 });

    // Transform feedback to match frontend expectations
    const transformedFeedback = feedback.map(item => ({
      ...item.toObject(),
      addedBy: item.reviewer,
      addedByRole: item.reviewer?.role || 'Unknown'
    }));

    res.json({
      application,
      stageHistory: application.stageHistory,
      feedback: transformedFeedback,
      notifications
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching application timeline', error: error.message });
  }
});

// Get available status options for admin
router.get('/status-options', auth, requireRole(['admin']), async (req, res) => {
  try {
    const statusOptions = [
      {
        value: 'applied',
        label: 'Application Submitted',
        description: 'Initial application received',
        color: '#4299e1',
        icon: '📝'
      },
      {
        value: 'shortlisted',
        label: 'Shortlisted',
        description: 'Application has been shortlisted for further review',
        color: '#48bb78',
        icon: '✅'
      },
      {
        value: 'reviewed',
        label: 'Under Review',
        description: 'Application is being reviewed by the team',
        color: '#ed8936',
        icon: '👀'
      },
      {
        value: 'interview_scheduled',
        label: 'Interview Scheduled',
        description: 'Interview has been scheduled',
        color: '#9f7aea',
        icon: '📅'
      },
      {
        value: 'interview_completed',
        label: 'Interview Completed',
        description: 'Interview process has been completed',
        color: '#38b2ac',
        icon: '💼'
      },
      {
        value: 'offer',
        label: 'Offer Made',
        description: 'Job offer has been extended',
        color: '#68d391',
        icon: '🎉'
      },
      {
        value: 'rejected',
        label: 'Rejected',
        description: 'Application has been rejected',
        color: '#f56565',
        icon: '❌'
      }
    ];

    res.json(statusOptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching status options', error: error.message });
  }
});

module.exports = router;

