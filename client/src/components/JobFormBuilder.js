import React, { useState, useEffect } from 'react';
import { PlusIcon, SaveIcon, CloseIcon } from './ProfessionalIcons';
import '../styles/design-system.css';
import './JobFormBuilder.css';

const JobFormBuilder = ({ job, onSave, onCancel }) => {
  const [customFields, setCustomFields] = useState({
    personalInfo: { enabled: false, required: false, fields: [] },
    professionalInfo: { enabled: false, required: false, fields: [] },
    education: { enabled: false, required: false, allowMultiple: true, fields: [] },
    workExperience: { enabled: false, required: false, allowMultiple: true, fields: [] },
    skills: { enabled: false, required: false, fields: [] },
    resume: { enabled: false, required: false, fields: [] },
    coverLetter: { enabled: false, required: false, fields: [] },
    additionalInfo: { enabled: false, required: false, fields: [] }
  });

  const [selectedSection, setSelectedSection] = useState('personalInfo');
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (job && job.customFields) {
      setCustomFields(job.customFields);
    }
  }, [job]);

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = React.useCallback((e) => {
    if (!isResizing) return;
    
    const newWidth = e.clientX;
    if (newWidth >= 200 && newWidth <= 600) {
      setSidebarWidth(newWidth);
    }
  }, [isResizing]);

  const handleMouseUp = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const sections = [
    { key: 'personalInfo', name: 'Personal Information', icon: '👤' },
    { key: 'professionalInfo', name: 'Professional Details', icon: '💼' },
    { key: 'education', name: 'Education', icon: '🎓' },
    { key: 'workExperience', name: 'Work Experience', icon: '💼' },
    { key: 'skills', name: 'Skills', icon: '⚡' },
    { key: 'resume', name: 'Resume Upload', icon: '📄' },
    { key: 'coverLetter', name: 'Cover Letter', icon: '📝' },
    { key: 'additionalInfo', name: 'Additional Info', icon: 'ℹ️' }
  ];

  const handleSectionToggle = (sectionKey, enabled) => {
    setCustomFields(prev => {
      const updatedSection = {
        ...prev[sectionKey],
        enabled,
        required: enabled ? prev[sectionKey].required : false
      };

      // Auto-add file upload field for resume section when enabled
      if (sectionKey === 'resume' && enabled && (!prev[sectionKey].fields || prev[sectionKey].fields.length === 0)) {
        console.log('Auto-adding resume file field for resume section');
        updatedSection.fields = [{
          name: 'resume_file',
          label: 'Resume File',
          type: 'file',
          required: true,
          placeholder: 'Upload your resume',
          allowedTypes: ['pdf', 'doc', 'docx'],
          maxSize: '5MB'
        }];
      }

      return {
        ...prev,
        [sectionKey]: updatedSection
      };
    });
  };

  const handleRequiredToggle = (sectionKey, required) => {
    setCustomFields(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        required
      }
    }));
  };

  const addCustomField = (sectionKey) => {
    const newField = {
      name: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false,
      placeholder: 'Enter value'
    };

    setCustomFields(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        fields: [...prev[sectionKey].fields, newField]
      }
    }));
  };

  const updateField = (sectionKey, fieldIndex, fieldData) => {
    setCustomFields(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        fields: prev[sectionKey].fields.map((field, index) =>
          index === fieldIndex ? { ...field, ...fieldData } : field
        )
      }
    }));
  };

  const removeField = (sectionKey, fieldIndex) => {
        setCustomFields(prev => ({
          ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        fields: prev[sectionKey].fields.filter((_, index) => index !== fieldIndex)
      }
    }));
  };

  return (
    <div className="form-builder-container resizable-modal">
      <div className="form-builder-header">
        <div className="header-content">
          <h2 className="builder-title">
            {job ? 'Edit Application Form' : 'Build Application Form'}
          </h2>
          <p className="builder-subtitle">
            Configure custom fields for the job application form
          </p>
        </div>
        <div className="header-actions">
          <button onClick={onCancel} className="btn btn-secondary">
            <CloseIcon />
            Cancel
          </button>
          <button onClick={() => onSave(customFields)} className="btn btn-primary">
            <SaveIcon />
            Save Configuration
          </button>
        </div>
      </div>

      <div className="form-builder-content">
        <div 
          className="builder-sidebar"
          style={{ width: `${sidebarWidth}px` }}
        >
          <div className="section-list">
            <h3 className="sidebar-title">Form Sections</h3>
            {sections.map(section => (
              <button
                key={section.key}
                className={`section-item ${selectedSection === section.key ? 'active' : ''}`}
                onClick={() => setSelectedSection(section.key)}
              >
                <span className="section-icon">{section.icon}</span>
                <span className="section-name">{section.name}</span>
                <div className="section-status">
                  {customFields[section.key]?.enabled && (
                    <span className={`status-badge ${customFields[section.key]?.required ? 'required' : 'optional'}`}>
                      {customFields[section.key]?.required ? 'Required' : 'Optional'}
                </span>
                  )}
                </div>
              </button>
            ))}
          </div>
          </div>
          
        <div 
          className={`resize-handle ${isResizing ? 'resizing' : ''}`}
          onMouseDown={handleMouseDown}
        >
          <div className="resize-handle-line"></div>
        </div>

        <div 
          className="builder-main"
          style={{ width: `calc(100% - ${sidebarWidth}px - 8px)` }}
        >
          <div className="section-config">
          <div className="section-header">
              <h3 className="section-title">
              {sections.find(s => s.key === selectedSection)?.name}
            </h3>
            <div className="section-controls">
                <label className="control-switch">
                <input
                  type="checkbox"
                  checked={customFields[selectedSection]?.enabled || false}
                    onChange={(e) => handleSectionToggle(selectedSection, e.target.checked)}
                  />
                  <span className="switch-slider"></span>
                  <span className="switch-label">Enable Section</span>
              </label>

                {customFields[selectedSection]?.enabled && (
                  <label className="control-switch">
                <input
                  type="checkbox"
                  checked={customFields[selectedSection]?.required || false}
                      onChange={(e) => handleRequiredToggle(selectedSection, e.target.checked)}
                    />
                    <span className="switch-slider"></span>
                    <span className="switch-label">Required</span>
              </label>
                )}
              </div>
            </div>

            {customFields[selectedSection]?.enabled && (
              <div className="section-content">
                <div className="fields-header">
                  <h4 className="fields-title">Custom Fields</h4>
                  <button
                    onClick={() => addCustomField(selectedSection)}
                    className="btn btn-secondary btn-sm"
                  >
                    <PlusIcon />
                    Add Field
                  </button>
          </div>

                <div className="fields-list">
                  {customFields[selectedSection]?.fields?.map((field, index) => (
                    <div key={index} className="field-item">
                      <div className="field-config">
                        <div className="field-row">
                          <div className="field-group">
                            <label className="field-label">Field Label</label>
                        <input
                          type="text"
                              value={field.label}
                              onChange={(e) => updateField(selectedSection, index, { label: e.target.value })}
                              className="field-input"
                              placeholder="Enter field label"
                            />
                      </div>
                          <div className="field-group">
                            <label className="field-label">Field Type</label>
                            <select
                              value={field.type}
                              onChange={(e) => updateField(selectedSection, index, { type: e.target.value })}
                              className="field-input"
                            >
                              <option value="text">Text</option>
                              <option value="email">Email</option>
                              <option value="tel">Phone</option>
                              <option value="textarea">Textarea</option>
                              <option value="file">File Upload</option>
                              <option value="select">Select</option>
                              <option value="checkbox">Checkbox</option>
                            </select>
                          </div>
                        </div>
                        <div className="field-row">
                          <div className="field-group full-width">
                            <label className="field-label">Placeholder</label>
                            <input
                              type="text"
                              value={field.placeholder || ''}
                              onChange={(e) => updateField(selectedSection, index, { placeholder: e.target.value })}
                              className="field-input"
                              placeholder="Enter placeholder text"
                            />
                      </div>
                    </div>
                    
                    {/* File-specific configuration options */}
                    {field.type === 'file' && (
                      <div className="field-row">
                        <div className="field-group">
                          <label className="field-label">Allowed File Types</label>
                          <input
                            type="text"
                            value={field.allowedTypes ? field.allowedTypes.join(', ') : ''}
                            onChange={(e) => updateField(selectedSection, index, { 
                              allowedTypes: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                            })}
                            className="field-input"
                            placeholder="pdf, doc, docx"
                          />
                          </div>
                        <div className="field-group">
                          <label className="field-label">Max File Size</label>
                          <input
                            type="text"
                            value={field.maxSize || ''}
                            onChange={(e) => updateField(selectedSection, index, { maxSize: e.target.value })}
                            className="field-input"
                            placeholder="5MB"
                          />
                        </div>
                      </div>
                    )}
                    <div className="field-actions">
                          <label className="field-checkbox">
                            <input
                              type="checkbox"
                              checked={field.required || false}
                              onChange={(e) => updateField(selectedSection, index, { required: e.target.checked })}
                            />
                            <span>Required</span>
                          </label>
                      <button
                            onClick={() => removeField(selectedSection, index)}
                            className="remove-field-btn"
                      >
                            Remove
                      </button>
                    </div>
                      </div>
                    </div>
                  ))}

                  {(!customFields[selectedSection]?.fields || customFields[selectedSection].fields.length === 0) && (
                    <div className="empty-fields">
                      <p>No custom fields added yet.</p>
                      <button
                        onClick={() => addCustomField(selectedSection)}
                        className="btn btn-primary btn-sm"
                      >
                        <PlusIcon />
                        Add First Field
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!customFields[selectedSection]?.enabled && (
              <div className="section-disabled">
                <p>Enable this section to configure custom fields.</p>
                  </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobFormBuilder;