import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  NotificationIcon, 
  CheckIconSmall, 
  XIconSmall, 
  StatusUpdateIcon, 
  JobIcon, 
  BotIconSmall, 
  MessageIcon, 
  CalendarIcon, 
  CelebrationIcon,
  CheckCircleIcon,
  XCircleIcon
} from './ProfessionalIcons';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications?limit=50');
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/api/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/mark-all-read');
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      setNotifications(prev => 
        prev.filter(notif => notif._id !== notificationId)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'status_update':
        return <StatusUpdateIcon />;
      case 'new_job_posted':
        return <JobIcon />;
      case 'new_technical_application':
        return <BotIconSmall />;
      case 'feedback':
        return <MessageIcon />;
      case 'interview_scheduled':
        return <CalendarIcon />;
      case 'offer_made':
        return <CelebrationIcon />;
      case 'shortlisted':
        return <CheckCircleIcon />;
      case 'rejected':
        return <XCircleIcon />;
      default:
        return <NotificationIcon />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'status_update':
        return '#3b82f6';
      case 'new_job_posted':
        return '#10b981';
      case 'new_technical_application':
        return '#f59e0b';
      case 'feedback':
        return '#8b5cf6';
      case 'interview_scheduled':
        return '#06b6d4';
      case 'offer_made':
        return '#10b981';
      case 'shortlisted':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5);

  if (loading) {
    return (
      <div className="notification-center">
        <div className="notification-header">
          <h3><NotificationIcon /> Notifications</h3>
        </div>
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="notification-center">
      <div className="notification-header">
        <h3><NotificationIcon /> Notifications {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}</h3>
        <div className="notification-actions">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="mark-all-read-btn">
              Mark all as read
            </button>
          )}
          {notifications.length > 5 && (
            <button 
              onClick={() => setShowAll(!showAll)} 
              className="toggle-view-btn"
            >
              {showAll ? 'Show less' : 'Show all'}
            </button>
          )}
        </div>
      </div>

      <div className="notifications-list">
        {displayedNotifications.length === 0 ? (
          <div className="no-notifications">
            <p>No notifications yet</p>
          </div>
        ) : (
          displayedNotifications.map((notification) => (
            <div 
              key={notification._id} 
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => !notification.read && markAsRead(notification._id)}
            >
              <div className="notification-icon" style={{ color: getNotificationColor(notification.type) }}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-meta">
                  <span className="notification-time">{formatDate(notification.createdAt)}</span>
                  {notification.jobId && (
                    <span className="notification-job">
                      {notification.jobId.title} - {notification.jobId.department}
                    </span>
                  )}
                  {notification.applicationId && notification.applicationId.job && (
                    <span className="notification-job">
                      {notification.applicationId.job.title} - {notification.applicationId.job.department}
                    </span>
                  )}
                </div>
              </div>
              <div className="notification-actions-item">
                {!notification.read && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification._id);
                    }}
                    className="mark-read-btn"
                    title="Mark as read"
                  >
                    <CheckIconSmall />
                  </button>
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification._id);
                  }}
                  className="delete-btn"
                  title="Delete"
                >
                  <XIconSmall />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;



