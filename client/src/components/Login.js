import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserIcon, 
  EmailIcon, 
  PhoneIcon, 
  LockIcon,
  BriefcaseIcon,
  ArrowRightIcon
} from './ProfessionalIcons';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'applicant'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Clear message when switching between login/register
  useEffect(() => {
    setMessage('');
  }, [isLogin]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password, formData.phone, formData.role);
      }

      if (result.success) {
        navigate('/dashboard/');
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-gradient"></div>
        <div className="login-pattern"></div>
      </div>
      
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <BriefcaseIcon />
            </div>
            <h1 className="login-title">
              {isLogin ? 'Welcome Back' : 'Join Us Today'}
            </h1>
            <p className="login-subtitle">
              {isLogin ? 'Sign in to continue your journey' : 'Create your account to get started'}
            </p>
          </div>
          
          {message && (
            <div className={`message ${message.includes('failed') || message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">
                  <UserIcon />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">
                  <PhoneIcon />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <EmailIcon />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <LockIcon />
                Password
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input password-input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">
                  <BriefcaseIcon />
                  Role
                </label>
                <select
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your role</option>
                  <option value="applicant">👤 Job Seeker</option>
                  <option value="admin">👨‍💼 Employer</option>
                  <option value="bot_mimic">🤖 Bot Mimic</option>
                </select>
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRightIcon />
                </>
              )}
            </button>
          </form>

          <div className="switch-mode">
            {isLogin ? (
              <p>Don't have an account? <span onClick={() => setIsLogin(false)}>Sign up here</span></p>
            ) : (
              <p>Already have an account? <span onClick={() => setIsLogin(true)}>Sign in here</span></p>
            )}
          </div>

          <div className="demo-credentials">
            <h4>Demo Credentials</h4>
            <div className="credential-item">
              <strong>Job Seeker:</strong> applicant@demo.com / password123
            </div>
            <div className="credential-item">
              <strong>Employer:</strong> admin@demo.com / password123
            </div>
            <div className="credential-item">
              <strong>Bot Mimic:</strong> bot@demo.com / password123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
