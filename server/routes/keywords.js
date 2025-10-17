const express = require('express');
const Keyword = require('../models/Keyword');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// Get keywords for a job (accessible by admin and bot_mimic)
router.get('/job/:jobId', auth, requireRole(['admin', 'bot_mimic']), async (req, res) => {
  try {
    const keywords = await Keyword.findOne({ 
      job: req.params.jobId
    });
    res.json(keywords);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching keywords', error: error.message });
  }
});

// Create or update keywords for a job (admin only)
router.post('/job/:jobId', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { keywords, minimumScore } = req.body;
    
    // Validate input
    if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({ message: 'Keywords must be an array' });
    }
    
    // Validate each keyword object
    for (const keyword of keywords) {
      if (!keyword.keyword || typeof keyword.keyword !== 'string') {
        return res.status(400).json({ message: 'Each keyword must have a valid keyword string' });
      }
      if (keyword.weight && (keyword.weight < 1 || keyword.weight > 10)) {
        return res.status(400).json({ message: 'Keyword weight must be between 1 and 10' });
      }
    }
    
    let keywordDoc = await Keyword.findOne({ job: req.params.jobId });
    
    if (keywordDoc) {
      // Update existing keywords
      keywordDoc.keywords = keywords;
      keywordDoc.minimumScore = minimumScore || keywordDoc.minimumScore;
      await keywordDoc.save();
    } else {
      // Create new keywords
      keywordDoc = new Keyword({
        job: req.params.jobId,
        keywords: keywords,
        minimumScore: minimumScore || 5,
        createdBy: req.user._id
      });
      await keywordDoc.save();
    }
    
    res.json(keywordDoc);
  } catch (error) {
    console.error('Keywords save error:', error);
    res.status(500).json({ message: 'Error saving keywords', error: error.message });
  }
});

// Get all keywords (admin only)
router.get('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const keywords = await Keyword.find({})
      .populate('job', 'title department isTechnical')
      .populate('createdBy', 'name');
    res.json(keywords);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching keywords', error: error.message });
  }
});

// Delete keywords for a job (admin only)
router.delete('/job/:jobId', auth, requireRole(['admin']), async (req, res) => {
  try {
    const keywordDoc = await Keyword.findOneAndDelete({ job: req.params.jobId });
    
    if (!keywordDoc) {
      return res.status(404).json({ message: 'Keywords not found' });
    }
    
    res.json({ message: 'Keywords deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting keywords', error: error.message });
  }
});

module.exports = router;
