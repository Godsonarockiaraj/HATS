import React from 'react';
import { getStatIcon } from './ProfessionalIcons';
import './HeroSection.css';

const HeroSection = ({ user, stats }) => {
  console.log('[DEBUG] HeroSection received stats:', stats);
  console.log('[DEBUG] HeroSection user role:', user?.role);
  console.log('[DEBUG] HeroSection stats breakdown:', {
    totalApplications: stats?.totalApplications,
    pendingApplications: stats?.pendingApplications,
    shortlistedApplications: stats?.shortlistedApplications,
    rejectedApplications: stats?.rejectedApplications
  });
  
  const getWelcomeMessage = () => {
    if (!user) return 'Welcome to the Future of Hiring';
    
    switch (user.role) {
      case 'admin':
        return 'Manage Your Talent Pipeline';
      case 'bot_mimic':
        return 'Automated Intelligence at Work';
      case 'applicant':
        return 'Your Career Journey Starts Here';
      default:
        return 'Welcome to the Future of Hiring';
    }
  };

  const getSubtitle = () => {
    if (!user) return 'Streamline recruitment with AI-powered candidate screening and management.';
    
    switch (user.role) {
      case 'admin':
        return 'Streamline recruitment with intelligent automation and comprehensive analytics.';
      case 'bot_mimic':
        return 'AI-driven candidate evaluation and shortlisting for optimal hiring decisions.';
      case 'applicant':
        return 'Discover opportunities and showcase your potential to top employers.';
      default:
        return 'Streamline recruitment with AI-powered candidate screening and management.';
    }
  };


  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="hero-gradient"></div>
        <div className="hero-pattern"></div>
      </div>
      
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title animate-fade-in">
              {getWelcomeMessage()}
            </h1>
            <p className="hero-subtitle animate-fade-in">
              {getSubtitle()}
            </p>
            
          </div>
          
        </div>
        
        <div className="hero-visual">
          <div className="hero-stats-grid">
            {user?.role === 'applicant' ? (
              // Applicant-specific stats (4 cards)
              <>
                <div className="hero-stat-card card-1">
                  <div className="hero-stat-icon">
                    {getStatIcon('pending')}
                  </div>
                  <div className="hero-stat-value">{stats?.totalApplications || 0}</div>
                  <div className="hero-stat-label">Total Applications</div>
                </div>
                
                <div className="hero-stat-card card-2">
                  <div className="hero-stat-icon">
                    {getStatIcon('pending')}
                  </div>
                  <div className="hero-stat-value">{stats?.pendingApplications || 0}</div>
                  <div className="hero-stat-label">Pending</div>
                </div>
                
                <div className="hero-stat-card card-3">
                  <div className="hero-stat-icon">
                    {getStatIcon('shortlisted')}
                  </div>
                  <div className="hero-stat-value">{stats?.shortlistedApplications || 0}</div>
                  <div className="hero-stat-label">Shortlisted</div>
                </div>
                
                <div className="hero-stat-card card-4">
                  <div className="hero-stat-icon">
                    {getStatIcon('rejected')}
                  </div>
                  <div className="hero-stat-value">{stats?.rejectedApplications || 0}</div>
                  <div className="hero-stat-label">Rejected</div>
                </div>
              </>
            ) : (
              // Admin/Bot stats (4 cards)
              <>
                <div className="hero-stat-card card-1">
                  <div className="hero-stat-icon">
                    {getStatIcon('pending')}
                  </div>
                  <div className="hero-stat-value">{stats?.totalApplications || 0}</div>
                  <div className="hero-stat-label">Total Applications</div>
                </div>
                
                <div className="hero-stat-card card-2">
                  <div className="hero-stat-icon">
                    {getStatIcon('pending')}
                  </div>
                  <div className="hero-stat-value">{stats?.pendingApplications || 0}</div>
                  <div className="hero-stat-label">Pending</div>
                </div>
                
                <div className="hero-stat-card card-3">
                  <div className="hero-stat-icon">
                    {getStatIcon('shortlisted')}
                  </div>
                  <div className="hero-stat-value">{stats?.shortlistedApplications || 0}</div>
                  <div className="hero-stat-label">Shortlisted</div>
                </div>
                
                <div className="hero-stat-card card-4">
                  <div className="hero-stat-icon">
                    {getStatIcon('rejected')}
                  </div>
                  <div className="hero-stat-value">{stats?.rejectedApplications || 0}</div>
                  <div className="hero-stat-label">Rejected</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
