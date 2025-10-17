import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ApplicationTimeline from './ApplicationTimeline';
import { XIcon } from './ProfessionalIcons';
import './Applications.css';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineAppId, setTimelineAppId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/api/applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleViewTimeline = (appId) => {
    setTimelineAppId(appId);
    setShowTimeline(true);
  };



  const handleStatusUpdate = async (appId, newStatus, comment) => {
    try {
      const response = await api.put(`/api/applications/${appId}`, {
        status: newStatus,
        comment: comment
      });
      fetchApplications();
      setShowModal(false);
      return response.data;
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: '#007bff',
      shortlisted: '#28a745',
      reviewed: '#ffc107',
      interview_scheduled: '#17a2b8',
      interview_completed: '#6f42c1',
      offer: '#28a745',
      rejected: '#dc3545',
      withdrawn: '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return <div className="loading">Loading applications...</div>;
  }

  return (
    <div className="container">
      <div className="main-content">
        <div className="applications-header d-flex justify-between align-center mb-4">
          <div>
            <h2>Applications</h2>
            {user?.role === 'admin' && (
              <p className="text-muted">Manage application statuses and add comments</p>
            )}
          </div>
        </div>

        <div className="grid grid-1 grid-2 grid-3">
        {applications.map(app => (
          <div key={app._id} className="card application-card">
            <div className="app-header">
              <h3>{app.jobId ? app.jobId.title : 'Job Not Found'}</h3>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(app.status) }}
              >
                {app.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            
            <div className="app-details">
              <div className="detail-item">
                <i className="icon">🏢</i>
                <span>{app.jobId ? app.jobId.department : 'N/A'}</span>
              </div>
              <div className="detail-item">
                <i className="icon">{app.jobId && app.jobId.isTechnical ? '💻' : '👔'}</i>
                <span>{app.jobId ? (app.jobId.isTechnical ? 'Technical' : 'Non-Technical') : 'N/A'}</span>
              </div>
              <div className="detail-item">
                <i className="icon">👤</i>
                <span>{app.applicantId?.name || app.applicantId?.email || 'Unknown User'}</span>
              </div>
              <div className="detail-item">
                <i className="icon">📅</i>
                <span>{new Date(app.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="app-actions">
              <button 
                onClick={() => {
                  setSelectedApp(app);
                  setShowModal(true);
                }}
                className="btn btn-outline btn-sm"
              >
                <i className="icon">👁️</i>
                View Details
              </button>
              
              
              <button 
                onClick={() => handleViewTimeline(app._id)}
                className="btn btn-info btn-sm"
              >
                <i className="icon">📊</i>
                Timeline
              </button>

            </div>
          </div>
        ))}
        </div>

        {showModal && selectedApp && (
          <ApplicationModal
            application={selectedApp}
            onClose={() => {
              setShowModal(false);
              setSelectedApp(null);
            }}
            onStatusUpdate={handleStatusUpdate}
            userRole={user?.role}
          />
        )}


        {showTimeline && timelineAppId && (
          <ApplicationTimeline
            applicationId={timelineAppId}
            onClose={() => {
              setShowTimeline(false);
              setTimelineAppId(null);
            }}
          />
        )}

      </div>
    </div>
  );
};

// ApplicationModal component
const ApplicationModal = ({ application, onClose, onStatusUpdate, userRole }) => {
  const [newStatus, setNewStatus] = useState(application.status);
  const [comment, setComment] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      const response = await api.get(`/api/applications/${application._id}/activity`);
      setActivityLogs(response.data);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (userRole !== 'admin') {
      alert('Only administrators can update application statuses. Please log in as an admin.');
      return;
    }
    
    try {
      await onStatusUpdate(application._id, newStatus, comment);
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage = error.response?.data?.message || 'Error updating status. Please try again.';
      alert(errorMessage);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content application-modal">
        <div className="modal-header">
          <h3>{application.jobId ? application.jobId.title : 'Job Not Found'} - Application Details</h3>
          <button onClick={onClose} className="close-btn">
            <XIcon />
          </button>
        </div>

        <div className="modal-body">
          <div className="app-info">
            <h4>Basic Information</h4>
            <p><strong>Applicant:</strong> {application.applicantId?.name || application.applicantId?.email || 'Unknown User'}</p>
            <p><strong>Email:</strong> {application.applicantId?.email || 'N/A'}</p>
            <p><strong>Current Status:</strong> {application.status}</p>
            <p><strong>Applied:</strong> {new Date(application.createdAt).toLocaleString()}</p>
          </div>

          {application.formData?.personalInfo && (
            <div className="app-section">
              <h4>Personal Information</h4>
              <div className="info-grid">
                <p><strong>Phone:</strong> {application.formData?.personalInfo.phone || 'Not provided'}</p>
                <p><strong>Address:</strong> {application.formData?.personalInfo.address || 'Not provided'}</p>
                <p><strong>City:</strong> {application.formData?.personalInfo.city || 'Not provided'}</p>
                <p><strong>State:</strong> {application.formData?.personalInfo.state || 'Not provided'}</p>
                <p><strong>Country:</strong> {application.formData?.personalInfo.country || 'Not provided'}</p>
              </div>
            </div>
          )}

          {application.formData?.professionalInfo && (
            <div className="app-section">
              <h4>Professional Information</h4>
              <div className="info-grid">
                <p><strong>Current Position:</strong> {application.formData?.professionalInfo.currentPosition || 'Not provided'}</p>
                <p><strong>Current Company:</strong> {application.formData?.professionalInfo.currentCompany || 'Not provided'}</p>
                <p><strong>Experience:</strong> {application.formData?.professionalInfo.yearsOfExperience || 'Not provided'} years</p>
                <p><strong>Expected Salary:</strong> {application.formData?.professionalInfo.expectedSalary || 'Not provided'}</p>
                <p><strong>Notice Period:</strong> {application.formData?.professionalInfo.noticePeriod || 'Not provided'}</p>
                <p><strong>Availability:</strong> {application.formData?.professionalInfo.availability || 'Not provided'}</p>
              </div>
            </div>
          )}

          {application.formData?.skills && application.formData?.skills.length > 0 && (
            <div className="app-section">
              <h4>Skills</h4>
              <div className="skills-list">
                {application.formData?.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {application.formData?.education && application.formData?.education.length > 0 && (
            <div className="app-section">
              <h4>Education</h4>
              {application.formData?.education.map((edu, index) => (
                <div key={index} className="education-item">
                  <p><strong>{edu.degree}</strong> - {edu.institution}</p>
                  <p>{edu.fieldOfStudy} ({edu.graduationYear}) - GPA: {edu.gpa}</p>
                </div>
              ))}
            </div>
          )}

          {application.formData?.workExperience && application.formData?.workExperience.length > 0 && (
            <div className="app-section">
              <h4>Work Experience</h4>
              {application.formData?.workExperience.map((exp, index) => (
                <div key={index} className="work-item">
                  <p><strong>{exp.position}</strong> at {exp.company}</p>
                  <p>{new Date(exp.startDate).toLocaleDateString()} - {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()}</p>
                  <p>{exp.description}</p>
                </div>
              ))}
            </div>
          )}

          {application.formData?.additionalInfo && (
            <div className="app-section additional-info-section">
              <h4>📋 Additional Information</h4>
              <div className="additional-info-grid">
                {Object.entries(application.formData?.additionalInfo).map(([key, value]) => {
                  // Skip empty values
                  if (!value || (Array.isArray(value) && value.length === 0)) {
                    return null;
                  }
                  
                  // Format the key for display
                  const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  
                  // Handle different value types
                  if (Array.isArray(value)) {
                    if (value.length === 1 && typeof value[0] === 'object') {
                      // Handle array of objects (like references)
                      return (
                        <div key={key} className="additional-info-card reference-section">
                          <div className="card-header">
                            <h5>{displayKey}</h5>
                            <span className="card-count">{value.length} {value.length === 1 ? 'Reference' : 'References'}</span>
                          </div>
                          <div className="card-content">
                            {value.map((item, index) => (
                              <div key={index} className="reference-item">
                                {Object.entries(item).map(([subKey, subValue]) => (
                                  subValue && (
                                    <div key={subKey} className="reference-field">
                                      <span className="field-label">{subKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                                      <span className="field-value">{subValue}</span>
                                    </div>
                                  )
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    } else {
                      // Handle simple arrays (like skills, certifications)
                      return (
                        <div key={key} className="additional-info-card list-section">
                          <div className="card-header">
                            <h5>{displayKey}</h5>
                            <span className="card-count">{value.length} {value.length === 1 ? 'Item' : 'Items'}</span>
                          </div>
                          <div className="card-content">
                            <div className="tag-list">
                              {value.map((item, index) => (
                                <span key={index} className="info-tag">{item}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  } else if (typeof value === 'object' && value !== null) {
                    // Handle nested objects
                    return (
                      <div key={key} className="additional-info-card object-section">
                        <div className="card-header">
                          <h5>{displayKey}</h5>
                        </div>
                        <div className="card-content">
                          {Object.entries(value).map(([subKey, subValue]) => (
                            subValue && (
                              <div key={subKey} className="object-field">
                                <span className="field-label">{subKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                                <span className="field-value">{subValue}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    );
                  } else {
                    // Handle simple values (like whyInterested, relevantProjects)
                    return (
                      <div key={key} className="additional-info-card text-section">
                        <div className="card-header">
                          <h5>{displayKey}</h5>
                        </div>
                        <div className="card-content">
                          <p className="text-content">{value}</p>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}

          {application.formData?.coverLetter && (
            <div className="app-section">
              <h4>Cover Letter</h4>
              <p className="cover-letter">{application.formData?.coverLetter}</p>
            </div>
          )}

          {application.formData?.resume && application.formData.resume.filename && (
            <div className="app-section">
              <h4>📄 Resume</h4>
              <div className="resume-info">
                <p><strong>File Name:</strong> {application.formData.resume.originalName}</p>
                <div className="resume-actions">
                  <button 
                    onClick={() => {
                      const token = localStorage.getItem('token');
                      const resumeUrl = `http://localhost:5000/api/applications/${application._id}/resume/view?token=${token}`;
                      window.open(resumeUrl, '_blank');
                    }}
                    className="btn btn-primary btn-professional"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    View Resume
                  </button>
                  <p className="resume-note">
                    Click "View Resume" to open the file in a new tab for viewing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {application.shortlistingInfo && application.shortlistingInfo.isShortlisted && (
            <div className="app-section shortlisting-info">
              <h4>Shortlisting Information</h4>
              <div className="info-grid">
                <p><strong>Shortlisted by:</strong> {application.shortlistingInfo.shortlistedBy}</p>
                <p><strong>Shortlisted on:</strong> {new Date(application.shortlistingInfo.shortlistedAt).toLocaleString()}</p>
                <p><strong>Score:</strong> {application.shortlistingInfo.shortlistingScore}/10</p>
                {application.shortlistingInfo.keywordMatches && application.shortlistingInfo.keywordMatches.length > 0 && (
                  <div>
                    <p><strong>Matched Keywords:</strong></p>
                    <div className="keywords-list">
                      {application.shortlistingInfo.keywordMatches.map((keyword, index) => (
                        <span key={index} className="keyword-tag">{keyword}</span>
                      ))}
                    </div>
                  </div>
                )}
                {application.shortlistingInfo.shortlistingNotes && (
                  <p><strong>Notes:</strong> {application.shortlistingInfo.shortlistingNotes}</p>
                )}
              </div>
            </div>
          )}

          {userRole === 'admin' && (
            <form onSubmit={handleSubmit} className="status-update-form">
              <h4>🔄 Update Application Status</h4>
              <p style={{color: '#666', fontSize: '14px', marginBottom: '16px'}}>
                Current Status: <strong>{application.status}</strong> | Select new status below:
              </p>
              <div className="form-group">
                <label htmlFor="status">New Status:</label>
                <select id="status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="applied">Applied</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="interview_completed">Interview Completed</option>
                  <option value="offer">Offer Made</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="comment">Comment:</label>
                <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
              </div>
              <div className="form-actions">
                <button type="button" onClick={onClose} className="btn-secondary">
                  ✕ Close
                </button>
                <button type="submit" className="btn-primary">
                  💾 Update Status
                </button>
                {application.jobId?.isTechnical === false && application.status === 'applied' && (
                  <button 
                    type="button" 
                    onClick={() => onStatusUpdate(application._id, 'shortlisted', 'Manually shortlisted by admin')} 
                    className="btn-success"
                  >
                    ✅ Shortlist Manually
                  </button>
                )}
              </div>
            </form>
          )}


          <div className="activity-log">
            <h4>Activity Log</h4>
            {activityLogs.length > 0 ? (
              <ul>
                {activityLogs.map((log) => (
                  <li key={log._id}>
                    <strong>{log.action}</strong> from {log.fromStatus} to {log.toStatus} by {log.performedByRole} on {new Date(log.timestamp).toLocaleString()}
                    {log.comment && <p className="log-comment">Comment: {log.comment}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No activity logs available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default Applications;