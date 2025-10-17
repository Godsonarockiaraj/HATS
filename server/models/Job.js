const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  isTechnical: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'closed'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customFields: {
    personalInfo: {
      enabled: { type: Boolean, default: false },
      required: { type: Boolean, default: false },
      fields: [{
        name: String,
        label: String,
        type: { type: String, enum: ['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'file'], default: 'text' },
        required: { type: Boolean, default: false },
        options: [String],
        placeholder: String,
        allowedTypes: [String],
        maxSize: String
      }]
    },
    professionalInfo: {
      enabled: { type: Boolean, default: false },
      required: { type: Boolean, default: false },
      fields: [{
        name: String,
        label: String,
        type: { type: String, enum: ['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'file'], default: 'text' },
        required: { type: Boolean, default: false },
        options: [String],
        placeholder: String,
        allowedTypes: [String],
        maxSize: String
      }]
    },
    education: {
      enabled: { type: Boolean, default: false },
      required: { type: Boolean, default: false },
      allowMultiple: { type: Boolean, default: true },
      fields: [{
        name: String,
        label: String,
        type: { type: String, enum: ['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'file'], default: 'text' },
        required: { type: Boolean, default: false },
        options: [String],
        placeholder: String,
        allowedTypes: [String],
        maxSize: String
      }]
    },
    workExperience: {
      enabled: { type: Boolean, default: false },
      required: { type: Boolean, default: false },
      allowMultiple: { type: Boolean, default: true },
      fields: [{
        name: String,
        label: String,
        type: { type: String, enum: ['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'file'], default: 'text' },
        required: { type: Boolean, default: false },
        options: [String],
        placeholder: String,
        allowedTypes: [String],
        maxSize: String
      }]
    },
    skills: {
      enabled: { type: Boolean, default: false },
      required: { type: Boolean, default: false },
      fields: [{
        name: String,
        label: String,
        type: { type: String, enum: ['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'file'], default: 'text' },
        required: { type: Boolean, default: false },
        options: [String],
        placeholder: String,
        allowedTypes: [String],
        maxSize: String,
        allowedTypes: [String],
        maxSize: String
      }]
    },
    resume: {
      enabled: { type: Boolean, default: false },
      required: { type: Boolean, default: false },
      fields: [{
        name: String,
        label: String,
        type: { type: String, enum: ['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'file'], default: 'file' },
        required: { type: Boolean, default: false },
        options: [String],
        placeholder: String,
        allowedTypes: [String],
        maxSize: String,
        allowedTypes: [String],
        maxSize: String
      }]
    },
    coverLetter: {
      enabled: { type: Boolean, default: false },
      required: { type: Boolean, default: false },
      fields: [{
        name: String,
        label: String,
        type: { type: String, enum: ['text', 'email', 'tel', 'textarea', 'select', 'checkbox'], default: 'textarea' },
        required: { type: Boolean, default: false },
        options: [String],
        placeholder: String,
        allowedTypes: [String],
        maxSize: String
      }]
    },
    additionalInfo: {
      enabled: { type: Boolean, default: false },
      required: { type: Boolean, default: false },
      fields: [{
        name: String,
        label: String,
        type: { type: String, enum: ['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'file'], default: 'text' },
        required: { type: Boolean, default: false },
        options: [String],
        placeholder: String,
        allowedTypes: [String],
        maxSize: String
      }]
    }
  },
  keywords: [String],
  requirements: [String],
  benefits: [String],
  salaryRange: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' }
  },
  location: {
    city: String,
    state: String,
    country: String,
    remote: { type: Boolean, default: false }
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'temporary'],
    default: 'full-time'
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    default: 'mid'
  },
  applicationDeadline: Date,
  startDate: Date,
  applicationCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  botSettings: {
    minimumScore: { type: Number, default: 5, min: 0, max: 100 }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ department: 1 });
jobSchema.index({ isTechnical: 1 });
jobSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Job', jobSchema);