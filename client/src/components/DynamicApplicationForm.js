import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './DynamicApplicationForm.css';

const DynamicApplicationForm = ({ job, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [resumeFile, setResumeFile] = useState(null);
  const resumeFileRef = useRef(null);

  // Initialize form data based on custom fields
  React.useEffect(() => {
    console.log('=== JOB DEBUG ===');
    console.log('Job object:', job);
    console.log('Job customFields:', job?.customFields);
    console.log('Resume config:', job?.customFields?.resume);
    console.log('=== END JOB DEBUG ===');
    
    const initialData = {};
    const customFields = job?.customFields || {};
    
    Object.keys(customFields).forEach(sectionName => {
      const section = customFields[sectionName];
      if (section.enabled) {
        if (section.fields) {
          initialData[sectionName] = {};
          section.fields.forEach(field => {
            if (field.type === 'checkbox') {
              initialData[sectionName][field.name] = [];
            } else if (section.allowMultiple) {
              initialData[sectionName] = [{}];
            } else {
              initialData[sectionName][field.name] = field.type === 'number' ? 0 : '';
            }
          });
        } else if (sectionName === 'skills' && section.allowMultiple) {
          initialData[sectionName] = [];
        } else if (sectionName === 'resume') {
          // Resume section doesn't need form data initialization since it's handled separately
          initialData[sectionName] = {};
        } else {
          initialData[sectionName] = '';
        }
      }
    });
    
    setFormData(initialData);
  }, [job]);

  const handleInputChange = (section, field, value, index = null) => {
    setFormData(prev => {
      const newData = { ...prev };
      if (index !== null) {
        if (!newData[section]) newData[section] = [];
        if (!newData[section][index]) newData[section][index] = {};
        newData[section][index] = { ...newData[section][index], [field]: value };
      } else {
        newData[section] = { ...newData[section], [field]: value };
      }
      return newData;
    });
  };

  const handleArrayItemChange = (section, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addArrayItem = (section) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), {}]
    }));
  };

  const removeArrayItem = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  // Validate required fields
  const validateForm = () => {
    const customFields = job?.customFields || {};
    const errors = [];

    Object.keys(customFields).forEach(sectionName => {
      const section = customFields[sectionName];
      if (section.enabled && section.required) {
        if (section.fields) {
          section.fields.forEach(field => {
            if (field.required) {
              const value = formData[sectionName]?.[field.name];
              if (!value || (typeof value === 'string' && value.trim() === '') || 
                  (Array.isArray(value) && value.length === 0)) {
                errors.push(`${field.label || field.name} is required`);
              }
            }
          });
        } else if (sectionName === 'skills' && section.required) {
          if (!formData[sectionName] || formData[sectionName].length === 0) {
            errors.push('Skills are required');
          }
        } else if (section.required) {
          const value = formData[sectionName];
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors.push(`${sectionName} is required`);
          }
        }
      }
    });

    // Skip resume validation here since it's handled in handleSubmit
    console.log('=== VALIDATION DEBUG (SKIPPING RESUME) ===');
    console.log('customFields.resume:', customFields.resume);
    console.log('customFields.resume?.enabled:', customFields.resume?.enabled);
    console.log('customFields.resume?.required:', customFields.resume?.required);
    console.log('customFields.resume?.fields:', customFields.resume?.fields);
    console.log('Skipping resume validation in validateForm()');
    console.log('=== END VALIDATION DEBUG ===');

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get the current file from either state or ref
    const currentFile = resumeFile || resumeFileRef.current;
    console.log('=== SUBMIT DEBUG ===');
    console.log('resumeFile state:', resumeFile);
    console.log('resumeFileRef.current:', resumeFileRef.current);
    console.log('currentFile:', currentFile);
    console.log('currentFile.name:', currentFile?.name);
    
    // Check if resume is required and validate
    const customFields = job?.customFields || {};
    const resumeSection = customFields.resume;
    const resumeRequired = resumeSection?.enabled && (
      resumeSection?.required || 
      resumeSection?.fields?.some(field => field.required && field.type === 'file')
    );
    console.log('resumeRequired:', resumeRequired);
    console.log('resumeSection:', resumeSection);
    
    if (resumeRequired && (!currentFile || !currentFile.name)) {
      alert('Please select a resume file');
      return;
    }
    
    // Validate form (excluding resume since we handled it above)
    const validationErrors = validateForm();
    console.log('Validation errors:', validationErrors);
    
    if (validationErrors.length > 0) {
      alert('Please fill in all required fields:\n' + validationErrors.join('\n'));
      return;
    }

    // Check if user is logged in and has applicant role
    if (!user) {
      alert('Please log in to submit an application');
      return;
    }

    if (user.role !== 'applicant') {
      alert(`Only applicants can submit job applications. Your current role is: ${user.role}`);
      return;
    }

    console.log('User authenticated:', user);
    console.log('User role:', user.role);

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('jobId', job._id);
      
      // Add all form data
      Object.keys(formData).forEach(section => {
        formDataToSend.append(section, JSON.stringify(formData[section]));
      });
      
      const fileToUpload = resumeFile || resumeFileRef.current;
      console.log('File to upload:', fileToUpload);
      if (fileToUpload) {
        formDataToSend.append('resume', fileToUpload);
        console.log('✅ Resume file added to form data');
      } else {
        console.log('❌ No resume file to upload');
      }

      await api.post('/api/applications', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onSuccess();
    } catch (error) {
      console.error('Error submitting application:', error);
      if (error.response?.status === 403) {
        alert('Access denied. Please make sure you are logged in as an applicant.');
      } else if (error.response?.status === 401) {
        alert('Please log in to submit an application.');
      } else if (error.response?.status === 400 && error.response?.data?.error === 'DUPLICATE_APPLICATION') {
        alert('You have already applied for this job. You cannot apply twice for the same position.');
      } else {
        alert('Error submitting application. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field, sectionName, value, onChange, index = null) => {
    const fieldId = `${sectionName}_${field.name}_${index || 0}`;
    
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={fieldId}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
            required={field.required}
            rows="3"
          />
        );
      
      case 'select':
        return (
          <select
            id={fieldId}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option, optIndex) => (
              <option key={optIndex} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'checkbox':
        if (field.options) {
          return (
            <div className="checkbox-group">
              {field.options.map((option, optIndex) => (
                <label key={optIndex} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={(value || []).includes(option)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? [...(value || []), option]
                        : (value || []).filter(v => v !== option);
                      onChange(newValue);
                    }}
                  />
                  {option}
                </label>
              ))}
            </div>
          );
        } else {
          return (
            <label className="checkbox-single">
              <input
                type="checkbox"
                checked={value || false}
                onChange={(e) => onChange(e.target.checked)}
                required={field.required}
              />
              {field.label}
            </label>
          );
        }
      
      case 'number':
        return (
          <input
            id={fieldId}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            placeholder={field.placeholder || ''}
            required={field.required}
          />
        );
      
      case 'date':
        return (
          <input
            id={fieldId}
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          />
        );
      
      default:
        return (
          <input
            id={fieldId}
            type={field.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
            required={field.required}
          />
        );
    }
  };

  const renderSection = (sectionName, sectionConfig) => {
    if (!sectionConfig.enabled) return null;

    const sectionData = formData[sectionName] || {};
    const isArray = sectionConfig.allowMultiple;
    const items = isArray ? (Array.isArray(sectionData) ? sectionData : []) : [sectionData];

    return (
      <div key={sectionName} className="form-section">
        <h3>{sectionName.charAt(0).toUpperCase() + sectionName.slice(1).replace(/([A-Z])/g, ' $1')}</h3>
        
        {isArray ? (
          items.map((item, index) => (
            <div key={index} className="array-item">
              {sectionConfig.fields?.map(field => (
                <div key={field.name} className="form-group">
                  <label htmlFor={`${sectionName}_${field.name}_${index}`}>
                    {field.label} {field.required && '*'}
                  </label>
                  {renderField(
                    field,
                    sectionName,
                    item[field.name],
                    (value) => handleArrayItemChange(sectionName, index, field.name, value),
                    index
                  )}
                </div>
              ))}
              
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem(sectionName, index)}
                  className="remove-item-btn"
                >
                  Remove
                </button>
              )}
            </div>
          ))
        ) : (
          sectionConfig.fields?.map(field => (
            <div key={field.name} className="form-group">
              <label htmlFor={`${sectionName}_${field.name}`}>
                {field.label} {field.required && '*'}
              </label>
              {renderField(
                field,
                sectionName,
                sectionData[field.name],
                (value) => handleInputChange(sectionName, field.name, value)
              )}
            </div>
          ))
        )}

        {isArray && (
          <button
            type="button"
            onClick={() => addArrayItem(sectionName)}
            className="add-item-btn"
          >
            + Add {sectionName.slice(0, -1)}
          </button>
        )}
      </div>
    );
  };

  const renderSkillsSection = (skillsConfig) => {
    if (!skillsConfig.enabled) return null;

    const skills = formData.skills || [];

    // Check if skills section has custom fields
    if (skillsConfig.fields && skillsConfig.fields.length > 0) {
      return (
        <div className="form-section">
          <h3>Skills</h3>
          {skillsConfig.fields.map((field, index) => (
            <div key={index} className="form-group">
              <label>{field.label} {field.required && '*'}</label>
              {field.type === 'text' || field.type === 'textarea' ? (
                <input
                  type={field.type === 'textarea' ? 'textarea' : 'text'}
                  value={Array.isArray(skills) ? skills.join(', ') : skills || ''}
                  onChange={(e) => {
                    const skillsArray = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                    setFormData(prev => ({ ...prev, skills: skillsArray }));
                  }}
                  placeholder={field.placeholder || "e.g., JavaScript, React, Node.js"}
                  required={field.required}
                />
              ) : field.type === 'select' ? (
                <select
                  value={Array.isArray(skills) ? skills[0] || '' : skills || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, skills: [e.target.value] }))}
                  required={field.required}
                >
                  <option value="">Select skills</option>
                  {field.options?.map((option, optIndex) => (
                    <option key={optIndex} value={option}>{option}</option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <div className="checkbox-group">
                  {field.options?.map((option, optIndex) => (
                    <label key={optIndex} className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={skills.includes(option)}
                        onChange={(e) => {
                          const newSkills = e.target.checked
                            ? [...skills, option]
                            : skills.filter(s => s !== option);
                          setFormData(prev => ({ ...prev, skills: newSkills }));
                        }}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              ) : (
                // Default to text input if no specific type
                <input
                  type="text"
                  value={Array.isArray(skills) ? skills.join(', ') : skills || ''}
                  onChange={(e) => {
                    const skillsArray = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                    setFormData(prev => ({ ...prev, skills: skillsArray }));
                  }}
                  placeholder={field.placeholder || "e.g., JavaScript, React, Node.js"}
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>
      );
    }

    // Fallback to original logic for backward compatibility
    return (
      <div className="form-section">
        <h3>Skills</h3>
        <div className="form-group">
          <label>Skills {skillsConfig.required && '*'}</label>
          
          {skillsConfig.inputType === 'text' ? (
            <input
              type="text"
              value={Array.isArray(skills) ? skills.join(', ') : skills || ''}
              onChange={(e) => {
                const skillsArray = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                setFormData(prev => ({ ...prev, skills: skillsArray }));
              }}
              placeholder="e.g., JavaScript, React, Node.js"
              required={skillsConfig.required}
            />
          ) : skillsConfig.inputType === 'select' ? (
            <select
              value={Array.isArray(skills) ? skills[0] || '' : skills || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, skills: [e.target.value] }))}
              required={skillsConfig.required}
            >
              <option value="">Select skills</option>
              {skillsConfig.options?.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <div className="checkbox-group">
              {skillsConfig.options?.map((option, index) => (
                <label key={index} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={skills.includes(option)}
                    onChange={(e) => {
                      const newSkills = e.target.checked
                        ? [...skills, option]
                        : skills.filter(s => s !== option);
                      setFormData(prev => ({ ...prev, skills: newSkills }));
                    }}
                  />
                  {option}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderResumeSection = (resumeConfig) => {
    if (!resumeConfig.enabled) return null;

    // Check if resume section has custom fields
    if (resumeConfig.fields && resumeConfig.fields.length > 0) {
      return (
        <div className="form-section">
          <h3>Resume Upload</h3>
          {resumeConfig.fields.map((field, index) => (
            <div key={index} className="form-group">
              <label>{field.label} {field.required && '*'}</label>
              <input
                type="file"
                accept={field.allowedTypes?.map(type => `.${type}`).join(',') || '.pdf,.doc,.docx'}
                onChange={(e) => {
                  const file = e.target.files[0];
                  setResumeFile(file);
                  resumeFileRef.current = file;
                  console.log('File selected:', file?.name, file);
                }}
                required={field.required}
              />
              {resumeFile && (
                <div className="file-selected">
                  ✅ File selected: {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
              <small>
                Allowed types: {field.allowedTypes?.join(', ') || 'PDF, DOC, DOCX'} 
                {field.maxSize && ` (Max size: ${field.maxSize})`}
              </small>
            </div>
          ))}
        </div>
      );
    }

    // Fallback to original logic for backward compatibility
    return (
      <div className="form-section">
        <h3>Resume Upload</h3>
        <div className="form-group">
          <label>Resume {resumeConfig.required && '*'}</label>
          <input
            type="file"
            accept={resumeConfig.allowedTypes?.map(type => `.${type}`).join(',')}
            onChange={(e) => {
              const file = e.target.files[0];
              setResumeFile(file);
              resumeFileRef.current = file;
              console.log('File selected:', file?.name, file);
            }}
            required={resumeConfig.required}
          />
          {resumeFile && (
            <div className="file-selected">
              ✅ File selected: {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
          <small>
            Allowed types: {resumeConfig.allowedTypes?.join(', ')} 
            (Max size: {Math.round(resumeConfig.maxSize / 1024 / 1024)}MB)
          </small>
        </div>
      </div>
    );
  };

  const customFields = job?.customFields || {};
  const totalSteps = Object.keys(customFields).filter(section => customFields[section].enabled).length;
  const currentStepIndex = currentStep - 1;
  const enabledSections = Object.keys(customFields).filter(section => customFields[section].enabled);
  const currentSection = enabledSections[currentStepIndex];

  // Debug logging
  console.log('=== DYNAMIC FORM DEBUG ===');
  console.log('Job:', job);
  console.log('Custom Fields:', customFields);
  console.log('Enabled Sections:', enabledSections);
  console.log('Total Steps:', totalSteps);
  console.log('Current Step:', currentStep);
  console.log('Current Section:', currentSection);
  console.log('Resume Section:', customFields.resume);
  console.log('=== END DEBUG ===');

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="dynamic-application-form">
      <div className="form-header">
        <h2>Apply for {job?.title}</h2>
        <button onClick={onClose} className="close-btn">&times;</button>
      </div>
      
      {user && (
        <div className="user-info">
          <p>Logged in as: <strong>{user.name}</strong> ({user.role})</p>
          {user.role !== 'applicant' && (
            <p className="error-message">⚠️ Only applicants can submit job applications</p>
          )}
        </div>
      )}

      <div className="form-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <span>Step {currentStep} of {totalSteps}</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-content">
          {currentSection && customFields[currentSection] && (
            <>
              {currentSection === 'skills' && renderSkillsSection(customFields[currentSection])}
              {currentSection === 'resume' && renderResumeSection(customFields[currentSection])}
              {currentSection !== 'skills' && currentSection !== 'resume' && 
               renderSection(currentSection, customFields[currentSection])}
            </>
          )}
        </div>

        <div className="form-actions">
          {currentStep > 1 && (
            <button type="button" onClick={prevStep} className="btn-secondary">
              Previous
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button type="button" onClick={nextStep} className="btn-primary">
              Next
            </button>
          ) : (
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default DynamicApplicationForm;


