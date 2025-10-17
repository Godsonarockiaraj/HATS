import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { MessageIcon, FileTextIcon, ArrowLeftIcon, XIcon } from './ProfessionalIcons';
import './ApplicationTimeline.css';

const ApplicationTimeline = ({ applicationId, onClose }) => {
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [stageHistory, setStageHistory] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');

  useEffect(() => {
    if (applicationId) {
      fetchApplicationDetails();
      if (user?.role === 'admin') {
        fetchStatusOptions();
      }
    }
  }, [applicationId, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchApplicationDetails = async () => {
    try {
      console.log('Fetching application details for ID:', applicationId);
      
      // Try the admin timeline endpoint first for detailed data
      try {
        const adminResponse = await api.get(`/api/admin/applications/${applicationId}/timeline`);
        console.log('Admin timeline data received:', adminResponse.data);
        setApplication(adminResponse.data.application);
        setStageHistory(adminResponse.data.stageHistory || []);
        setFeedback(adminResponse.data.feedback || []);
        setNotifications(adminResponse.data.notifications || []);
      } catch (adminError) {
        console.log('Admin endpoint failed, trying regular endpoint:', adminError.message);
        
        // Fallback to regular application endpoint
        const response = await api.get(`/api/applications/${applicationId}`);
        console.log('Application data received:', response.data);
        setApplication(response.data);
        
        // If no stage history, create initial entry for application submission
        let initialStageHistory = response.data.stageHistory || [];
        if (initialStageHistory.length === 0) {
          initialStageHistory = [{
            stage: 'applied',
            status: 'applied',
            comment: 'Application submitted successfully',
            changedBy: { name: response.data.applicant?.name || 'Applicant' },
            changedByRole: 'applicant',
            changedAt: response.data.createdAt,
            isRejection: false
          }];
        }
        
        setStageHistory(initialStageHistory);
        setFeedback([]);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      // Create a mock application for testing
      setApplication({
        _id: applicationId,
        status: 'applied',
        createdAt: new Date().toISOString(),
        job: { title: 'Test Job', department: 'Engineering' },
        applicant: { name: 'Test User', email: 'test@example.com' }
      });
      
      // Create initial stage history for mock application
      setStageHistory([{
        stage: 'applied',
        status: 'applied',
        comment: 'Application submitted successfully',
        changedBy: { name: 'Test User' },
        changedByRole: 'applicant',
        changedAt: new Date().toISOString(),
        isRejection: false
      }]);
      setFeedback([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusOptions = async () => {
    try {
      const response = await api.get('/api/admin/status-options');
      setStatusOptions(response.data);
    } catch (error) {
      console.error('Error fetching status options:', error);
      // Fallback to hardcoded options
      setStatusOptions([
        {
          value: 'applied',
          label: 'Application Submitted',
          description: 'Initial application received',
          color: '#4299e1',
          icon: '📝'
        },
        {
          value: 'shortlisted',
          label: 'Shortlisted',
          description: 'Application has been shortlisted for further review',
          color: '#48bb78',
          icon: '✅'
        },
        {
          value: 'reviewed',
          label: 'Under Review',
          description: 'Application is being reviewed by the team',
          color: '#ed8936',
          icon: '👀'
        },
        {
          value: 'interview_scheduled',
          label: 'Interview Scheduled',
          description: 'Interview has been scheduled',
          color: '#9f7aea',
          icon: '📅'
        },
        {
          value: 'interview_completed',
          label: 'Interview Completed',
          description: 'Interview process has been completed',
          color: '#38b2ac',
          icon: '💼'
        },
        {
          value: 'offer',
          label: 'Offer Made',
          description: 'Job offer has been extended',
          color: '#68d391',
          icon: '🎉'
        },
        {
          value: 'rejected',
          label: 'Rejected',
          description: 'Application has been rejected',
          color: '#f56565',
          icon: '❌'
        }
      ]);
    }
  };


  const getStatusIcon = (status) => {
    const icons = {
      applied: '📝',
      shortlisted: '✅',
      reviewed: '👀',
      interview_scheduled: '📅',
      interview_completed: '💼',
      offer: '🎉',
      rejected: '❌',
      withdrawn: '↩️',
      pending_bot_review: '🤖'
    };
    return icons[status] || '📄';
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: '#4299e1',
      shortlisted: '#48bb78',
      reviewed: '#ed8936',
      interview_scheduled: '#9f7aea',
      interview_completed: '#38b2ac',
      offer: '#68d391',
      rejected: '#f56565',
      withdrawn: '#a0aec0',
      pending_bot_review: '#ed8936'
    };
    return colors[status] || '#4299e1';
  };

  const getStatusLabel = (status) => {
    const labels = {
      applied: 'Application Submitted',
      shortlisted: 'Shortlisted',
      reviewed: 'Under Review',
      interview_scheduled: 'Interview Scheduled',
      interview_completed: 'Interview Completed',
      offer: 'Offer Made',
      rejected: 'Rejected',
      withdrawn: 'Withdrawn',
      pending_bot_review: 'Pending Bot Review'
    };
    return labels[status] || status;
  };

  const handleStatusUpdate = async () => {
    try {
      console.log('Updating status:', { applicationId, selectedStatus, statusComment });
      
      // Use the api instance for proper base URL and headers
      const response = await api.put(`/api/applications/${applicationId}/status`, {
        status: selectedStatus,
        comment: statusComment
      });

      console.log('Status update response:', response.data);
      alert('Status updated successfully!');
      setShowStatusModal(false);
      setSelectedStatus('');
      setStatusComment('');
      fetchApplicationDetails();
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error updating status';
      alert(errorMessage);
    }
  };


  const isStageCompleted = (stage) => {
    const stages = ['applied', 'shortlisted', 'reviewed', 'interview_scheduled', 'interview_completed', 'offer'];
    const currentIndex = stages.indexOf(application?.status);
    const stageIndex = stages.indexOf(stage);
    return stageIndex <= currentIndex;
  };

  const isStageRejected = () => {
    return application?.status === 'rejected';
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content timeline-modal">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading application timeline...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('ApplicationTimeline - Application:', application);
  console.log('ApplicationTimeline - ApplicationId:', applicationId);

  if (!application) {
    return (
      <div className="modal-overlay">
        <div className="modal-content timeline-modal">
          <div className="error-message">
            <h3>Loading Application Timeline</h3>
            <p>Application ID: {applicationId}</p>
            <p>Please wait while we load the application details...</p>
            <button onClick={onClose} className="btn-primary">Close</button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="modal-overlay">
      <div className="modal-content timeline-modal">
        <div className="modal-header">
          <h2>Application Timeline</h2>
          <button onClick={onClose} className="close-btn">
            <XIcon />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="application-summary">
            <h3>{application.job.title}</h3>
            <p><strong>Department:</strong> {application.job.department}</p>
            <p><strong>Current Status:</strong> 
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(application.status) }}
              >
                {getStatusIcon(application.status)} {getStatusLabel(application.status)}
              </span>
            </p>
            <p><strong>Applied:</strong> {new Date(application.createdAt).toLocaleDateString()}</p>
          </div>

          {/* Visual Timeline Diagram */}
          <div className="timeline-diagram">
            <h4>Application Progress</h4>
            <div className="progress-stages">
              {statusOptions.length > 0 ? statusOptions.map((stage, index) => (
                <div key={stage.value} className={`stage-item ${isStageCompleted(stage.value) ? 'completed' : ''} ${application?.status === stage.value ? 'current' : ''} ${isStageRejected() && stage.value === 'rejected' ? 'rejected' : ''}`}>
                  <div className="stage-icon" style={{ backgroundColor: stage.color }}>
                    {stage.icon}
                  </div>
                  <div className="stage-content">
                    <h5>{stage.label}</h5>
                    <p>{stage.description}</p>
                  </div>
                  {index < statusOptions.length - 1 && (
                    <div className={`stage-connector ${isStageCompleted(stage.value) ? 'completed' : ''}`}></div>
                  )}
                </div>
              )) : (
                <div className="simple-timeline">
                  <div className="simple-stage current">
                    <div className="stage-icon" style={{ backgroundColor: getStatusColor(application?.status) }}>
                      {getStatusIcon(application?.status)}
                    </div>
                    <div className="stage-content">
                      <h5>{getStatusLabel(application?.status)}</h5>
                      <p>Current application status</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admin Status Update Button */}
          {user?.role === 'admin' && (
            <div className="admin-actions">
              <button 
                onClick={() => setShowStatusModal(true)}
                className="status-update-btn"
              >
                🔄 Update Status
              </button>
            </div>
          )}

          <div className="timeline">
            <h4>Application Timeline & Status Updates</h4>
            <div className="timeline-items">
              {/* Show stage history if available, otherwise show current status */}
              {stageHistory && stageHistory.length > 0 ? (
                // Sort stage history by date (oldest first)
                stageHistory
                  .sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt))
                  .map((stage, index) => (
                    <div 
                      key={`stage-${index}`} 
                      className={`timeline-item stage-item ${stage.stage === application?.status ? 'current-status' : ''}`}
                    >
                      <div className="timeline-marker">
                        <div 
                          className="timeline-dot"
                          style={{ backgroundColor: getStatusColor(stage.stage) }}
                        >
                          {getStatusIcon(stage.stage)}
                        </div>
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <h5>
                            {getStatusLabel(stage.stage)}
                            {stage.isRejection && <span className="rejection-badge">REJECTED</span>}
                            {stage.stage === application?.status && <span className="current-badge">CURRENT</span>}
                          </h5>
                          <span className="timeline-date">
                            {new Date(stage.changedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="timeline-body">
                          {stage.comment && <p><strong>Comment:</strong> {stage.comment}</p>}
                          <p className="timeline-author">
                            <strong>Updated by:</strong> {stage.changedBy?.name} ({stage.changedByRole})
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                /* Fallback: Show current status if no stage history */
                <div className="timeline-item stage-item">
                  <div className="timeline-marker">
                    <div 
                      className="timeline-dot"
                      style={{ backgroundColor: getStatusColor(application?.status) }}
                    >
                      {getStatusIcon(application?.status)}
                    </div>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h5>
                        {getStatusLabel(application?.status)}
                        {application?.status === 'rejected' && <span className="rejection-badge">REJECTED</span>}
                        <span className="current-badge">CURRENT</span>
                      </h5>
                      <span className="timeline-date">
                        {new Date(application?.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="timeline-body">
                      <p>Application status: {getStatusLabel(application?.status)}</p>
                      <p className="timeline-author">
                        <strong>Applied on:</strong> {new Date(application?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback */}
              {feedback.map((item, index) => (
                <div key={`feedback-${index}`} className="timeline-item feedback-item">
                  <div className="timeline-marker">
                    <div className="timeline-dot feedback-dot">
                      <MessageIcon />
                    </div>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h5>
                        <FileTextIcon />
                        Feedback
                      </h5>
                      <span className="timeline-date">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="timeline-body">
                      <p>{item.comment}</p>
                      <p className="timeline-author">
                        <strong>Added by:</strong> {item.addedBy?.name} ({item.addedByRole})
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* No updates message */}
              {stageHistory.length === 0 && feedback.length === 0 && (
                <div className="no-timeline">
                  <p>No additional updates available yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal-overlay">
          <div className="modal-content status-modal">
            <div className="modal-header">
              <h3>Update Application Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="form-select"
                >
                  <option value="">Choose a status</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Comment (Optional)</label>
                <textarea
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder="Add a comment about this status change..."
                  rows="4"
                  className="form-textarea"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowStatusModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!selectedStatus}
                className="btn-primary"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationTimeline;
