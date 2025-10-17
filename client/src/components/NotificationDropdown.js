import React, { useState, useEffect, useRef } from 'react';
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
import './NotificationDropdown.css';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications?limit=10');
      setNotifications(response.data.notifications);
      
      if (response.data.notifications.length > 0) {
        // Start countdown timer
        setCountdown(5);
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        // Auto-mark all notifications as read and delete them after countdown
        setTimeout(async () => {
          try {
            await api.put('/api/notifications/mark-all-read', { autoDelete: true });
            setNotifications([]);
            setUnreadCount(0);
            setCountdown(0);
          } catch (error) {
            console.error('Error auto-deleting notifications:', error);
          }
        }, 5000); // Auto-delete after 5 seconds
      }
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
      await api.put(`/api/notifications/${notificationId}/read`, { autoDelete: true });
      // Remove the notification from the list since it's auto-deleted
      setNotifications(prev => 
        prev.filter(notif => notif._id !== notificationId)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/mark-all-read', { autoDelete: true });
      // Clear all notifications since they're auto-deleted
      setNotifications([]);
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

  if (!isOpen) return null;

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <div className="notification-dropdown-header">
        <div>
          <h3><NotificationIcon /> Notifications {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}</h3>
          <div className="auto-delete-indicator">
            {countdown > 0 ? `Auto-deletes in ${countdown}s` : 'Auto-deletes after viewing'}
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="mark-all-read-btn">
            Mark all as read
          </button>
        )}
      </div>

      <div className="notification-dropdown-content">
        {loading ? (
          <div className="loading">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="no-notifications">
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
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
              <div className="notification-actions">
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

export default NotificationDropdown;
