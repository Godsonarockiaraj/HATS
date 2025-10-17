import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  DashboardIcon, 
  UsersIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  TrendingUpIcon,
  BarChartIcon,
  SettingsIcon,
  PlusIcon,
  EyeIcon,
  FileTextIcon,
  FilterIcon,
  DownloadIcon,
  RefreshIcon,
  BotIcon
} from './ProfessionalIcons';
import HeroSection from './HeroSection';
import '../styles/design-system.css';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    shortlistedApplications: 0,
    rejectedApplications: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentApplications, setRecentApplications] = useState([]);
  const [analytics, setAnalytics] = useState({
    applicationsByDepartment: [],
    applicationsByMonth: [],
    topSkills: [],
    processingTime: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/dashboard');
      
      // Handle different data structures based on user role
      if (user?.role === 'applicant') {
        const applicantData = response.data;
        console.log('[DEBUG] Applicant dashboard data received:', applicantData);
        setStats({
          totalApplications: applicantData.totalApplications || 0,
          pendingApplications: applicantData.statusCounts?.pending || 0,
          shortlistedApplications: applicantData.statusCounts?.shortlisted || 0,
          rejectedApplications: applicantData.statusCounts?.rejected || 0,
          successRate: 0
        });
        setRecentApplications(applicantData.recentApplications || []);
      } else {
        console.log('[DEBUG] Admin/Bot dashboard data received:', response.data);
        console.log('[DEBUG] Raw stats object:', response.data.stats);
        console.log('[DEBUG] User role:', user?.role);
        
        // Ensure we have proper stats data
        const statsData = {
          totalApplications: response.data.stats?.totalApplications || 0,
          pendingApplications: response.data.stats?.pendingApplications || 0,
          shortlistedApplications: response.data.stats?.shortlistedApplications || 0,
          rejectedApplications: response.data.stats?.rejectedApplications || 0,
          successRate: response.data.stats?.successRate || 0
        };
        
        console.log('[DEBUG] Setting stats to:', statsData);
        setStats(statsData);
        setRecentApplications(response.data.recentApplications || []);
      }
      
      // Mock analytics data for demonstration
      setAnalytics({
        applicationsByDepartment: [
          { department: 'Engineering', count: 45, percentage: 35 },
          { department: 'Marketing', count: 28, percentage: 22 },
          { department: 'Sales', count: 32, percentage: 25 },
          { department: 'HR', count: 23, percentage: 18 }
        ],
        applicationsByMonth: [
          { month: 'Jan', count: 12 },
          { month: 'Feb', count: 18 },
          { month: 'Mar', count: 25 },
          { month: 'Apr', count: 32 },
          { month: 'May', count: 28 },
          { month: 'Jun', count: 35 }
        ],
        topSkills: [
          { skill: 'JavaScript', count: 45 },
          { skill: 'React', count: 38 },
          { skill: 'Node.js', count: 32 },
          { skill: 'Python', count: 28 },
          { skill: 'Java', count: 25 }
        ],
        processingTime: 2.4
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Set default stats on error
      setStats({
        totalApplications: 0,
        pendingApplications: 0,
        shortlistedApplications: 0,
        rejectedApplications: 0,
        successRate: 0
      });
      setRecentApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatCards = () => {
    if (!stats) return [];
    
    const cards = [
      {
        title: 'Total Applications',
        value: stats.totalApplications || 0,
        icon: <FileTextIcon />,
        type: 'total',
        color: 'blue'
      },
      {
        title: 'Pending Review',
        value: stats.pendingApplications || 0,
        icon: <ClockIcon />,
        type: 'pending',
        color: 'amber'
      },
      {
        title: 'Shortlisted',
        value: stats.shortlistedApplications || 0,
        icon: <CheckCircleIcon />,
        type: 'shortlisted',
        color: 'emerald'
      },
      {
        title: 'Rejected',
        value: stats.rejectedApplications || 0,
        icon: <XCircleIcon />,
        type: 'rejected',
        color: 'rose'
      }
    ];

    return cards;
  };

  const getQuickActions = () => [
    {
      title: 'Create New Job',
      description: 'Post a new job opening',
      icon: <PlusIcon />,
      action: () => navigate('/dashboard/jobs'),
      color: 'blue'
    },
    {
      title: 'View Applications',
      description: 'Review all applications',
      icon: <EyeIcon />,
      action: () => navigate('/dashboard/applications'),
      color: 'emerald'
    },
    {
      title: 'Bot Dashboard',
      description: 'Automated processing',
      icon: <BarChartIcon />,
      action: () => navigate('/dashboard/bot-dashboard'),
      color: 'purple'
    },
    {
      title: 'System Settings',
      description: 'Configure system',
      icon: <SettingsIcon />,
      action: () => alert('Settings coming soon!'),
      color: 'gray'
    }
  ];

  const renderAdminGuide = () => null;

  const renderAnalytics = () => null;

  if (loading) {
    return (
    <div className="dashboard">
        <div className="dashboard-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <HeroSection user={user} stats={stats} />
      
      <div className="dashboard-container">
        {/* Admin Guide Section */}
        {user?.role === 'admin' && renderAdminGuide()}

        {/* Quick Stats */}
        <div className="quick-stats-section">
          <h2 className="section-title">Quick Overview</h2>
          <div className="quick-stats-grid">
            {getStatCards().map((card, index) => (
              <div key={index} className={`quick-stat-card ${card.color}`}>
                <div className="quick-stat-icon">
                  {card.icon}
                </div>
                <div className="quick-stat-content">
                  <div className="quick-stat-number">{card.value}</div>
                  <div className="quick-stat-title">{card.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        {user?.role === 'admin' && (
          <div className="quick-actions-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions-grid">
              {getQuickActions().map((action, index) => (
                <button 
                  key={index} 
                  className={`quick-action-card ${action.color}`}
                  onClick={action.action}
                >
                  <div className="action-icon">
                    {action.icon}
                  </div>
                  <div className="action-content">
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
        </div>
                </button>
              ))}
        </div>
      </div>
        )}

        {/* Analytics Section */}
        {user?.role === 'admin' && renderAnalytics()}

        {/* Recent Applications */}
        {recentApplications.length > 0 && (
          <div className="recent-applications">
            <div className="recent-applications-header">
              <h2 className="recent-applications-title">
                <FileTextIcon />
                Recent Applications
              </h2>
              <button 
                className="view-all-btn"
                onClick={() => navigate('/dashboard/applications')}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <EyeIcon />
                View All
              </button>
            </div>
            <div className="applications-table-container">
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Position</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Date Applied</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.slice(0, 5).map((app, index) => (
                    <tr key={index}>
                      <td>
                        <div className="applicant-info">
                          <div className="applicant-name">{app.applicantName || 'Unknown'}</div>
                          <div className="applicant-email">{app.applicantEmail || ''}</div>
                        </div>
                      </td>
                      <td>{app.jobTitle || 'Unknown Position'}</td>
                      <td>{app.department || 'N/A'}</td>
                      <td>
                        <span className={`status-badge status-${app.status}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="action-btn">
                          <EyeIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
        </div>
      </div>
        )}

        {/* Empty State */}
        {recentApplications.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <FileTextIcon />
            </div>
            <h3 className="empty-title">No Applications Yet</h3>
            <p className="empty-description">
              Applications will appear here once candidates start applying to your job postings.
            </p>
            <div className="empty-actions">
              <button className="btn-primary" onClick={() => navigate('/dashboard/jobs')}>
                <PlusIcon />
                Create Your First Job
          </button>
        </div>
      </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;