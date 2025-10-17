const mongoose = require('mongoose');

const applicationFeedbackSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    overall: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    technical: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    experience: {
      type: Number,
      min: 1,
      max: 5
    },
    culture_fit: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  feedback: {
    strengths: [String],
    weaknesses: [String],
    recommendations: String,
    overall_impression: String,
    technical_assessment: String,
    communication_skills: String,
    additional_notes: String
  },
  recommendation: {
    type: String,
    enum: ['strong_hire', 'hire', 'no_hire', 'strong_no_hire'],
    required: true
  },
  interviewNotes: String,
  nextSteps: [String],
  isShared: {
    type: Boolean,
    default: false
  },
  sharedAt: Date
}, {
  timestamps: true
});

// Indexes
applicationFeedbackSchema.index({ application: 1 });
applicationFeedbackSchema.index({ reviewer: 1 });
applicationFeedbackSchema.index({ recommendation: 1 });

module.exports = mongoose.model('ApplicationFeedback', applicationFeedbackSchema);