const express = require('express');
const Job = require('../models/Job');
const { auth, requireRole } = require('../middleware/auth');
const NotificationService = require('../services/notificationService');
const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'active' });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job', error: error.message });
  }
});

// Create job (admin only)
router.post('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    console.log('📝 Job creation request received');
    console.log('User:', req.user.email, 'Role:', req.user.role);
    console.log('Request body keys:', Object.keys(req.body));
    
    const { title, description, department, isTechnical, customFields } = req.body;
    
    console.log('Creating job with data:', {
      title,
      description,
      department,
      isTechnical,
      customFields: customFields || {},
      createdBy: req.user._id
    });

    const job = new Job({
      title,
      description,
      department,
      isTechnical,
      customFields: customFields || {},
      createdBy: req.user._id
    });

    console.log('Job created, saving...');
    await job.save();
    console.log('Job saved with ID:', job._id);

    // Create notification for new job posted (for all applicants)
    console.log('Creating notification for new job...');
    try {
      await NotificationService.createNewJobNotification(job);
      console.log('Notification created successfully');
    } catch (notificationError) {
      console.error('Error creating new job notification:', notificationError);
      // Don't fail the request if notification creation fails
    }

    console.log('✅ Job created successfully:', job._id);
    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error creating job', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update job (admin and bot_mimic)
router.put('/:id', auth, requireRole(['admin', 'bot_mimic']), async (req, res) => {
  try {
    const { title, description, department, isTechnical, status, customFields, botSettings } = req.body;
    
    const updateData = { title, description, department, isTechnical, status };
    if (customFields !== undefined) {
      updateData.customFields = customFields;
    }
    if (botSettings !== undefined) {
      updateData.botSettings = botSettings;
    }
    
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error updating job', error: error.message });
  }
});

// Delete job (admin only)
router.delete('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
});

module.exports = router;
