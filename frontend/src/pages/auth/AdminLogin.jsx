import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Shield, Calendar, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { authAPI } from '../../services/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.adminLogin(formData);
      
      if (response.success) {
        login(response.data, response.token);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-branding admin-branding">
          <div className="branding-content">
            <div className="logo-large">
              <Shield size={48} />
              <h1>Admin Portal</h1>
            </div>
            <p className="branding-text">
              Secure access for Aadhaar center administrators. 
              Manage appointments, monitor queues, and optimize operations.
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="auth-form-container">
          <button onClick={toggleTheme} className="theme-toggle-auth">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h2>Admin Login</h2>
              <p>Access the administrator dashboard</p>
            </div>

            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <div className="info-box">
              <p><strong>Default Credentials:</strong></p>
              <p>Email: admin@aadhaarqms.com</p>
              <p>Password: Admin@123</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="label">Admin Email</label>
                <div className="input-group">
                  <Mail size={20} className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    className="input"
                    placeholder="Enter admin email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Password</label>
                <div className="input-group">
                  <Lock size={20} className="input-icon" />
                  <input
                    type="password"
                    name="password"
                    className="input"
                    placeholder="Enter admin password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
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
                    <Shield size={20} />
                    Login as Admin
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p><Link to="/login">User Login</Link></p>
              <p><Link to="/">← Back to Home</Link></p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-branding {
          background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%) !important;
        }

        .info-box {
          background: var(--info-bg);
          border: 1px solid var(--info);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .info-box p {
          margin: 0.25rem 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .info-box strong {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;