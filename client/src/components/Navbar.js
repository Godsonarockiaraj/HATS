import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { 
  NotificationIcon, 
  LogOutIcon, 
  DashboardIcon, 
  FileTextIcon, 
  BriefcaseIcon, 
  BotIcon,
  MenuIcon,
  XIcon
} from './ProfessionalIcons';
import api from '../api/axios';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    // Navigate first, then logout to avoid redirect conflicts
    navigate('/login', { replace: true });
    // Small delay to ensure navigation happens before logout
    setTimeout(() => {
      logout();
    }, 100);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const closeNotifications = () => {
    setIsNotificationOpen(false);
  };

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/api/notifications/unread-count');
        setUnreadCount(response.data.count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    if (user) {
      fetchUnreadCount();
      
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'applicant': return 'Applicant';
      case 'admin': return 'Admin';
      case 'bot_mimic': return 'Bot Mimic';
      default: return role;
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h3>HATS</h3>
        <span className="navbar-subtitle">Application Tracking System</span>
      </div>
      
      {/* Mobile menu button */}
      <button 
        className="mobile-menu-btn"
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
      >
        {isMobileMenuOpen ? <XIcon /> : <MenuIcon />}
      </button>

      {/* Desktop navigation */}
      <div className="navbar-links desktop-nav">
        <Link to="/dashboard" className="nav-link" onClick={closeMobileMenu}>
          <DashboardIcon />
          Dashboard
        </Link>
        <Link to="/dashboard/applications" className="nav-link" onClick={closeMobileMenu}>
          <FileTextIcon />
          Applications
        </Link>
        <Link to="/dashboard/jobs" className="nav-link" onClick={closeMobileMenu}>
          <BriefcaseIcon />
          Jobs
        </Link>
        {user?.role === 'bot_mimic' && (
          <Link to="/dashboard/bot-dashboard" className="nav-link" onClick={closeMobileMenu}>
            <BotIcon />
            Bot Dashboard
          </Link>
        )}
      </div>

      <div className="navbar-user desktop-nav">
        {/* Notification Icon */}
        <div className="notification-container">
          <button 
            onClick={toggleNotifications}
            className="notification-btn"
            aria-label="Notifications"
          >
            <NotificationIcon />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          <NotificationDropdown 
            isOpen={isNotificationOpen} 
            onClose={closeNotifications}
          />
        </div>

        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{getRoleDisplay(user?.role)}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <LogOutIcon />
          Logout
        </button>
      </div>

      {/* Mobile navigation overlay */}
      <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu}>
        <div className="mobile-nav-content" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-nav-header">
            <div className="user-info">
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{getRoleDisplay(user?.role)}</span>
              </div>
            </div>
            
            {/* Mobile Notification Icon */}
            <div className="mobile-notification-container">
              <button 
                onClick={toggleNotifications}
                className="mobile-notification-btn"
                aria-label="Notifications"
              >
                <NotificationIcon />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>
            </div>
          </div>
          
          <div className="mobile-nav-links">
            <Link to="/dashboard" className="mobile-nav-link" onClick={closeMobileMenu}>
              <DashboardIcon />
              <span>Dashboard</span>
            </Link>
            <Link to="/dashboard/applications" className="mobile-nav-link" onClick={closeMobileMenu}>
              <FileTextIcon />
              <span>Applications</span>
            </Link>
            <Link to="/dashboard/jobs" className="mobile-nav-link" onClick={closeMobileMenu}>
              <BriefcaseIcon />
              <span>Jobs</span>
            </Link>
            {user?.role === 'bot_mimic' && (
              <Link to="/dashboard/bot-dashboard" className="mobile-nav-link" onClick={closeMobileMenu}>
                <BotIcon />
                <span>Bot Dashboard</span>
              </Link>
            )}
          </div>
          
          <div className="mobile-nav-footer">
            <button onClick={handleLogout} className="mobile-logout-btn">
              <LogOutIcon />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Notification Dropdown */}
      {isNotificationOpen && (
        <div className="mobile-notification-overlay" onClick={closeNotifications}>
          <div className="mobile-notification-content" onClick={(e) => e.stopPropagation()}>
            <NotificationDropdown 
              isOpen={isNotificationOpen} 
              onClose={closeNotifications}
            />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
