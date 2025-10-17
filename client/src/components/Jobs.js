import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ApplicationForm from './ApplicationForm';
import DynamicApplicationForm from './DynamicApplicationForm';
import KeywordManager from './KeywordManager';
import JobFormBuilder from './JobFormBuilder';
import Toast from './Toast';
import { PlusIcon, BriefcaseIcon, SettingsIcon, UserIcon, FileTextIcon } from './ProfessionalIcons';
import '../styles/design-system.css';
import './Jobs.css';

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [userApplications, setUserApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showKeywordManager, setShowKeywordManager] = useState(false);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [showJobFormBuilder, setShowJobFormBuilder] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    department: '',
    isTechnical: false
  });
  const [customFields, setCustomFields] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    fetchJobs();
    if (user?.role === 'applicant') {
      fetchUserApplications();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    try {
      const response = await api.get('/api/applications');
      setUserApplications(response.data);
    } catch (error) {
      console.error('Error fetching user applications:', error);
    }
  };

  const hasUserAppliedForJob = (jobId) => {
    return userApplications.some(app => app.jobId._id === jobId);
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to create a job');
      return;
    }

    if (user.role !== 'admin') {
      alert(`Only administrators can create jobs. Your current role is: ${user.role}`);
      return;
    }

    if (!newJob.title.trim()) {
      alert('Job title is required');
      return;
    }
    if (!newJob.description.trim()) {
      alert('Job description is required');
      return;
    }
    if (!newJob.department.trim()) {
      alert('Department is required');
      return;
    }

    try {
      const jobData = {
        ...newJob,
        customFields: customFields
      };
      await api.post('/api/jobs', jobData);
      setNewJob({ title: '', description: '', department: '', isTechnical: false });
      setCustomFields(null);
      setShowCreateForm(false);
      fetchJobs();
      alert('Job created successfully!');
    } catch (error) {
      console.error('Error creating job:', error);
      if (error.response?.status === 403) {
        alert('Access denied. Only administrators can create jobs.');
      } else if (error.response?.status === 401) {
        alert('Please log in to create a job.');
      } else {
        alert('Error creating job. Please try again.');
      }
    }
  };

  const handleApply = async (job) => {
    try {
      // Fetch the latest job data from the database to ensure we have the most recent customFields
      const response = await api.get(`/api/jobs/${job._id}`);
      setSelectedJob(response.data);
      setShowApplicationForm(true);
    } catch (error) {
      console.error('Error fetching latest job data:', error);
      // Fallback to the job data we have
    setSelectedJob(job);
    setShowApplicationForm(true);
    }
  };

  const handleManageKeywords = (job) => {
    setSelectedJob(job);
    setShowKeywordManager(true);
  };

  const handleConfigureForm = (job) => {
    setSelectedJob(job);
    setShowJobFormBuilder(true);
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleApplicationSuccess = () => {
    // Show success toast
    showToast('Application submitted successfully! Thank you for your interest.');
    
    // Close the application modal
    setShowApplicationForm(false);
    setSelectedJob(null);
    
    // Refresh data
    fetchJobs();
    if (user?.role === 'applicant') {
      fetchUserApplications();
    }
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!user) {
      alert('Please log in to delete jobs');
      return;
    }

    if (user.role !== 'admin') {
      alert(`Only administrators can delete jobs. Your current role is: ${user.role}`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete the job "${jobTitle}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/api/jobs/${jobId}`);
        fetchJobs();
        alert('Job deleted successfully!');
      } catch (error) {
        console.error('Error deleting job:', error);
          alert('Error deleting job. Please try again.');
      }
    }
  };

  const getJobStatusBadge = (job) => {
    const status = job.status || 'active';
    return (
      <span className={`job-status-badge status-${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getJobTypeBadge = (job) => {
    return (
      <span className={`job-type-badge ${job.isTechnical ? 'technical' : 'non-technical'}`}>
        {job.isTechnical ? 'Technical' : 'Non-Technical'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="jobs-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          Loading job opportunities...
        </div>
      </div>
    );
  }

  return (
    <div className="jobs-container">
      {/* Hero Section */}
      <section className="jobs-hero">
        <div className="jobs-hero-background">
          <div className="jobs-hero-gradient"></div>
          <div className="jobs-hero-pattern"></div>
        </div>
        
        <div className="jobs-hero-content">
          <div className="jobs-hero-text">
            <h1 className="jobs-hero-title animate-fade-in">
              Career Opportunities
            </h1>
            <p className="jobs-hero-subtitle animate-fade-in">
              Discover your next career move with our curated selection of positions.
              Join a team that values innovation, growth, and excellence.
            </p>
            
            {user?.role === 'admin' && (
              <div className="jobs-hero-actions animate-slide-up">
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="btn btn-primary btn-lg"
                >
                  <PlusIcon />
                  Create New Position
                </button>
                <button 
                  onClick={() => setShowFormBuilder(true)}
                  className="btn btn-secondary btn-lg"
                >
                  <SettingsIcon />
                  Form Builder
                </button>
              </div>
            )}
          </div>
          
          <div className="jobs-hero-stats animate-scale-in">
            <div className="hero-stat-item">
              <div className="hero-stat-icon">
                <BriefcaseIcon />
              </div>
              <div className="hero-stat-content">
                <div className="hero-stat-value">{jobs.length}</div>
                <div className="hero-stat-label">Open Positions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs Grid */}
      <section className="jobs-content">
        <div className="jobs-grid-container">
          {jobs.length > 0 ? (
            <div className="jobs-grid">
              {jobs.map((job, index) => (
                <div key={job._id} className="job-card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="job-card-header">
                    <div className="job-card-badges">
                      {getJobStatusBadge(job)}
                      {getJobTypeBadge(job)}
                      {job.customFields && Object.keys(job.customFields).length > 0 && (
                        <span className="custom-form-badge">
                          <FileTextIcon />
                          Custom Form
                        </span>
                      )}
                    </div>
                    <div className="job-card-actions">
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleConfigureForm(job)}
                          className="job-action-btn"
                          title="Configure Application Form"
                        >
                          <FileTextIcon />
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleManageKeywords(job)}
                          className="job-action-btn"
                          title="Manage Keywords"
                        >
                          <SettingsIcon />
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteJob(job._id, job.title)}
                          className="job-action-btn delete"
                          title="Delete Job"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="job-card-body">
                    <h3 className="job-title">{job.title}</h3>
                    <p className="job-department">{job.department}</p>
                    <p className="job-description">{job.description}</p>
                    
                    <div className="job-meta">
                      <div className="job-meta-item">
                        <span className="job-meta-label">Posted</span>
                        <span className="job-meta-value">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {job.createdBy && (
                        <div className="job-meta-item">
                          <span className="job-meta-label">Created by</span>
                          <span className="job-meta-value">{job.createdBy.name || 'Admin'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="job-card-footer">
                    {user?.role === 'applicant' && hasUserAppliedForJob(job._id) ? (
                      <button
                        disabled
                        className="btn btn-secondary btn-lg w-full"
                      >
                        <UserIcon />
                        Already Applied
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApply(job)}
                        className="btn btn-primary btn-lg w-full"
                      >
                        <UserIcon />
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-jobs-state">
              <div className="empty-jobs-icon">
                <BriefcaseIcon />
              </div>
              <h3 className="empty-jobs-title">No Job Openings</h3>
              <p className="empty-jobs-description">
                There are currently no job openings available. Check back soon for new opportunities.
              </p>
              {user?.role === 'admin' && (
            <button 
              onClick={() => setShowCreateForm(true)}
                  className="btn btn-primary btn-lg"
            >
                  <PlusIcon />
                  Create First Job
            </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Create Job Modal */}
      {showCreateForm && user?.role === 'admin' && (
        <div className="modal-overlay">
          <div className="modal-content create-job-modal">
            <div className="modal-header">
              <h2 className="modal-title">Create New Position</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="modal-close-btn"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateJob} className="modal-body">
            <div className="form-group">
                <label className="form-label">Job Title</label>
              <input
                type="text"
                value={newJob.title}
                onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                  className="form-input"
                  placeholder="e.g., Senior Software Engineer"
                required
              />
            </div>
            
            <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  value={newJob.department}
                  onChange={(e) => setNewJob({...newJob, department: e.target.value})}
                  className="form-input"
                  placeholder="e.g., Engineering, Marketing, Sales"
                required
              />
            </div>
            
            <div className="form-group">
                <label className="form-label">Job Description</label>
                <textarea
                  value={newJob.description}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  className="form-input"
                  rows="6"
                  placeholder="Describe the role, responsibilities, and requirements..."
                required
              />
            </div>
            
            <div className="form-group">
                <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newJob.isTechnical}
                  onChange={(e) => setNewJob({...newJob, isTechnical: e.target.checked})}
                />
                  <span className="checkbox-text">Technical Position</span>
              </label>
            </div>
            
              <div className="form-group">
                <div className="form-section-header">
                  <label className="form-label">Application Form Configuration</label>
                  <p className="form-description">
                    Configure custom fields for the application form. If not configured, a default form will be used.
                  </p>
                </div>
                <div className="form-builder-section">
                  {customFields && Object.keys(customFields).length > 0 ? (
                    <div className="custom-fields-preview">
                      <div className="preview-header">
                        <span className="preview-label">Custom Form Configured</span>
                        <button
                          type="button"
                          onClick={() => setCustomFields(null)}
                          className="clear-form-btn"
                        >
                          Clear Form
                        </button>
                      </div>
                      <div className="preview-details">
                        {Object.keys(customFields).map(section => {
                          const sectionData = customFields[section];
                          if (sectionData && sectionData.fields && sectionData.fields.length > 0) {
                            return (
                              <div key={section} className="preview-section">
                                <span className="section-name">{section.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className="field-count">{sectionData.fields.length} fields</span>
                              </div>
                            );
                          }
                          return null;
                        }).filter(Boolean)}
                      </div>
                    </div>
                  ) : (
                    <div className="no-custom-fields">
                      <span className="no-fields-text">Using default application form</span>
                    </div>
                  )}
              <button 
                type="button" 
                    onClick={() => {
                      setShowCreateForm(false);
                      setShowFormBuilder(true);
                    }}
                    className="btn btn-secondary"
                  >
                    <FileTextIcon />
                    {customFields && Object.keys(customFields).length > 0 ? 'Edit Form' : 'Build Custom Form'}
              </button>
                </div>
              </div>
            </form>
            
            <div className="modal-footer">
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
                <button 
                type="submit"
                onClick={handleCreateJob}
                  className="btn btn-primary"
                >
                Create Position
                    </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Form Modal */}
      {showApplicationForm && selectedJob && (
        <div className="modal-overlay">
          <div className="modal-content application-modal">
            <div className="modal-header">
              <h2 className="modal-title">Apply for {selectedJob.title}</h2>
              <button
                onClick={() => setShowApplicationForm(false)}
                className="modal-close-btn"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {selectedJob.customFields ? (
          <DynamicApplicationForm
            job={selectedJob}
            onSuccess={handleApplicationSuccess}
                  onCancel={() => setShowApplicationForm(false)}
          />
        ) : (
          <ApplicationForm
            job={selectedJob}
            onSuccess={handleApplicationSuccess}
                  onCancel={() => setShowApplicationForm(false)}
          />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Keyword Manager Modal */}
      {showKeywordManager && selectedJob && (
        <div className="modal-overlay">
          <div className="modal-content keyword-modal">
        <KeywordManager
          job={selectedJob}
              onClose={() => setShowKeywordManager(false)}
        />
          </div>
        </div>
      )}

      {/* Form Builder Modal */}
      {showFormBuilder && (
        <div className="modal-overlay">
          <div className="modal-content form-builder-modal resizable-modal">
            <JobFormBuilder
              job={null}
              onSave={(fields) => {
                setCustomFields(fields);
                setShowFormBuilder(false);
                setSelectedJob(null);
                // If we came from create form, reopen it
                if (!showCreateForm) {
                  setShowCreateForm(true);
                }
              }}
              onCancel={() => {
                setShowFormBuilder(false);
                setSelectedJob(null);
                // If we came from create form, reopen it
                if (!showCreateForm) {
                  setShowCreateForm(true);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Job Form Builder Modal */}
      {showJobFormBuilder && selectedJob && (
        <div className="modal-overlay">
          <div className="modal-content form-builder-modal resizable-modal">
            <JobFormBuilder
              job={selectedJob}
              onSave={async (fields) => {
                try {
                  // Update the job in the database with new custom fields
                  await api.put(`/api/jobs/${selectedJob._id}`, {
                    customFields: fields
                  });
                  
                  // Update the job in the frontend state
                  const updatedJobs = jobs.map(job => 
                    job._id === selectedJob._id 
                      ? { ...job, customFields: fields }
                      : job
                  );
                  setJobs(updatedJobs);
                  setShowJobFormBuilder(false);
                  setSelectedJob(null);
                  
                  console.log('✅ Job custom fields updated successfully');
                } catch (error) {
                  console.error('❌ Error updating job custom fields:', error);
                  alert('Error updating job form. Please try again.');
                }
              }}
              onCancel={() => {
                setShowJobFormBuilder(false);
                setSelectedJob(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default Jobs;