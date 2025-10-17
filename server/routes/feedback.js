const express = require('express');
const ApplicationFeedback = require('../models/ApplicationFeedback');
const Notification = require('../models/Notification');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// Get feedback for an application
router.get('/application/:applicationId', auth, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { includeInternal = false } = req.query;

    let query = { applicationId };
    if (!includeInternal || req.user.role !== 'admin') {
      query.isInternal = false;
    }

    const feedback = await ApplicationFeedback.find(query)
      .populate('addedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback', error: error.message });
  }
});

// Add feedback to an application
router.post('/application/:applicationId', auth, requireRole(['admin', 'bot_mimic']), async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { comment, stage, isInternal = false } = req.body;

    const feedback = new ApplicationFeedback({
      applicationId,
      stage,
      comment,
      addedBy: req.user._id,
      addedByRole: req.user.role,
      isInternal
    });

    await feedback.save();

    // Create notification for applicant if not internal
    if (!isInternal) {
      const notification = new Notification({
        userId: req.body.applicantId, // This should be passed from frontend
        applicationId,
        type: 'feedback',
        title: 'New Feedback Added',
        message: `New feedback has been added to your application: ${comment.substring(0, 100)}...`,
        metadata: {
          stage,
          addedBy: req.user.name
        }
      });

      await notification.save();
    }

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Error adding feedback', error: error.message });
  }
});

// Update feedback
router.put('/:feedbackId', auth, requireRole(['admin', 'bot_mimic']), async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { comment, isInternal } = req.body;

    const feedback = await ApplicationFeedback.findByIdAndUpdate(
      feedbackId,
      { comment, isInternal },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Error updating feedback', error: error.message });
  }
});

// Delete feedback
router.delete('/:feedbackId', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { feedbackId } = req.params;
    await ApplicationFeedback.findByIdAndDelete(feedbackId);
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting feedback', error: error.message });
  }
});

module.exports = router;






