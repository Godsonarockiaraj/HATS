const mongoose = require('mongoose');

const keywordSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  type: {
    type: String,
    enum: ['required', 'preferred', 'negative'],
    required: true
  },
  keyword: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  weight: {
    type: Number,
    default: 1,
    min: 0.1,
    max: 10
  },
  category: {
    type: String,
    enum: ['skill', 'technology', 'education', 'experience', 'certification', 'language', 'other'],
    default: 'other'
  },
  aliases: [String],
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: Date
}, {
  timestamps: true
});

// Indexes for better query performance
keywordSchema.index({ job: 1, type: 1 });
keywordSchema.index({ keyword: 1, type: 1 });
keywordSchema.index({ category: 1 });
keywordSchema.index({ isActive: 1 });

// Compound index for unique keywords per job
keywordSchema.index({ job: 1, keyword: 1 }, { unique: true });

// Virtual for keyword display
keywordSchema.virtual('displayKeyword').get(function() {
  return this.keyword.charAt(0).toUpperCase() + this.keyword.slice(1);
});

// Static method to find matching keywords
keywordSchema.statics.findMatchingKeywords = function(jobId, text) {
  if (!text) return [];
  
  const normalizedText = text.toLowerCase();
  
  return this.find({
    job: jobId,
    isActive: true,
    $or: [
      { keyword: { $regex: normalizedText, $options: 'i' } },
      { aliases: { $regex: normalizedText, $options: 'i' } }
    ]
  });
};

// Static method to calculate keyword match score
keywordSchema.statics.calculateMatchScore = function(jobId, text) {
  return this.findMatchingKeywords(jobId, text)
    .then(keywords => {
      const requiredKeywords = keywords.filter(k => k.type === 'required');
      const preferredKeywords = keywords.filter(k => k.type === 'preferred');
      const negativeKeywords = keywords.filter(k => k.type === 'negative');
      
      let score = 0;
      
      // Calculate positive score
      requiredKeywords.forEach(k => score += k.weight * 2);
      preferredKeywords.forEach(k => score += k.weight);
      
      // Subtract negative score
      negativeKeywords.forEach(k => score -= k.weight);
      
      return {
        score: Math.max(0, score),
        requiredMatches: requiredKeywords.length,
        preferredMatches: preferredKeywords.length,
        negativeMatches: negativeKeywords.length,
        totalRequired: 0, // Will be populated by caller
        matchPercentage: 0 // Will be calculated by caller
      };
    });
};

// Instance method to increment usage
keywordSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

// Pre-save middleware to normalize keyword
keywordSchema.pre('save', function(next) {
  if (this.isModified('keyword')) {
    this.keyword = this.keyword.toLowerCase().trim();
  }
  next();
});

module.exports = mongoose.model('Keyword', keywordSchema);
