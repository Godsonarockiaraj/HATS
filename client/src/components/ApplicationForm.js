import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { UserIcon, BriefcaseIcon, FileTextIcon, CheckIcon } from './ProfessionalIcons';
import '../styles/design-system.css';
import './ApplicationForm.css';

const ApplicationForm = ({ job, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    professionalInfo: {
      currentPosition: '',
      currentCompany: '',
      yearsOfExperience: 0,
      currentSalary: '',
      expectedSalary: '',
      noticePeriod: '',
      availability: ''
    },
    education: [{
      degree: '',
      institution: '',
      fieldOfStudy: '',
      graduationYear: new Date().getFullYear(),
      gpa: ''
    }],
    workExperience: [{
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    }],
    skills: [],
    coverLetter: '',
    additionalInfo: {
      whyInterested: '',
      relevantProjects: '',
      certifications: []
    }
  });

  const steps = [
    { id: 1, title: 'Personal Information', icon: UserIcon },
    { id: 2, title: 'Professional Details', icon: BriefcaseIcon },
    { id: 3, title: 'Education & Experience', icon: FileTextIcon },
    { id: 4, title: 'Additional Information', icon: CheckIcon }
  ];

  const handleInputChange = (section, field, value, index = null) => {
    setFormData(prev => {
      const newData = { ...prev };
      if (index !== null) {
        newData[section][index] = { ...newData[section][index], [field]: value };
      } else if (section === 'skills') {
        newData.skills = value;
      } else {
        newData[section] = { ...newData[section], [field]: value };
      }
      return newData;
    });
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: '',
        institution: '',
        fieldOfStudy: '',
        graduationYear: new Date().getFullYear(),
        gpa: ''
      }]
    }));
  };

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      }]
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const removeWorkExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const applicationData = {
        jobId: job._id,
        applicantId: user._id,
        formData,
        status: 'pending'
      };

      await api.post('/api/applications', applicationData);
      onSuccess();
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-step">
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    value={formData.personalInfo.fullName}
                    onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    value={formData.personalInfo.email}
                    onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.personalInfo.phone}
                    onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <select
                    value={formData.personalInfo.country}
                    onChange={(e) => handleInputChange('personalInfo', 'country', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="IN">India</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Address</label>
                  <textarea
                    value={formData.personalInfo.address}
                    onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                    className="form-input"
                    rows="3"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-step">
            <div className="form-section">
              <h3 className="section-title">Professional Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Current Position</label>
                  <input
                    type="text"
                    value={formData.professionalInfo.currentPosition}
                    onChange={(e) => handleInputChange('professionalInfo', 'currentPosition', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Senior Developer"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Current Company</label>
                  <input
                    type="text"
                    value={formData.professionalInfo.currentCompany}
                    onChange={(e) => handleInputChange('professionalInfo', 'currentCompany', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Tech Corp"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <select
                    value={formData.professionalInfo.yearsOfExperience}
                    onChange={(e) => handleInputChange('professionalInfo', 'yearsOfExperience', parseInt(e.target.value))}
                    className="form-input"
                  >
                    <option value={0}>0-1 years</option>
                    <option value={2}>2-3 years</option>
                    <option value={4}>4-5 years</option>
                    <option value={6}>6-10 years</option>
                    <option value={11}>10+ years</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Salary</label>
                  <input
                    type="text"
                    value={formData.professionalInfo.expectedSalary}
                    onChange={(e) => handleInputChange('professionalInfo', 'expectedSalary', e.target.value)}
                    className="form-input"
                    placeholder="e.g., $80,000 - $100,000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Notice Period</label>
                  <select
                    value={formData.professionalInfo.noticePeriod}
                    onChange={(e) => handleInputChange('professionalInfo', 'noticePeriod', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select Notice Period</option>
                    <option value="immediate">Immediate</option>
                    <option value="2weeks">2 weeks</option>
                    <option value="1month">1 month</option>
                    <option value="2months">2 months</option>
                    <option value="3months">3 months</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Availability</label>
                  <input
                    type="date"
                    value={formData.professionalInfo.availability}
                    onChange={(e) => handleInputChange('professionalInfo', 'availability', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-step">
            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">Education</h3>
                <button type="button" onClick={addEducation} className="btn btn-secondary btn-sm">
                  Add Education
                </button>
              </div>
              {formData.education.map((edu, index) => (
                <div key={index} className="education-item">
                  {formData.education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  )}
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Degree *</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleInputChange('education', 'degree', e.target.value, index)}
                        className="form-input"
                        placeholder="e.g., Bachelor of Science"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Institution *</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleInputChange('education', 'institution', e.target.value, index)}
                        className="form-input"
                        placeholder="e.g., University of Technology"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Field of Study</label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => handleInputChange('education', 'fieldOfStudy', e.target.value, index)}
                        className="form-input"
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Graduation Year</label>
                      <input
                        type="number"
                        value={edu.graduationYear}
                        onChange={(e) => handleInputChange('education', 'graduationYear', parseInt(e.target.value), index)}
                        className="form-input"
                        min="1950"
                        max="2030"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="form-section">
                <div className="section-header">
                  <h3 className="section-title">Work Experience</h3>
                  <button type="button" onClick={addWorkExperience} className="btn btn-secondary btn-sm">
                    Add Experience
                  </button>
                </div>
                {formData.workExperience.map((exp, index) => (
                  <div key={index} className="experience-item">
                    {formData.workExperience.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeWorkExperience(index)}
                        className="remove-btn"
                      >
                        ×
                      </button>
                    )}
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Company *</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleInputChange('workExperience', 'company', e.target.value, index)}
                          className="form-input"
                          placeholder="e.g., Tech Solutions Inc."
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Position *</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => handleInputChange('workExperience', 'position', e.target.value, index)}
                          className="form-input"
                          placeholder="e.g., Software Developer"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Start Date</label>
                        <input
                          type="date"
                          value={exp.startDate}
                          onChange={(e) => handleInputChange('workExperience', 'startDate', e.target.value, index)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">End Date</label>
                        <input
                          type="date"
                          value={exp.endDate}
                          onChange={(e) => handleInputChange('workExperience', 'endDate', e.target.value, index)}
                          className="form-input"
                          disabled={exp.current}
                        />
                      </div>
                      <div className="form-group full-width">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => handleInputChange('workExperience', 'current', e.target.checked, index)}
                          />
                          <span className="checkbox-text">Currently working here</span>
                        </label>
                      </div>
                      <div className="form-group full-width">
                        <label className="form-label">Description</label>
                        <textarea
                          value={exp.description}
                          onChange={(e) => handleInputChange('workExperience', 'description', e.target.value, index)}
                          className="form-input"
                          rows="3"
                          placeholder="Describe your responsibilities and achievements..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-step">
            <div className="form-section">
              <h3 className="section-title">Additional Information</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Why are you interested in this position?</label>
                  <textarea
                    value={formData.additionalInfo.whyInterested}
                    onChange={(e) => handleInputChange('additionalInfo', 'whyInterested', e.target.value)}
                    className="form-input"
                    rows="4"
                    placeholder="Tell us what excites you about this opportunity..."
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Relevant Projects or Portfolio</label>
                  <textarea
                    value={formData.additionalInfo.relevantProjects}
                    onChange={(e) => handleInputChange('additionalInfo', 'relevantProjects', e.target.value)}
                    className="form-input"
                    rows="4"
                    placeholder="Describe any relevant projects, GitHub repositories, or portfolio pieces..."
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Cover Letter</label>
                  <textarea
                    value={formData.coverLetter}
                    onChange={(e) => handleInputChange('coverLetter', '', e.target.value)}
                    className="form-input"
                    rows="6"
                    placeholder="Write a compelling cover letter that highlights your qualifications and enthusiasm for this role..."
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="application-form-container">
      <div className="application-form-header">
        <h2 className="form-title">Apply for {job.title}</h2>
        <p className="form-subtitle">Complete the application form to be considered for this position</p>
        <button onClick={onClose} className="close-btn">
          ×
        </button>
      </div>

      <div className="form-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
        <div className="progress-steps">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`progress-step ${currentStep >= step.id ? 'active' : ''}`}
              >
                <div className="step-icon">
                  <Icon />
                </div>
                <span className="step-title">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="application-form">
        {renderStepContent()}

        <div className="form-navigation">
          {currentStep > 1 && (
            <button type="button" onClick={prevStep} className="btn btn-secondary">
              Previous
            </button>
          )}
          
          <div className="navigation-spacer"></div>
          
          {currentStep < steps.length ? (
            <button type="button" onClick={nextStep} className="btn btn-primary">
              Next
            </button>
          ) : (
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;