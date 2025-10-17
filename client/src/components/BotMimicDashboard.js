import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './BotMimicDashboard.css';

// Professional Icons
const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22,4 12,14.01 9,11.01"/>
  </svg>
);

const XCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const BotIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4"/>
    <line x1="8" y1="16" x2="8" y2="16"/>
    <line x1="16" y1="16" x2="16" y2="16"/>
  </svg>
);


const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5,3 19,12 5,21"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

// Updated to remove showRejectedModal - using tab system instead

const BotMimicDashboard = () => {
  const { user } = useAuth();
  const [pendingApplications, setPendingApplications] = useState([]);
  const [rejectedApplications, setRejectedApplications] = useState([]);
  const [shortlistedApplications, setShortlistedApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('pending'); // Track which tab is active
  const [showJobSelectionModal, setShowJobSelectionModal] = useState(false);
  const [showApplicationViewer, setShowApplicationViewer] = useState(false);
  const [selectedApplicationForView, setSelectedApplicationForView] = useState(null);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);

  useEffect(() => {
    fetchPendingApplications();
    fetchRejectedApplications();
    fetchShortlistedApplications();
    fetchStats();
  }, []);

  const fetchPendingApplications = async () => {
    try {
      const response = await api.get('/api/applications');
      const data = response.data;
      // Filter for ALL applications that are still pending (not processed by bot or still in pending status)
      const pendingApps = data.filter(app => 
        app.jobId && 
        (app.status === 'pending' || app.status === 'applied' || app.status === 'pending_bot_review') &&
        (!app.shortlistingInfo || !app.shortlistingInfo.botProcessed)
      );
      console.log('[DEBUG] Fetched pending applications:', {
        totalApplications: data.length,
        pendingAppsCount: pendingApps.length,
        pendingApps: pendingApps
      });
      setPendingApplications(pendingApps);
      
      // Get unique jobs from pending applications
      const uniqueJobs = pendingApps.reduce((acc, app) => {
        if (app.jobId && !acc.find(job => job._id === app.jobId._id)) {
          acc.push({
            _id: app.jobId._id,
            title: app.jobId.title,
            department: app.jobId.department,
            applicationCount: pendingApps.filter(a => a.jobId._id === app.jobId._id).length
          });
        }
        return acc;
      }, []);
      setAvailableJobs(uniqueJobs);
    } catch (error) {
      console.error('Error fetching pending applications:', error);
    }
  };

  const fetchRejectedApplications = async () => {
    try {
      const response = await api.get('/api/applications');
      const data = response.data || [];
      console.log('[DEBUG] All applications for rejected filter:', data);
      
      // Filter for ALL applications that are rejected (remove botProcessed requirement)
      const rejectedApps = data.filter(app => 
        app.jobId && 
        app.status === 'rejected'
      );
      console.log('[DEBUG] Fetched rejected applications:', {
        totalApplications: data.length,
        rejectedAppsCount: rejectedApps.length,
        rejectedApps: rejectedApps,
        rejectedStatusApps: data.filter(app => app.status === 'rejected'),
        botProcessedApps: data.filter(app => app.shortlistingInfo?.botProcessed)
      });
      setRejectedApplications(rejectedApps);
    } catch (error) {
      console.error('Error fetching rejected applications:', error);
      setRejectedApplications([]); // Set empty array on error
    }
  };

  const fetchShortlistedApplications = async () => {
    try {
      const response = await api.get('/api/applications');
      const data = response.data || [];
      console.log('[DEBUG] All applications for shortlisted filter:', data);
      
      // Filter for ALL applications that are shortlisted (remove botProcessed requirement)
      const shortlistedApps = data.filter(app => 
        app.jobId && 
        app.status === 'shortlisted'
      );
      console.log('[DEBUG] Fetched shortlisted applications:', {
        totalApplications: data.length,
        shortlistedAppsCount: shortlistedApps.length,
        shortlistedApps: shortlistedApps,
        shortlistedStatusApps: data.filter(app => app.status === 'shortlisted'),
        botProcessedApps: data.filter(app => app.shortlistingInfo?.botProcessed)
      });
      setShortlistedApplications(shortlistedApps);
    } catch (error) {
      console.error('Error fetching shortlisted applications:', error);
      setShortlistedApplications([]); // Set empty array on error
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/bot-mimic/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleProcessApplication = async (application) => {
    try {
      // Ask for minimum score
      const currentScore = application.jobId?.botSettings?.minimumScore || 5;
      const minimumScoreInput = prompt(
        `Enter minimum score for processing this application:\n\nJob: ${application.jobId?.title}\nCurrent minimum score: ${currentScore}`,
        currentScore.toString()
      );
      
      if (minimumScoreInput === null) {
        return; // User cancelled
      }
      
      const minimumScore = parseInt(minimumScoreInput);
      if (isNaN(minimumScore) || minimumScore < 0 || minimumScore > 100) {
        alert('Please enter a valid minimum score between 0 and 100');
        return;
      }
      
      setLoading(true);
      console.log('[BOT] Processing application with minimum score:', minimumScore);
      
      // Process application with user-specified minimum score
      const response = await api.post(`/api/bot-mimic/process/${application._id}`, {
        passMark: minimumScore,
        botNotes: `Processed with minimum score: ${minimumScore}`
      });
      
      // Refresh applications and close modal to force refresh
      console.log('[DEBUG] Refreshing applications after processing...');
      setShowApplicationsModal(false); // Close modal first
      await fetchPendingApplications();
      await fetchRejectedApplications();
      await fetchShortlistedApplications();
      await fetchStats();
      console.log('[DEBUG] Applications refreshed successfully');
      
      alert(`${response.data.message}\nScore: ${response.data.score}/${minimumScore}\nStatus: ${response.data.status.toUpperCase()}`);
      
      // Reopen modal to show updated data
      setShowApplicationsModal(true);
    } catch (error) {
      console.error('Error processing application:', error);
      console.error('Error response:', error.response?.data);
      alert('Error processing application: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };


  const handleStatusChange = async (newStatus, notes = '') => {
    if (!selectedApplicationForView) return;

    try {
      setLoading(true);
      
      const updateData = {
        status: newStatus,
        currentStage: getStatusStage(newStatus),
        'shortlistingInfo.manualStatusChange': true,
        'shortlistingInfo.manualStatusChangeBy': user._id,
        'shortlistingInfo.manualStatusChangeAt': new Date(),
        'shortlistingInfo.manualStatusChangeNotes': notes
      };

      // Add rejection details if status is rejected
      if (newStatus === 'rejected') {
        updateData['shortlistingInfo.rejectedBy'] = 'manual';
        updateData['shortlistingInfo.rejectedAt'] = new Date();
        updateData['shortlistingInfo.rejectionReason'] = notes || 'Manually rejected by admin';
      }

      console.log('Updating application status:', {
        applicationId: selectedApplicationForView._id,
        updateData: updateData
      });

      const response = await api.put(`/api/applications/${selectedApplicationForView._id}/status`, updateData);
      console.log('Status update response:', response.data);

      // Refresh applications
      await fetchPendingApplications();
      await fetchRejectedApplications();
      
      // Close modal
      setShowApplicationViewer(false);
      setSelectedApplicationForView(null);
      
      alert(`Application status changed to ${newStatus.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Error changing application status:', error);
      console.error('Error response:', error.response?.data);
      alert('Error changing application status: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusStage = (status) => {
    const stages = {
      'applied': 'Application Submitted',
      'shortlisted': 'Shortlisted',
      'reviewed': 'Under Review',
      'interview_scheduled': 'Interview Scheduled',
      'interview_completed': 'Interview Completed',
      'offer': 'Offer Made',
      'rejected': 'Rejected',
      'withdrawn': 'Withdrawn'
    };
    return stages[status] || status;
  };

  const handleResumeView = () => {
    if (selectedApplicationForView?.resume?.path) {
      // Open resume in new tab
      let resumeUrl = selectedApplicationForView.resume.path;
      
      // Ensure the path starts with /uploads/
      if (!resumeUrl.startsWith('/uploads/')) {
        resumeUrl = `/uploads/${resumeUrl}`;
      }
      
      // Add the full URL
      resumeUrl = `http://localhost:5000${resumeUrl}`;
      
      console.log('Opening resume URL:', resumeUrl);
      window.open(resumeUrl, '_blank');
    } else {
      alert('No resume available for this application');
    }
  };

  const handleProcessAllApplications = () => {
    if (availableJobs.length === 0) {
      alert('No pending applications found for processing.');
      return;
    }
    setShowJobSelectionModal(true);
  };

  const handleTabClick = (tab) => {
    console.log('[DEBUG] Tab clicked:', tab);
    console.log('[DEBUG] Current state:', {
      pendingApplications: pendingApplications.length,
      shortlistedApplications: shortlistedApplications.length,
      rejectedApplications: rejectedApplications.length
    });
    setActiveTab(tab);
    setShowApplicationsModal(true);
  };

  const renderApplicationsInModal = () => {
    let applications = [];
    let emptyMessage = '';

    switch (activeTab) {
      case 'pending':
        applications = pendingApplications;
        emptyMessage = 'No pending applications. All technical applications have been processed!';
        break;
      case 'shortlisted':
        applications = shortlistedApplications;
        emptyMessage = 'No shortlisted applications yet.';
        break;
      case 'rejected':
        applications = rejectedApplications;
        emptyMessage = 'No rejected applications yet.';
        break;
      default:
        applications = pendingApplications;
        emptyMessage = 'No pending applications. All technical applications have been processed!';
    }

    console.log('[DEBUG] Modal rendering for tab:', activeTab, {
      applicationsCount: applications.length,
      applications: applications.map(app => ({
        id: app._id,
        status: app.status,
        jobTitle: app.jobId?.title,
        applicantName: app.applicantId?.name
      }))
    });

    if (applications.length === 0) {
      return (
        <div className="no-applications">
          <div className="no-applications-icon">
            {activeTab === 'pending' ? 'DONE' : activeTab === 'shortlisted' ? 'SUCCESS' : 'FAILED'}
          </div>
          <h3>No {activeTab} applications</h3>
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="applications-grid">
        {applications.map((application) => (
          <div key={application._id} className="application-card">
            <div className="application-header">
              <h3>{application.jobId?.title || 'Unknown Job'}</h3>
              <span className="department-badge">{application.jobId?.department || 'Unknown'}</span>
            </div>
            <div className="application-info">
              <p><strong>Applicant:</strong> {application.applicantId?.name || application.applicantId?.email || 'Unknown'}</p>
              <p><strong>Email:</strong> {application.applicantId?.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {application.applicantId?.phone || 'N/A'}</p>
              <p><strong>Applied:</strong> {new Date(application.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="application-actions">
              {/* Show score if application has been processed */}
              {application.shortlistingInfo?.botProcessed && (
                <div className="score-display">
                  <div className="score-info">
                    <span className="score-label">Bot Score:</span>
                    <span className={`score-value ${application.shortlistingInfo.shortlistingScore >= (application.shortlistingInfo.passMark || 50) ? 'pass' : 'fail'}`}>
                      {application.shortlistingInfo.shortlistingScore}/{application.shortlistingInfo.passMark || 50}
                    </span>
                  </div>
                  <div className="status-badge">
                    {application.status === 'shortlisted' ? 'SUCCESS Shortlisted' : 'FAILED Rejected'}
                  </div>
                </div>
              )}
              
              {/* Process button only for pending applications */}
              {activeTab === 'pending' && (
                <button
                  onClick={() => handleProcessApplication(application)}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <PlayIcon />
                  {loading ? 'Processing...' : 'Process Application'}
                </button>
              )}
              
              {/* View button for all applications */}
              <button
                onClick={() => {
                  setSelectedApplicationForView(application);
                  setShowApplicationViewer(true);
                  setShowApplicationsModal(false);
                }}
                className="btn btn-secondary"
              >
                <EyeIcon />
                View Details
              </button>
              
              {/* Reprocess button for shortlisted and rejected applications */}
              {(activeTab === 'shortlisted' || activeTab === 'rejected') && (
                <button
                  onClick={() => handleProcessApplication(application)}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <PlayIcon />
                  {loading ? 'Reprocessing...' : 'Reprocess'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const processApplicationsForJob = async () => {
    if (!selectedJob) return;
    
    // Ask for minimum score
    const currentScore = selectedJob.botSettings?.minimumScore || 5;
    const minimumScoreInput = prompt(
      `Enter minimum score for processing applications:\n\nJob: ${selectedJob.title}\nCurrent minimum score: ${currentScore}`,
      currentScore.toString()
    );
    
    if (minimumScoreInput === null) {
      return; // User cancelled
    }
    
    const minimumScore = parseInt(minimumScoreInput);
    if (isNaN(minimumScore) || minimumScore < 0 || minimumScore > 100) {
      alert('Please enter a valid minimum score between 0 and 100');
      return;
    }
    
    setLoading(true);
    setShowJobSelectionModal(false);
    
    try {
      const response = await api.post('/api/bot-mimic/process', { 
        jobId: selectedJob._id,
        passMark: minimumScore
      });
      const results = response.data.results;
      
      // Show detailed results
      let alertMessage = `Bot Processing Complete!\n\n`;
      alertMessage += `Job: ${selectedJob.title}\n`;
      alertMessage += `Minimum Score: ${minimumScore}\n`;
      alertMessage += `Processed: ${results.length} applications\n\n`;
      
      results.forEach((result, index) => {
        alertMessage += `${index + 1}. ${result.applicantName}\n`;
        alertMessage += `   Score: ${result.score}/${minimumScore}\n`;
        alertMessage += `   Status: ${result.statusMessage}\n`;
        if (result.matchedKeywords.length > 0) {
          alertMessage += `   Keywords: ${result.matchedKeywords.join(', ')}\n`;
        }
        alertMessage += `\n`;
      });
      
      alert(alertMessage);
      console.log('[DEBUG] Refreshing applications after bulk processing...');
      await fetchPendingApplications();
      await fetchRejectedApplications();
      await fetchShortlistedApplications();
      await fetchStats();
      console.log('[DEBUG] Applications refreshed successfully after bulk processing');
    } catch (error) {
      console.error('Error processing applications:', error);
      alert('Error processing applications: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setSelectedJob(null);
    }
  };

  // Check if user has proper role
  if (!user) {
    return <div className="loading">Please log in to access this page.</div>;
  }

  if (user.role !== 'bot_mimic') {
    return (
      <div className="bot-mimic-dashboard">
        <div className="error-message">
          <h2>Access Denied</h2>
          <p>Only bot mimic users can access this dashboard.</p>
          <p>Your current role: <strong>{user.role}</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="bot-mimic-dashboard">
      <div className="dashboard-header">
        <h1>Bot Mimic Dashboard</h1>
        <p>Process technical applications using automated keyword matching</p>
        {user && (
          <div className="user-info">
            <p>Logged in as: <strong>{user.name}</strong> ({user.role})</p>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className={`stat-card clickable ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => handleTabClick('pending')}>
          <div className="stat-icon">
            <ClockIcon />
          </div>
          <div className="stat-content">
            <h3>{pendingApplications.length}</h3>
            <p>Pending Applications</p>
          </div>
        </div>
        <div className={`stat-card clickable ${activeTab === 'shortlisted' ? 'active' : ''}`} onClick={() => handleTabClick('shortlisted')}>
          <div className="stat-icon">
            <CheckCircleIcon />
          </div>
          <div className="stat-content">
            <h3>{shortlistedApplications.length}</h3>
            <p>Shortlisted</p>
          </div>
        </div>
        <div className={`stat-card clickable ${activeTab === 'rejected' ? 'active' : ''}`} onClick={() => handleTabClick('rejected')}>
          <div className="stat-icon">
            <XCircleIcon />
          </div>
          <div className="stat-content">
            <h3>{rejectedApplications.length}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      <div className="bot-actions-section">
        <h2>
          <BotIcon />
          Bot Actions
        </h2>
        <div className="bot-controls">
          <div className="pass-mark-control">
            <label>Bot will use minimum score from job settings</label>
          </div>
          <button 
            onClick={handleProcessAllApplications}
            disabled={loading || availableJobs.length === 0}
            className="btn-primary btn-lg"
          >
            <BotIcon />
            {loading ? 'Processing...' : `Process Applications (${availableJobs.length} jobs available)`}
          </button>
          <p className="bot-description">
            Process technical role applications based on configured keywords and workflow rules.
            You can set a custom minimum score for each processing session. Bot will analyze and score applications,
            then automatically move them to shortlisted or rejected based on your minimum score threshold.
          </p>
        </div>
      </div>

      {/* Applications Modal */}
      {showApplicationsModal && (
        <div className="modal-overlay">
          <div className="modal-content applications-modal">
            <div className="modal-header">
              <h2>
                {activeTab === 'pending' ? 'Pending Applications' : 
                 activeTab === 'shortlisted' ? 'Shortlisted Applications' : 
                 activeTab === 'rejected' ? 'Rejected Applications' : 
                 'Applications'}
              </h2>
              <button 
                onClick={() => setShowApplicationsModal(false)}
                className="close-btn"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              {renderApplicationsInModal()}
            </div>
          </div>
        </div>
      )}

      {/* Job Selection Modal */}
      {showJobSelectionModal && (
        <div className="modal-overlay">
          <div className="modal-content job-selection-modal">
            <div className="modal-header">
              <h3>Select Job Role to Process</h3>
              <button 
                onClick={() => setShowJobSelectionModal(false)}
                className="close-btn"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <p>Choose which job role you want to process applications for:</p>
              <div className="job-list">
                {availableJobs.map((job) => (
                  <div 
                    key={job._id}
                    className={`job-option ${selectedJob?._id === job._id ? 'selected' : ''}`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="job-info">
                      <h4>{job.title}</h4>
                      <p className="job-department">{job.department}</p>
                      <p className="job-count">{job.applicationCount} pending application{job.applicationCount !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="job-radio">
                      <input
                        type="radio"
                        name="selectedJob"
                        checked={selectedJob?._id === job._id}
                        onChange={() => setSelectedJob(job)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowJobSelectionModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={processApplicationsForJob}
                disabled={!selectedJob}
                className="btn-primary"
              >
                Process Applications for {selectedJob?.title || 'Selected Job'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Viewer Modal */}
      {showApplicationViewer && selectedApplicationForView && (
        <div className="modal-overlay">
          <div className="modal-content application-viewer-modal">
            <div className="modal-header">
              <h2>Application Details</h2>
              <button 
                onClick={() => setShowApplicationViewer(false)}
                className="close-btn"
              >
                <CloseIcon />
              </button>
            </div>
            
            <div className="modal-body application-details">
              {/* Applicant Information */}
              <div className="detail-section">
                <h3>Applicant Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Name:</strong> {selectedApplicationForView.applicantId.name}
                  </div>
                  <div className="detail-item">
                    <strong>Email:</strong> {selectedApplicationForView.applicantId.email}
                  </div>
                  <div className="detail-item">
                    <strong>Phone:</strong> {selectedApplicationForView.applicantId.phone}
                  </div>
                </div>
              </div>

              {/* Job Information */}
              <div className="detail-section">
                <h3>Job Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Position:</strong> {selectedApplicationForView.jobId.title}
                  </div>
                  <div className="detail-item">
                    <strong>Department:</strong> {selectedApplicationForView.jobId.department}
                  </div>
                  <div className="detail-item">
                    <strong>Applied:</strong> {new Date(selectedApplicationForView.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Application Status */}
              <div className="detail-section">
                <h3>Application Status</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Current Status:</strong> 
                    <span className={`status-badge ${selectedApplicationForView.status}`}>
                      {selectedApplicationForView.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Current Stage:</strong> {selectedApplicationForView.currentStage}
                  </div>
                  {selectedApplicationForView.shortlistingInfo?.rejectedAt && (
                    <div className="detail-item">
                      <strong>Rejected:</strong> {new Date(selectedApplicationForView.shortlistingInfo.rejectedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Bot Processing Details */}
              {selectedApplicationForView.shortlistingInfo?.botProcessed && (
                <div className="detail-section">
                  <h3>Bot Processing</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>Bot Score:</strong> {selectedApplicationForView.shortlistingInfo.shortlistingScore || 'N/A'}/{selectedApplicationForView.shortlistingInfo.passMark || 'N/A'}
                    </div>
                    <div className="detail-item">
                      <strong>Bot Recommendation:</strong> {selectedApplicationForView.shortlistingInfo.botRecommendation || 'N/A'}
                    </div>
                    <div className="detail-item">
                      <strong>Bot Notes:</strong> {selectedApplicationForView.shortlistingInfo.botNotes || 'None'}
                    </div>
                    {selectedApplicationForView.shortlistingInfo?.rejectionReason && (
                      <div className="detail-item">
                        <strong>Rejection Reason:</strong> {selectedApplicationForView.shortlistingInfo.rejectionReason}
                      </div>
                    )}
                    {selectedApplicationForView.shortlistingInfo?.keywordMatches?.length > 0 && (
                      <div className="detail-item">
                        <strong>Matched Keywords:</strong> {selectedApplicationForView.shortlistingInfo.keywordMatches.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Application Content */}
              <div className="detail-section">
                <h3>Application Content</h3>
                
                {selectedApplicationForView.formData?.personalInfo && Object.keys(selectedApplicationForView.formData.personalInfo).length > 0 && (
                  <div className="content-subsection">
                    <h4>Personal Information</h4>
                    <pre className="content-display">{JSON.stringify(selectedApplicationForView.formData.personalInfo, null, 2)}</pre>
                  </div>
                )}

                {selectedApplicationForView.formData?.professionalInfo && Object.keys(selectedApplicationForView.formData.professionalInfo).length > 0 && (
                  <div className="content-subsection">
                    <h4>Professional Information</h4>
                    <pre className="content-display">{JSON.stringify(selectedApplicationForView.formData.professionalInfo, null, 2)}</pre>
                  </div>
                )}

                {selectedApplicationForView.formData?.education && selectedApplicationForView.formData.education.length > 0 && (
                  <div className="content-subsection">
                    <h4>Education</h4>
                    <pre className="content-display">{JSON.stringify(selectedApplicationForView.formData.education, null, 2)}</pre>
                  </div>
                )}

                {selectedApplicationForView.formData?.workExperience && selectedApplicationForView.formData.workExperience.length > 0 && (
                  <div className="content-subsection">
                    <h4>Work Experience</h4>
                    <pre className="content-display">{JSON.stringify(selectedApplicationForView.formData.workExperience, null, 2)}</pre>
                  </div>
                )}

                {selectedApplicationForView.formData?.skills && selectedApplicationForView.formData.skills.length > 0 && (
                  <div className="content-subsection">
                    <h4>Skills</h4>
                    <pre className="content-display">{JSON.stringify(selectedApplicationForView.formData.skills, null, 2)}</pre>
                  </div>
                )}

                {selectedApplicationForView.formData?.coverLetter && (
                  <div className="content-subsection">
                    <h4>Cover Letter</h4>
                    <div className="content-display">{selectedApplicationForView.formData.coverLetter}</div>
                  </div>
                )}

                {selectedApplicationForView.formData?.additionalInfo && Object.keys(selectedApplicationForView.formData.additionalInfo).length > 0 && (
                  <div className="content-subsection">
                    <h4>Additional Information</h4>
                    <pre className="content-display">{JSON.stringify(selectedApplicationForView.formData.additionalInfo, null, 2)}</pre>
                  </div>
                )}
              </div>

              {/* Resume Section */}
              {selectedApplicationForView.formData?.resume && (
                <div className="detail-section">
                  <h3>Resume</h3>
                  <div className="resume-info">
                    <div className="detail-item">
                      <strong>File Name:</strong> {selectedApplicationForView.formData.resume.originalName}
                    </div>
                    <div className="detail-item">
                      <strong>File Size:</strong> {(selectedApplicationForView.formData.resume.size / 1024).toFixed(2)} KB
                    </div>
                    <div className="detail-item">
                      <strong>File Type:</strong> {selectedApplicationForView.formData.resume.mimetype}
                    </div>
                    <button 
                      onClick={handleResumeView}
                      className="resume-view-btn"
                    >
                      View Resume
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="modal-footer">
              <div className="status-change-section">
                <h4>Manual Status Update:</h4>
                <div className="status-buttons">
                  <button 
                    onClick={() => handleStatusChange('shortlisted', 'Manually shortlisted by bot user')}
                    className="status-btn shortlist-btn"
                    disabled={loading}
                  >
                    <CheckCircleIcon />
                    Shortlist
                  </button>
                  <button 
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:');
                      if (reason !== null) {
                        handleStatusChange('rejected', reason);
                      }
                    }}
                    className="status-btn reject-btn"
                    disabled={loading}
                  >
                    <XCircleIcon />
                    Reject
                  </button>
                  <button 
                    onClick={() => {
                      const notes = prompt('Enter review notes:');
                      if (notes !== null) {
                        handleStatusChange('reviewed', notes);
                      }
                    }}
                    className="status-btn review-btn"
                    disabled={loading}
                  >
                    <SettingsIcon />
                    Mark as Reviewed
                  </button>
                  <button 
                    onClick={() => handleStatusChange('interview_scheduled', 'Interview scheduled by bot user')}
                    className="status-btn interview-btn"
                    disabled={loading}
                  >
                    <ClockIcon />
                    Schedule Interview
                  </button>
                </div>
                
                {/* Minimum Score Update */}
                {selectedApplicationForView.jobId && (
                  <div className="minimum-score-section">
                    <h4>Update Minimum Score for Job:</h4>
                    <div className="score-input-section">
                      <label>Current Minimum Score: {selectedApplicationForView.jobId.botSettings?.minimumScore || 50}</label>
                      <div className="score-input-group">
                        <input
                          type="number"
                          id="minimumScore"
                          min="0"
                          max="100"
                          defaultValue={selectedApplicationForView.jobId.botSettings?.minimumScore || 50}
                          className="score-input"
                        />
                        <button
                          onClick={async () => {
                            const newScore = document.getElementById('minimumScore').value;
                            if (newScore && newScore >= 0 && newScore <= 100) {
                              try {
                                await api.put(`/api/jobs/${selectedApplicationForView.jobId._id}`, {
                                  botSettings: {
                                    minimumScore: parseInt(newScore)
                                  }
                                });
                                alert(`Minimum score updated to ${newScore} for job: ${selectedApplicationForView.jobId.title}`);
                              } catch (error) {
                                console.error('Error updating minimum score:', error);
                                alert('Error updating minimum score: ' + (error.response?.data?.message || error.message));
                              }
                            } else {
                              alert('Please enter a valid score between 0 and 100');
                            }
                          }}
                          className="btn btn-primary"
                          disabled={loading}
                        >
                          Update Score
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button 
                  onClick={() => setShowApplicationViewer(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotMimicDashboard;