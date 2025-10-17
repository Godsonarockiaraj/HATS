const express = require('express');
const Application = require('../models/Application');
const ActivityLog = require('../models/ActivityLog');
const Keyword = require('../models/Keyword');
const { auth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const NotificationService = require('../services/notificationService');
const router = express.Router();

// Get applications based on role
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'applicant') {
      query.applicantId = req.user._id;
    }
    
    const applications = await Application.find(query)
      .populate('applicantId', 'name email')
      .populate('jobId', 'title department isTechnical')
      .sort({ createdAt: -1 });
    
    // Filter out applications with null job references
    const validApplications = applications.filter(app => app.jobId !== null);
    
    res.json(validApplications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

// Get single application
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email')
      .populate('job', 'title department isTechnical');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check access
    if (req.user.role === 'applicant' && application.applicantId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching application', error: error.message });
  }
});

// Create application with detailed form
router.post('/', auth, requireRole(['applicant']), (req, res, next) => {
  // Use multer.single() but catch any errors if no file is provided
  upload.single('resume')(req, res, (err) => {
    if (err && err.code === 'LIMIT_UNEXPECTED_FILE') {
      // No file provided, continue without error
      return next();
    } else if (err) {
      // Other multer errors (file type, size, etc.)
      return res.status(400).json({ message: err.message });
    }
    // File processed successfully or no file provided
    next();
  });
}, async (req, res) => {
  try {
    console.log('📝 Application submission received');
    console.log('User:', req.user.email, 'Role:', req.user.role);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('File uploaded:', req.file ? req.file.filename : 'No file');
    
    const {
      jobId,
      personalInfo,
      professionalInfo,
      education,
      workExperience,
      skills,
      coverLetter,
      additionalInfo
    } = req.body;

    // Validate required fields
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    // Check if job exists
    const Job = require('../models/Job');
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(400).json({ message: 'Job not found' });
    }
    console.log('Job found:', job.title);

    // Parse JSON fields
    const parsedPersonalInfo = typeof personalInfo === 'string' ? JSON.parse(personalInfo) : personalInfo;
    const parsedProfessionalInfo = typeof professionalInfo === 'string' ? JSON.parse(professionalInfo) : professionalInfo;
    const parsedEducation = typeof education === 'string' ? JSON.parse(education) : education;
    const parsedWorkExperience = typeof workExperience === 'string' ? JSON.parse(workExperience) : workExperience;
    const parsedSkills = typeof skills === 'string' ? JSON.parse(skills) : skills;
    const parsedAdditionalInfo = typeof additionalInfo === 'string' ? JSON.parse(additionalInfo) : additionalInfo;

    const applicationData = {
      applicant: req.user._id,
      job: jobId,
      personalInfo: parsedPersonalInfo,
      professionalInfo: parsedProfessionalInfo,
      education: parsedEducation,
      workExperience: parsedWorkExperience,
      skills: parsedSkills,
      coverLetter,
      additionalInfo: parsedAdditionalInfo
    };

    // Handle file upload - only store resume if provided
    if (req.file) {
      console.log('✅ Resume file provided - storing resume data');
      applicationData.resume = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      };
    } else {
      console.log('📝 No resume file provided - application will be processed without resume');
    }

    console.log('Creating application with data:', {
      applicant: applicationData.applicant,
      job: applicationData.job,
      hasResume: !!applicationData.resume,
      personalInfoKeys: Object.keys(applicationData.personalInfo || {})
    });

    const application = new Application({
      jobId: applicationData.job,
      applicantId: applicationData.applicant,
      formData: {
        personalInfo: applicationData.personalInfo,
        professionalInfo: applicationData.professionalInfo,
        education: applicationData.education,
        workExperience: applicationData.workExperience,
        skills: applicationData.skills,
        coverLetter: applicationData.coverLetter,
        additionalInfo: applicationData.additionalInfo,
        resume: applicationData.resume
      },
      status: applicationData.status || 'pending',
      shortlistingInfo: applicationData.shortlistingInfo || {}
    });
    console.log('Application created, saving...');
    try {
      await application.save();
      console.log('Application saved with ID:', application._id);
    } catch (saveError) {
      if (saveError.code === 11000) {
        // Duplicate key error - user has already applied for this job
        console.log('User has already applied for this job');
        return res.status(400).json({ 
          message: 'You have already applied for this job. You cannot apply twice for the same position.',
          error: 'DUPLICATE_APPLICATION'
        });
      }
      throw saveError; // Re-throw other errors
    }
    
    await application.populate('jobId', 'title department isTechnical');
    console.log('Application populated with job data');
    
    // Log activity
    console.log('Creating activity log...');
    const activityLog = new ActivityLog({
      user: req.user._id,
      action: 'application_submitted',
      targetType: 'application',
      targetId: application._id,
      description: 'Detailed application submitted successfully'
    });
    await activityLog.save();
    console.log('Activity log saved');

    // Create notification for new technical application (for bot and admin)
    if (application.jobId.isTechnical) {
      console.log('Creating notification for technical application...');
      try {
        await NotificationService.createNewTechnicalApplicationNotification(application);
        console.log('Notification created successfully');
      } catch (notificationError) {
        console.error('Error creating new technical application notification:', notificationError);
        // Don't fail the request if notification creation fails
      }
    } else {
      console.log('Non-technical application, no notification needed');
    }
    
    console.log('✅ Application submitted successfully:', application._id);
    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error creating application', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update application status (admin and bot_mimic only)
router.put('/:id/status', auth, requireRole(['admin', 'bot_mimic']), async (req, res) => {
  try {
    const { status, currentStage, ...updateData } = req.body;
    
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const oldStatus = application.status;
    
    // Update status and stage
    if (status) {
      application.status = status;
    }
    if (currentStage) {
      application.currentStage = currentStage;
    }
    
    // Update other fields from updateData
    Object.keys(updateData).forEach(key => {
      try {
        if (key.startsWith('shortlistingInfo.')) {
          const field = key.replace('shortlistingInfo.', '');
          if (!application.shortlistingInfo) {
            application.shortlistingInfo = {};
          }
          application.shortlistingInfo[field] = updateData[key];
        } else if (application.schema.paths[key]) {
          // Only update if the field exists in the schema
          application[key] = updateData[key];
        }
      } catch (fieldError) {
        console.error(`Error updating field ${key}:`, fieldError);
        // Continue with other fields
      }
    });
    
    await application.save();
    
    // Log activity
    const activityLog = new ActivityLog({
      user: req.user._id,
      action: 'application_reviewed',
      targetType: 'application',
      targetId: application._id,
      description: `Status changed from ${oldStatus} to ${status || application.status}`,
      timestamp: new Date()
    });
    await activityLog.save();
    
    res.json({ 
      message: 'Application status updated successfully', 
      application 
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ 
      message: 'Error updating application status', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update application (admin only)
router.put('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { status, comment } = req.body;
    
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const oldStatus = application.status;
    
    // Update status if provided
    if (status) {
      application.status = status;
    }
    
    await application.save();
    
    // Add comment if provided
    if (comment) {
      application.notes.push({
        content: comment,
        addedBy: req.user._id,
        addedAt: new Date()
      });
      await application.save();
    }
    
    // Log activity if status changed
    if (status && status !== oldStatus) {
      // Add to stage history
      application.stageHistory.push({
        stage: status,
        status: status,
        comment: comment || `Status changed from ${oldStatus} to ${status}`,
        changedBy: req.user._id,
        changedByRole: req.user.role,
        changedAt: new Date(),
        isRejection: status === 'rejected'
      });
      await application.save();

      const activityLog = new ActivityLog({
        user: req.user._id,
        action: 'application_reviewed',
        targetType: 'application',
        targetId: application._id,
        description: comment || `Status changed from ${oldStatus} to ${status}`,
        timestamp: new Date()
      });
      await activityLog.save();

      // Create notification for status change
      try {
        await NotificationService.createApplicationStatusNotification(
          application, 
          oldStatus, 
          status, 
          req.user
        );
      } catch (notificationError) {
        console.error('Error creating status notification:', notificationError);
        // Don't fail the request if notification creation fails
      }
    }
    
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error updating application', error: error.message });
  }
});


// Get application activity logs
router.get('/:id/logs', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check access
    if (req.user.role === 'applicant' && application.applicantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const logs = await ActivityLog.find({ application: req.params.id })
      .populate('performedBy', 'name role')
      .sort({ createdAt: -1 });
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
});

// Serve resume files
router.get('/:id/resume', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check access
    if (req.user.role === 'applicant' && application.applicantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (!application.formData?.resume || !application.formData?.resume.path) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../uploads', application.formData?.resume.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resume file not found' });
    }
    
    // Check if it's a PDF file for inline viewing
    if (application.formData?.resume.mimetype === 'application/pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + application.formData?.resume.originalName + '"');
    } else {
      // For other file types, force download
      res.setHeader('Content-Disposition', 'attachment; filename="' + application.formData?.resume.originalName + '"');
    }
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    res.status(500).json({ message: 'Error serving resume', error: error.message });
  }
});

