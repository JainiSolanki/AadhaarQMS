import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, UserPlus, Calendar, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { authAPI } from '../../services/api';
import { VALIDATION, ERROR_MESSAGES } from '../../utils/constants';

const UserRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = ERROR_MESSAGES.REQUIRED_FIELD;
    }

    if (!formData.email) {
      newErrors.email = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!VALIDATION.EMAIL.test(formData.email)) {
      newErrors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }

    if (!formData.phone) {
      newErrors.phone = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!VALIDATION.PHONE.test(formData.phone)) {
      newErrors.phone = ERROR_MESSAGES.INVALID_PHONE;
    }

    if (!formData.password) {
      newErrors.password = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!VALIDATION.PASSWORD.test(formData.password)) {
      newErrors.password = ERROR_MESSAGES.INVALID_PASSWORD;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const { confirmPassword, ...dataToSend } = formData;
      const response = await authAPI.register(dataToSend);
      
      if (response.success) {
        login(response.data, response.token);
        navigate('/user/dashboard');
      }
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="branding-content">
            <div className="logo-large">
              <Calendar size={48} />
              <h1>AadhaarQMS</h1>
            </div>
            <p className="branding-text">
              Join thousands of citizens experiencing faster, smarter Aadhaar services. 
              Register now and skip the queues!
            </p>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="auth-form-container">
          <button onClick={toggleTheme} className="theme-toggle-auth">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h2>Create Account</h2>
              <p>Register to book your Aadhaar appointment</p>
            </div>

            {apiError && (
              <div className="alert alert-danger">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="label">Full Name</label>
                <div className="input-group">
                  <User size={20} className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    className={`input ${errors.name ? 'input-error' : ''}`}
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="label">Email Address</label>
                <div className="input-group">
                  <Mail size={20} className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    className={`input ${errors.email ? 'input-error' : ''}`}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="label">Phone Number</label>
                <div className="input-group">
                  <Phone size={20} className="input-icon" />
                  <input
                    type="tel"
                    name="phone"
                    className={`input ${errors.phone ? 'input-error' : ''}`}
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={10}
                  />
                </div>
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label className="label">Password</label>
                <div className="input-group">
                  <Lock size={20} className="input-icon" />
                  <input
                    type="password"
                    name="password"
                    className={`input ${errors.password ? 'input-error' : ''}`}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label className="label">Confirm Password</label>
                <div className="input-group">
                  <Lock size={20} className="input-icon" />
                  <input
                    type="password"
                    name="confirmPassword"
                    className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner"></span>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Create Account
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>Already have an account? <Link to="/login">Login here</Link></p>
              <p><Link to="/">← Back to Home</Link></p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .input-error {
          border-color: var(--danger) !important;
        }

        .error-text {
          color: var(--danger);
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default UserRegister;