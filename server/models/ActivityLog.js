const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'job_created',
      'job_updated',
      'job_deleted',
      'application_submitted',
      'application_reviewed',
      'application_shortlisted',
      'application_rejected',
      'interview_scheduled',
      'offer_made',
      'offer_accepted',
      'offer_declined',
      'profile_updated',
      'password_changed'
    ]
  },
  targetType: {
    type: String,
    enum: ['job', 'application', 'user', 'system'],
    default: 'system'
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetType'
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: String,
    additionalData: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
