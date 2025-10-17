const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  formData: {
    personalInfo: {
      fullName: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    professionalInfo: {
      currentPosition: String,
      currentCompany: String,
      yearsOfExperience: Number,
      currentSalary: String,
      expectedSalary: String,
      noticePeriod: String,
      availability: Date
    },
    education: [{
      degree: String,
      institution: String,
      fieldOfStudy: String,
      graduationYear: Number,
      gpa: String
    }],
    workExperience: [{
      company: String,
      position: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
      description: String
    }],
    skills: [String],
    coverLetter: String,
    additionalInfo: {
      whyInterested: String,
      relevantProjects: String,
      certifications: [String]
    },
    resume: {
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      path: String
    }
  },
  status: {
    type: String,
    enum: ['pending', 'shortlisted', 'rejected', 'interview_scheduled', 'offer', 'withdrawn'],
    default: 'pending'
  },
  shortlistingInfo: {
    isShortlisted: {
      type: Boolean,
      default: false
    },
    shortlistedBy: {
      type: String,
      enum: ['bot_mimic', 'admin', null],
      default: null
    },
    shortlistedAt: Date,
    rejectionReason: String,
    shortlistingScore: Number,
    keywords: [String],
    matchPercentage: Number
  },
  interviewInfo: {
    scheduledDate: Date,
    interviewer: String,
    location: String,
    meetingLink: String,
    notes: String,
    feedback: String
  },
  offerInfo: {
    offerDate: Date,
    salary: Number,
    startDate: Date,
    benefits: [String],
    notes: String,
    accepted: Boolean,
    acceptedAt: Date
  },
  notes: [{
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });
applicationSchema.index({ 'shortlistingInfo.shortlistedBy': 1 });

module.exports = mongoose.model('Application', applicationSchema);