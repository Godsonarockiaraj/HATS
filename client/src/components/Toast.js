import React, { useState, useEffect } from 'react';
import { CheckCircleIcon } from './ProfessionalIcons';
import './Toast.css';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose && onClose(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type} ${isVisible ? 'toast-visible' : ''}`}>
      <div className="toast-content">
        <div className="toast-icon">
          <CheckCircleIcon />
        </div>
        <div className="toast-message">
          <h4 className="toast-title">Success!</h4>
          <p className="toast-text">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Toast;
