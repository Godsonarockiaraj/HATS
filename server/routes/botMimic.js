const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Keyword = require('../models/Keyword');
const ApplicationFeedback = require('../models/ApplicationFeedback');
const Notification = require('../models/Notification');
const { auth, requireRole } = require('../middleware/auth');
const PDFProcessingService = require('../services/pdfProcessingService');
const router = express.Router();

// Get pending applications for bot processing
router.get('/pending', auth, requireRole(['bot_mimic']), async (req, res) => {
  try {
    const pendingApplications = await Application.find({
      status: { $in: ['applied', 'pending_bot_review'] },
      'job.isTechnical': true,
      $or: [
        { 'shortlistingInfo.botProcessed': { $ne: true } },
        { 'shortlistingInfo.botProcessed': { $exists: false } }
      ]
    })
    .populate('applicant', 'name email phone')
    .populate('job', 'title department customFields')
    .sort({ createdAt: -1 });

    res.json(pendingApplications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending applications', error: error.message });
  }
});

// Get rejected applications for bot processing
router.get('/rejected', auth, requireRole(['bot_mimic']), async (req, res) => {
  try {
    // First try to find applications rejected by bot
    let allRejectedApplications = await Application.find({
      status: 'rejected',
      'shortlistingInfo.rejectedBy': 'bot_mimic'
    })
    .populate('applicantId', 'name email phone')
    .populate('jobId', 'title department customFields isTechnical')
    .sort({ 'shortlistingInfo.rejectedAt': -1 });

    // If no bot-rejected applications found, look for any rejected technical applications
    if (allRejectedApplications.length === 0) {
      console.log('No bot-rejected applications found, looking for any rejected technical applications...');
      allRejectedApplications = await Application.find({
        status: 'rejected'
      })
      .populate('applicantId', 'name email phone')
      .populate('jobId', 'title department customFields isTechnical')
      .sort({ updatedAt: -1 });
    }

    // Filter for technical jobs only
    const rejectedApplications = allRejectedApplications.filter(app => app.jobId && app.jobId.isTechnical);

    console.log('\n[DEBUG] REJECTED APPLICATIONS:');
    console.log(`Total rejected applications found: ${allRejectedApplications.length}`);
    console.log(`Technical rejected applications: ${rejectedApplications.length}`);
    
    if (allRejectedApplications.length > 0) {
      console.log('Sample rejected application:', {
        id: allRejectedApplications[0]._id,
        status: allRejectedApplications[0].status,
        rejectedBy: allRejectedApplications[0].shortlistingInfo?.rejectedBy,
        jobTitle: allRejectedApplications[0].jobId?.title,
        isTechnical: allRejectedApplications[0].jobId?.isTechnical
      });
    }

    res.json(rejectedApplications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rejected applications', error: error.message });
  }
});

// Process application with bot logic
router.post('/process/:applicationId', auth, requireRole(['bot_mimic']), async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { passMark, botNotes } = req.body;
    
    console.log('[BOT] Processing request:', { applicationId, passMark, botNotes });

    const application = await Application.findById(applicationId)
      .populate('jobId')
      .populate('applicantId');

    if (!application) {
      console.error('[ERROR] Application not found:', applicationId);
      return res.status(404).json({ message: 'Application not found' });
    }
    
    console.log('[SUCCESS] Application found:', {
      id: application._id,
      jobTitle: application.jobId?.title,
      applicantEmail: application.applicantId?.email,
      isTechnical: application.jobId?.isTechnical,
      hasSkills: !!application.formData?.skills
    });

    if (!application.jobId.isTechnical) {
      return res.status(400).json({ message: 'Bot can only process technical applications' });
    }

    // Get keywords for this job
    console.log('[SEARCH] Fetching keywords for job:', application.jobId._id);
    const keywords = await Keyword.find({ job: application.jobId._id });
    console.log('[RESULTS] Keywords found:', keywords.length);
    
    console.log('[DATA] Skills from application:', application.formData?.skills);

    // Simple keyword matching with skills
    let score = 0;
    const matchedKeywords = [];
    const skillsText = Array.isArray(application.formData?.skills) 
      ? application.formData.skills.join(' ').toLowerCase() 
      : (application.formData?.skills || '').toLowerCase();

    console.log('📝 Skills text for matching:', skillsText);

    // Check each keyword against skills
    for (const keyword of keywords) {
      const keywordText = keyword.keyword.toLowerCase();
      if (skillsText.includes(keywordText)) {
        console.log(`[MATCH] Keyword matched: ${keyword.keyword} (${keyword.type})`);
        
        matchedKeywords.push({
          keyword: keyword.keyword,
          type: keyword.type,
          weight: keyword.weight,
          category: keyword.category
        });

        // Add score based on keyword type
        if (keyword.type === 'required') {
          score += keyword.weight * 2; // Required keywords get double weight
        } else if (keyword.type === 'preferred') {
          score += keyword.weight;
        } else if (keyword.type === 'negative') {
          score -= keyword.weight; // Negative keywords reduce score
        }
      } else {
        console.log(`[NO MATCH] Keyword not matched: ${keyword.keyword}`);
      }
    }

    // Ensure score is not negative
    score = Math.max(0, score);

    // Get minimum score from request or job settings
    const minimumScore = passMark || application.jobId.botSettings?.minimumScore || 5;
    
    console.log(`[MINIMUM SCORE] Request passMark: ${passMark}`);
    console.log(`[MINIMUM SCORE] Job minimum score: ${application.jobId.botSettings?.minimumScore}`);
    console.log(`[MINIMUM SCORE] Using minimum score: ${minimumScore}`);
    
    console.log(`[SCORE] Final score: ${score}/${minimumScore}`);
    console.log(`[KEYWORDS] Matched keywords: ${matchedKeywords.length}`);

    // Update application with bot processing results
    const isPassing = score >= minimumScore;
    const newStatus = isPassing ? 'shortlisted' : 'rejected';
    const newStage = isPassing ? 'Shortlisted by Bot' : 'Rejected by Bot';
    
    console.log('\n[BOT RESULTS] PROCESSING COMPLETE:');
    console.log(`Application ID: ${applicationId}`);
    console.log(`Current Status: ${application.status}`);
    console.log(`Score: ${score}/${minimumScore}`);
    console.log(`Is Passing: ${isPassing}`);
    console.log(`New Status: ${newStatus}`);
    console.log(`New Stage: ${newStage}`);
    
    const updateData = {
      'shortlistingInfo.botProcessed': true,
      'shortlistingInfo.botProcessedAt': new Date(),
      'shortlistingInfo.passMark': passMark || 5,
      'shortlistingInfo.botNotes': botNotes || '',
      'shortlistingInfo.keywordMatches': matchedKeywords,
      'shortlistingInfo.shortlistingScore': score,
      'shortlistingInfo.matchDetails': {
        totalKeywords: keywords.length,
        matchedKeywords: matchedKeywords.length,
        scoreBreakdown: {
          required: matchedKeywords.filter(k => k.type === 'required').length,
          preferred: matchedKeywords.filter(k => k.type === 'preferred').length,
          negative: matchedKeywords.filter(k => k.type === 'negative').length
        }
      },
      'shortlistingInfo.botRecommendation': isPassing ? 'SHORTLIST' : 'REJECT',
      // Auto-update status based on score
      status: newStatus,
      currentStage: newStage,
      // Add rejection details if rejected
      ...(isPassing ? {} : {
        'shortlistingInfo.rejectedBy': 'bot_mimic',
        'shortlistingInfo.rejectedAt': new Date(),
        'shortlistingInfo.rejectionReason': `Score ${score}/${minimumScore} below pass mark`
      })
    };
    
    console.log(`Update Data:`, JSON.stringify(updateData, null, 2));

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    );
    
    console.log('\n[SUCCESS] APPLICATION UPDATED:');
    console.log(`Updated Status: ${updatedApplication.status}`);
    console.log(`Updated Stage: ${updatedApplication.currentStage}`);
    console.log(`Bot Processed: ${updatedApplication.shortlistingInfo?.botProcessed}`);
    console.log(`Bot Score: ${updatedApplication.shortlistingInfo?.shortlistingScore}`);
    console.log(`Bot Recommendation: ${updatedApplication.shortlistingInfo?.botRecommendation}`);
    console.log(`Rejected By: ${updatedApplication.shortlistingInfo?.rejectedBy}`);
    console.log(`Rejected At: ${updatedApplication.shortlistingInfo?.rejectedAt}`);
    console.log(`Rejection Reason: ${updatedApplication.shortlistingInfo?.rejectionReason}`);

    // Create notification for rejected applications
    if (!isPassing) {
      try {
        const notification = new Notification({
          user: application.applicantId._id,
          type: 'application_status',
          message: `Thank you for your application. Unfortunately, you have not been selected for ${application.jobId.title}. Your score was ${score}/${minimumScore}.`,
          link: `/applications/${application._id}`
        });

        await notification.save();
        console.log('[SUCCESS] Rejection notification saved');
      } catch (notificationError) {
        console.error('[WARNING] Error saving rejection notification (non-critical):', notificationError.message);
      }
    }

    // Add bot feedback with detailed match information
    const matchSummary = [];
    if (matchedKeywords.length > 0) {
      matchSummary.push(`Matched keywords: ${matchedKeywords.map(k => k.keyword).join(', ')}`);
    }
    
    const requiredMatches = matchedKeywords.filter(k => k.type === 'required');
    const preferredMatches = matchedKeywords.filter(k => k.type === 'preferred');
    const negativeMatches = matchedKeywords.filter(k => k.type === 'negative');
    
    if (requiredMatches.length > 0) {
      matchSummary.push(`Required: ${requiredMatches.map(k => k.keyword).join(', ')}`);
    }
    if (preferredMatches.length > 0) {
      matchSummary.push(`Preferred: ${preferredMatches.map(k => k.keyword).join(', ')}`);
    }
    if (negativeMatches.length > 0) {
      matchSummary.push(`Negative: ${negativeMatches.map(k => k.keyword).join(', ')}`);
    }

    try {
      const feedback = new ApplicationFeedback({
        applicationId: application._id,
        stage: updatedApplication.status,
        comment: `Bot processed application with keyword matching. Score: ${score}/${minimumScore}. ${matchSummary.join('; ')} ${botNotes || ''}`,
        addedBy: req.user._id,
        addedByRole: 'bot_mimic',
        isInternal: false
      });

      await feedback.save();
      console.log('[SUCCESS] Feedback saved successfully');
    } catch (feedbackError) {
      console.error('[WARNING] Error saving feedback (non-critical):', feedbackError.message);
      // Continue processing even if feedback fails
    }

    res.json({
      message: isPassing 
        ? 'Application processed and SHORTLISTED automatically' 
        : 'Application processed and REJECTED automatically',
      application: updatedApplication,
      score,
      minimumScore,
      matchedKeywords,
      matchDetails: {
        totalKeywords: keywords.length,
        matchedKeywords: matchedKeywords.length,
        scoreBreakdown: {
          required: requiredMatches.length,
          preferred: preferredMatches.length,
          negative: negativeMatches.length
        }
      },
      recommendation: isPassing ? 'SHORTLIST' : 'REJECT',
      recommendationText: isPassing 
        ? `✅ SHORTLISTED (Score: ${score}/${minimumScore})`
        : `❌ REJECTED (Score: ${score}/${minimumScore})`,
      status: isPassing ? 'shortlisted' : 'rejected'
    });

  } catch (error) {
    console.error('❌ Bot processing error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error processing application', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get keywords for a specific job (bot mimic can view and add)
router.get('/keywords/:jobId', auth, requireRole(['admin', 'bot_mimic']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const keywords = await Keyword.find({ job: jobId }).sort({ category: 1, keyword: 1 });
    
    // Get minimum score from job
    const Job = require('../models/Job');
    const job = await Job.findById(jobId);
    const minimumScore = job?.botSettings?.minimumScore || 5;
    
    res.json({
      keywords: keywords,
      minimumScore: minimumScore
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching keywords', error: error.message });
  }
});

// Add keyword for a job (bot mimic can add)
router.post('/keywords', auth, requireRole(['admin', 'bot_mimic']), async (req, res) => {
  try {
    const { jobId, keyword, category, weight } = req.body;

    // Find existing keyword document for this job
    let keywordDoc = await Keyword.findOne({ job: jobId });
    
    if (!keywordDoc) {
      // Create new keyword document
      keywordDoc = new Keyword({
        job: jobId,
        createdBy: req.user._id,
        keywords: []
      });
    }

    // Add new keyword to the array
    keywordDoc.keywords.push({
      keyword,
      category,
      weight: weight || 5
    });

    await keywordDoc.save();
    res.status(201).json(keywordDoc);
  } catch (error) {
    res.status(500).json({ message: 'Error adding keyword', error: error.message });
  }
});

// Save keywords for a specific job (bulk save from KeywordManager)
router.post('/keywords/job/:jobId', auth, requireRole(['admin', 'bot_mimic']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { keywords, minimumScore } = req.body;
    
    console.log('Saving keywords for job:', jobId);
    console.log('Keywords data:', keywords);
    console.log('Minimum score:', minimumScore);

    // First, delete existing keywords for this job
    await Keyword.deleteMany({ job: jobId });

    // Create new keyword documents for each keyword
    const keywordDocs = [];
    for (const keywordData of keywords) {
      console.log('Processing keyword:', keywordData);
      
      // Validate required fields
      if (!keywordData.keyword || !keywordData.keyword.trim()) {
        console.error('Missing keyword field:', keywordData);
        return res.status(400).json({ 
          message: 'Keyword field is required', 
          error: 'Missing keyword field' 
        });
      }
      
      if (!keywordData.type) {
        console.error('Missing type field:', keywordData);
        return res.status(400).json({ 
          message: 'Type field is required', 
          error: 'Missing type field' 
        });
      }
      
      const keyword = new Keyword({
        job: jobId,
        keyword: keywordData.keyword.trim(),
        type: keywordData.type,
        weight: keywordData.weight || 1,
        category: keywordData.category || 'other',
        createdBy: req.user._id,
        isActive: true
      });
      
      console.log('Saving keyword:', keyword);
      await keyword.save();
      keywordDocs.push(keyword);
    }

    // Update job with minimum score if provided
    if (minimumScore !== undefined) {
      const Job = require('../models/Job');
      await Job.findByIdAndUpdate(jobId, { 
        $set: { 'botSettings.minimumScore': minimumScore } 
      });
    }

    res.json({ 
      message: 'Keywords saved successfully',
      keywords: keywordDocs,
      minimumScore
    });
  } catch (error) {
    console.error('Error saving keywords:', error);
    res.status(500).json({ message: 'Error saving keywords', error: error.message });
  }
});

// Update keyword (bot mimic can edit)
router.put('/keywords/:keywordId', auth, requireRole(['admin', 'bot_mimic']), async (req, res) => {
  try {
    const { keywordId } = req.params;
    const { keyword, category, weight } = req.body;

    const updatedKeyword = await Keyword.findByIdAndUpdate(
      keywordId,
      { keyword, category, weight },
      { new: true }
    );

    if (!updatedKeyword) {
      return res.status(404).json({ message: 'Keyword not found' });
    }

    res.json(updatedKeyword);
  } catch (error) {
    res.status(500).json({ message: 'Error updating keyword', error: error.message });
  }
});

// Delete keyword (bot mimic can delete)
router.delete('/keywords/:keywordId', auth, requireRole(['admin', 'bot_mimic']), async (req, res) => {
  try {
    const { keywordId } = req.params;
    await Keyword.findByIdAndDelete(keywordId);
    res.json({ message: 'Keyword deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting keyword', error: error.message });
  }
});

// Process all technical applications (bulk processing)
router.post('/process', auth, requireRole(['bot_mimic']), async (req, res) => {
  try {
    console.log('Bot processing request from user:', req.user.email, 'role:', req.user.role);
    const { jobId, passMark } = req.body;
    
    // Build query based on whether jobId is provided
    let query = {
      status: { $in: ['applied', 'pending_bot_review'] },
      $or: [
        { 'shortlistingInfo.botProcessed': { $ne: true } },
        { 'shortlistingInfo.botProcessed': { $exists: false } }
      ]
    };

    // If jobId is provided, filter by specific job
    if (jobId) {
      query.jobId = jobId;
    }

    // Find applications
    const allApplications = await Application.find(query)
      .populate('jobId')
      .populate('applicantId');

    // Filter for technical applications
    const technicalApplications = allApplications.filter(app => app.jobId && app.jobId.isTechnical);
    
    console.log(`Found ${allApplications.length} total applications, ${technicalApplications.length} technical applications`);
    
    if (technicalApplications.length === 0) {
      const jobMessage = jobId ? ` for the selected job` : '';
      return res.json({ 
        message: `No technical applications found for processing${jobMessage}`, 
        results: [],
        totalFound: allApplications.length,
        technicalFound: 0,
        jobId: jobId || null
      });
    }

    const results = [];

    for (const application of technicalApplications) {
      try {
        // Get keywords for this job
        const keywords = await Keyword.find({ job: application.jobId._id });

        console.log(`Processing application for ${application.applicantId.name || application.applicantId.email} - Job: ${application.jobId.title}`);
        console.log(`Found ${keywords.length} keyword documents for this job`);

        // Get minimum score from request or job settings
        const minimumScore = passMark || application.jobId.botSettings?.minimumScore || 5;
        console.log(`Request passMark: ${passMark}, Job minimum score: ${application.jobId.botSettings?.minimumScore}, using: ${minimumScore}`);

        // Process application with skills-only matching (same logic as individual processing)
        let score = 0;
        const matchedKeywords = [];
        const skillsText = Array.isArray(application.formData?.skills) 
          ? application.formData.skills.join(' ').toLowerCase() 
          : (application.formData?.skills || '').toLowerCase();

        console.log('Skills text for matching:', skillsText);

        for (const keyword of keywords) {
          const keywordText = keyword.keyword.toLowerCase();
          if (skillsText.includes(keywordText)) {
            console.log(`Keyword matched: ${keyword.keyword} (${keyword.type})`);
            
            matchedKeywords.push({
              keyword: keyword.keyword,
              type: keyword.type,
              weight: keyword.weight,
              category: keyword.category
            });

            if (keyword.type === 'required') {
              score += keyword.weight * 2;
            } else if (keyword.type === 'preferred') {
              score += keyword.weight;
            } else if (keyword.type === 'negative') {
              score -= keyword.weight;
            }
          } else {
            console.log(`Keyword not matched: ${keyword.keyword}`);
          }
        }

        score = Math.max(0, score);

        // Auto-update status based on score vs minimum score
        const isPassing = score >= minimumScore;
        const newStatus = isPassing ? 'shortlisted' : 'rejected';
        const newStage = isPassing ? 'Shortlisted by Bot' : 'Rejected by Bot';
        
        console.log(`\n🤖 BOT PROCESSING RESULTS:`);
        console.log(`Application ID: ${application._id}`);
        console.log(`Score: ${score}/${minimumScore}`);
        console.log(`Is Passing: ${isPassing}`);
        console.log(`New Status: ${newStatus}`);
        console.log(`New Stage: ${newStage}`);

        // Update application with bot processing results (with automatic status update)
        const updateData = {
          'shortlistingInfo.botProcessed': true,
          'shortlistingInfo.botProcessedAt': new Date(),
          'shortlistingInfo.passMark': minimumScore,
          'shortlistingInfo.keywordMatches': matchedKeywords,
          'shortlistingInfo.shortlistingScore': score,
          'shortlistingInfo.matchDetails': {
            totalKeywords: keywords.length,
            matchedKeywords: matchedKeywords.length,
            scoreBreakdown: {
              required: matchedKeywords.filter(k => k.type === 'required').length,
              preferred: matchedKeywords.filter(k => k.type === 'preferred').length,
              negative: matchedKeywords.filter(k => k.type === 'negative').length
            }
          },
          'shortlistingInfo.botRecommendation': isPassing ? 'SHORTLIST' : 'REJECT',
          // Auto-update status based on score
          status: newStatus,
          currentStage: newStage,
          // Add rejection details if rejected
          ...(isPassing ? {} : {
            'shortlistingInfo.rejectedBy': 'bot_mimic',
            'shortlistingInfo.rejectedAt': new Date(),
            'shortlistingInfo.rejectionReason': `Score ${score}/${minimumScore} below pass mark`
          })
        };

        // Create status message for display
        const statusMessage = isPassing 
          ? `✅ AUTOMATICALLY SHORTLISTED - Score: ${score}/${minimumScore}`
          : `❌ AUTOMATICALLY REJECTED - Score: ${score}/${minimumScore}`;

        const updatedApplication = await Application.findByIdAndUpdate(
          application._id,
          updateData,
          { new: true }
        );

        // Create notification for rejected applications
        if (!isPassing) {
          const notification = new Notification({
            userId: application.applicantId._id,
            applicationId: application._id,
            type: 'rejected',
            title: 'Application Update',
            message: `Thank you for your application. Unfortunately, you have not been selected for ${application.jobId.title}. Your score was ${score}/${passMark}.`,
            metadata: {
              rejectedBy: 'bot_mimic',
              rejectionReason: `Score ${score}/${passMark} below pass mark`,
              score: score,
              passMark: passMark
            }
          });

          await notification.save();
        } else {
          // Create notification for shortlisted applications
          const notification = new Notification({
            userId: application.applicantId._id,
            applicationId: application._id,
            type: 'shortlisted',
            title: 'Application Shortlisted!',
            message: `Congratulations! Your application for ${application.jobId.title} has been shortlisted. Your score was ${score}/${minimumScore}.`,
            metadata: {
              shortlistedBy: 'bot_mimic',
              score: score,
              passMark: minimumScore
            }
          });

          await notification.save();
        }

        // Add bot feedback with detailed match information
        const matchSummary = [];
        if (matchedKeywords.length > 0) {
          matchSummary.push(`Matched keywords: ${matchedKeywords.map(k => k.keyword).join(', ')}`);
        }

        const feedback = new ApplicationFeedback({
          applicationId: application._id,
          stage: updatedApplication.status,
          comment: `Bot processed application with skills keyword matching. Score: ${score}/${minimumScore}. ${matchSummary.join('; ')}`,
          addedBy: req.user._id,
          addedByRole: 'bot_mimic',
          isInternal: false
        });

        await feedback.save();

        results.push({
          applicationId: application._id,
          applicantName: application.applicantId.name,
          jobTitle: application.jobId.title,
          score,
          minimumScore,
          status: updatedApplication.status,
          statusMessage,
          matchedKeywords,
          matchDetails: {
            totalKeywords: keywords.length,
            matchedKeywords: matchedKeywords.length,
            scoreBreakdown: {
              required: matchedKeywords.filter(k => k.type === 'required').length,
              preferred: matchedKeywords.filter(k => k.type === 'preferred').length,
              negative: matchedKeywords.filter(k => k.type === 'negative').length
            }
          },
          recommendation: isPassing ? 'SHORTLIST' : 'REJECT',
          recommendationText: isPassing 
            ? `✅ AUTOMATICALLY SHORTLISTED (Score: ${score}/${minimumScore})`
            : `❌ AUTOMATICALLY REJECTED (Score: ${score}/${minimumScore})`
        });

      } catch (error) {
        console.error(`Error processing application ${application._id}:`, error);
        results.push({
          applicationId: application._id,
          error: error.message
        });
      }
    }

    res.json({
      message: `Automatically processed ${results.length} applications with status updates`,
      results,
      summary: {
        total: results.length,
        shortlisted: results.filter(r => r.recommendation === 'SHORTLIST').length,
        rejected: results.filter(r => r.recommendation === 'REJECT').length,
        errors: results.filter(r => r.error).length
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Error processing applications', error: error.message });
  }
});

// Accept application (bot_mimic only)
router.post('/accept/:applicationId', auth, requireRole(['bot_mimic']), async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { notes } = req.body;

    const application = await Application.findById(applicationId)
      .populate('applicant', 'name email')
      .populate('job', 'title department');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Update application status
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      {
        status: 'shortlisted',
        currentStage: 'Shortlisted by Bot',
        'shortlistingInfo.shortlistedBy': 'bot_mimic',
        'shortlistingInfo.shortlistedAt': new Date(),
        'shortlistingInfo.acceptanceNotes': notes || 'Accepted by bot processing'
      },
      { new: true }
    );

    // Create notification for applicant
    const notification = new Notification({
      userId: application.applicantId._id,
      applicationId: application._id,
      type: 'shortlisted',
      title: 'Application Shortlisted!',
      message: `Congratulations! Your application for ${application.jobId.title} has been shortlisted.`,
      metadata: {
        shortlistedBy: 'bot_mimic',
        acceptanceNotes: notes || 'Accepted by bot processing'
      }
    });

    await notification.save();

    // Add bot feedback
    const feedback = new ApplicationFeedback({
      applicationId: application._id,
      stage: 'shortlisted',
      comment: `Application accepted by bot. Notes: ${notes || 'Accepted by bot processing'}`,
      addedBy: req.user._id,
      addedByRole: 'bot_mimic',
      isInternal: false
    });

    await feedback.save();

    res.json({
      message: 'Application accepted successfully',
      application: updatedApplication
    });

  } catch (error) {
    res.status(500).json({ message: 'Error accepting application', error: error.message });
  }
});

// Reject application (bot_mimic only)
router.post('/reject/:applicationId', auth, requireRole(['bot_mimic']), async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body;

    const application = await Application.findById(applicationId)
      .populate('applicant', 'name email')
      .populate('job', 'title department');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Update application status
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      {
        status: 'rejected',
        currentStage: 'Rejected by Bot',
        'shortlistingInfo.rejectedBy': 'bot_mimic',
        'shortlistingInfo.rejectedAt': new Date(),
        'shortlistingInfo.rejectionReason': reason || 'Not selected by bot processing'
      },
      { new: true }
    );

    // Create notification for applicant
    const notification = new Notification({
      userId: application.applicantId._id,
      applicationId: application._id,
      type: 'rejected',
      title: 'Application Update',
      message: `Thank you for your application. Unfortunately, you have not been selected for ${application.jobId.title}.`,
      metadata: {
        rejectedBy: 'bot_mimic',
        rejectionReason: reason || 'Not selected by bot processing'
      }
    });

    await notification.save();

    // Add bot feedback
    const feedback = new ApplicationFeedback({
      applicationId: application._id,
      stage: 'rejected',
      comment: `Application rejected by bot. Reason: ${reason || 'Not selected by bot processing'}`,
      addedBy: req.user._id,
      addedByRole: 'bot_mimic',
      isInternal: false
    });

    await feedback.save();

    res.json({
      message: 'Application rejected successfully',
      application: updatedApplication
    });

  } catch (error) {
    res.status(500).json({ message: 'Error rejecting application', error: error.message });
  }
});