// Serve resume files with token parameter (for viewing in new tab)
router.get('/:id/resume/view', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(401).json({ message: 'Token required' });
    }
    
    // Verify token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check access based on token
    if (decoded.role === 'applicant' && application.applicantId.toString() !== decoded.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (!application.formData?.resume || !application.formData?.resume.path) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../uploads', application.formData?.resume.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resume file not found' });
    }
    
    // Check if it's a PDF file for inline viewing
    if (application.formData?.resume.mimetype === 'application/pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + application.formData?.resume.originalName + '"');
    } else {
      // For other file types, force download
      res.setHeader('Content-Disposition', 'attachment; filename="' + application.formData?.resume.originalName + '"');
    }
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Error serving resume', error: error.message });
  }
});

// Shortlist application (admin only)
router.post('/:id/shortlist', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { shortlistingNotes } = req.body;
    
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    application.status = 'shortlisted';
    application.shortlistingInfo = {
      isShortlisted: true,
      shortlistedBy: 'admin',
      shortlistedAt: new Date(),
      shortlistingNotes: shortlistingNotes || 'Manually shortlisted by admin'
    };
    
    await application.save();
    
    // Log activity
    const activityLog = new ActivityLog({
      application: application._id,
      action: 'Application Shortlisted',
      fromStatus: 'applied',
      toStatus: 'shortlisted',
      performedBy: req.user._id,
      performedByRole: req.user.role,
      comment: shortlistingNotes || 'Application shortlisted by admin',
      isAutomated: false
    });
    await activityLog.save();
    
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error shortlisting application', error: error.message });
  }
});

module.exports = router;