// Reprocess rejected application
router.post('/reprocess/:applicationId', auth, requireRole(['bot_mimic']), async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { passMark, botNotes } = req.body;

    console.log(`\n🔄 REPROCESSING APPLICATION:`);
    console.log(`Application ID: ${applicationId}`);
    console.log(`Pass Mark: ${passMark}`);
    console.log(`Bot Notes: ${botNotes}`);
    console.log(`User: ${req.user.email} (${req.user.role})`);

    // Verify user has correct role
    if (req.user.role !== 'bot_mimic') {
      console.log('❌ User does not have bot_mimic role');
      return res.status(403).json({ 
        message: 'Access denied. Only bot_mimic users can reprocess applications.',
        userRole: req.user.role,
        requiredRole: 'bot_mimic'
      });
    }

    const application = await Application.findById(applicationId)
      .populate('applicantId', 'name email phone')
      .populate('jobId', 'title department customFields isTechnical');

    if (!application) {
      console.log('❌ Application not found');
      return res.status(404).json({ message: 'Application not found' });
    }

    console.log(`Application found: ${application.applicantIdId?.name || application.applicantIdId?.email} - ${application.jobIdId?.title}`);
    console.log(`Current status: ${application.status}`);
    console.log(`Is technical job: ${application.jobIdId?.isTechnical}`);

    // Check if it's a technical job
    if (!application.jobIdId?.isTechnical) {
      console.log('❌ Not a technical job');
      return res.status(400).json({ message: 'Can only reprocess technical applications' });
    }

    // Get keywords for the job
    const keywords = await Keyword.find({ job: application.jobIdId._id });
    console.log(`Keywords found: ${keywords.length}`);
    
    if (!keywords || keywords.length === 0) {
      console.log('❌ No keywords configured for this job');
      return res.status(400).json({ 
        message: 'No keywords configured for this job. Please add keywords first.',
        jobId: application.jobId._id,
        jobTitle: application.jobId.title
      });
    }

    // Process application with bot logic
    console.log('🤖 Starting bot processing...');
    let processingResult;
    try {
      processingResult = await PDFProcessingService.processApplication(
        application, 
        keywords, 
        passMark || 5
      );
      console.log('✅ Bot processing completed successfully');
    } catch (processingError) {
      console.error('❌ Bot processing failed:', processingError);
      return res.status(500).json({ 
        message: 'Error processing application with bot', 
        error: processingError.message,
        details: 'PDF processing or keyword matching failed'
      });
    }
    
    const { score, status, currentStage, matchedKeywords, matchDetails } = processingResult;
    console.log(`Bot processing results - Score: ${score}, Status: ${status}`);

    // Update application with bot processing results (score only, no status change)
    const updateData = {
      'shortlistingInfo.botProcessed': true,
      'shortlistingInfo.botProcessedAt': new Date(),
      'shortlistingInfo.passMark': passMark || 5,
      'shortlistingInfo.botNotes': botNotes || '',
      'shortlistingInfo.keywordMatches': matchedKeywords,
      'shortlistingInfo.shortlistingScore': score,
      'shortlistingInfo.matchDetails': matchDetails,
      'shortlistingInfo.botRecommendation': score >= (passMark || 5) ? 'SHORTLIST' : 'REJECT',
      // Reset rejection info since we're reprocessing
      'shortlistingInfo.rejectedBy': undefined,
      'shortlistingInfo.rejectedAt': undefined,
      'shortlistingInfo.rejectionReason': undefined,
      // Don't change status or currentStage - let user decide manually
    };

    console.log('💾 Updating application in database...');
    let updatedApplication;
    try {
      updatedApplication = await Application.findByIdAndUpdate(
        applicationId,
        updateData,
        { new: true }
      );
      console.log('✅ Application updated successfully');
    } catch (updateError) {
      console.error('❌ Database update failed:', updateError);
      return res.status(500).json({ 
        message: 'Error updating application in database', 
        error: updateError.message 
      });
    }

    // Add bot feedback with detailed match information
    const matchSummary = [];
    if (matchDetails.exactMatches.length > 0) {
      matchSummary.push(`Exact matches: ${matchDetails.exactMatches.map(m => m.keyword).join(', ')}`);
    }
    if (matchDetails.wordMatches.length > 0) {
      matchSummary.push(`Word matches: ${matchDetails.wordMatches.map(m => m.keyword).join(', ')}`);
    }
    if (matchDetails.ngramMatches.length > 0) {
      matchSummary.push(`Phrase matches: ${matchDetails.ngramMatches.map(m => m.keyword).join(', ')}`);
    }
    if (matchDetails.partialMatches.length > 0) {
      matchSummary.push(`Partial matches: ${matchDetails.partialMatches.map(m => m.keyword).join(', ')}`);
    }

    console.log('📝 Creating feedback...');
    try {
      const feedback = new ApplicationFeedback({
        applicationId: application._id,
        stage: 'reprocessed',
        comment: `Application reprocessed by bot with advanced keyword matching. Score: ${score}/${passMark || 5}. ${matchSummary.join('; ')}`,
        addedBy: req.user._id,
        addedByRole: 'bot_mimic',
        isInternal: false
      });

      await feedback.save();
      console.log('✅ Feedback created successfully');
    } catch (feedbackError) {
      console.error('❌ Feedback creation failed:', feedbackError);
      // Don't fail the entire request for feedback error
      console.log('⚠️ Continuing without feedback...');
    }

    res.json({
      message: 'Application reprocessed successfully - Manual decision required',
      application: updatedApplication,
      score,
      passMark: passMark || 5,
      matchedKeywords,
      matchDetails,
      recommendation: score >= (passMark || 5) ? 'SHORTLIST' : 'REJECT',
      recommendationText: score >= (passMark || 50) 
        ? `✅ RECOMMENDED FOR SHORTLISTING (Score: ${score}/${passMark || 5})`
        : `❌ RECOMMENDED FOR REJECTION (Score: ${score}/${passMark || 5})`
    });

  } catch (error) {
    res.status(500).json({ message: 'Error reprocessing application', error: error.message });
  }
});

// Get bot processing statistics
router.get('/stats', auth, requireRole(['bot_mimic']), async (req, res) => {
  try {
    const totalProcessed = await Application.countDocuments({
      'shortlistingInfo.botProcessed': true
    });

    const shortlisted = await Application.countDocuments({
      'shortlistingInfo.botProcessed': true,
      status: 'shortlisted'
    });

    const rejected = await Application.countDocuments({
      'shortlistingInfo.botProcessed': true,
      status: 'rejected'
    });

    const pending = await Application.countDocuments({
      'jobId.isTechnical': true,
      status: { $in: ['pending', 'applied', 'pending_bot_review'] },
      $or: [
        { 'shortlistingInfo.botProcessed': { $ne: true } },
        { 'shortlistingInfo.botProcessed': { $exists: false } }
      ]
    });

    console.log('[DEBUG] Bot stats calculated:', {
      totalProcessed,
      shortlisted,
      rejected,
      pending
    });

    res.json({
      totalProcessed,
      shortlisted,
      rejected,
      pending
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bot statistics', error: error.message });
  }
});

module.exports = router;