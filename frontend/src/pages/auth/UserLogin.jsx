import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Calendar, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { authAPI } from '../../services/api';

const UserLogin = () => {
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
      const response = await authAPI.login(formData);
      
      if (response.success) {
        login(response.data, response.token);
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
              Your one-stop solution for hassle-free Aadhaar services. 
              Book appointments, manage queues, and save time.
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
              <h2>Welcome Back</h2>
              <p>Login to your account to continue</p>
            </div>

            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="label">Email Address</label>
                <div className="input-group">
                  <Mail size={20} className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    className="input"
                    placeholder="Enter your email"
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
                    placeholder="Enter your password"
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
                    <LogIn size={20} />
                    Login
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>Don't have an account? <Link to="/register">Register here</Link></p>
              <p><Link to="/admin/login">Login as Admin</Link></p>
              <p><Link to="/">← Back to Home</Link></p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          padding: 2rem;
        }

        .auth-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1000px;
          width: 100%;
          background: var(--bg-primary);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: var(--shadow-xl);
        }

        /* Branding Side */
        .auth-branding {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          padding: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .branding-content {
          text-align: center;
        }

        .logo-large {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .logo-large h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0;
        }

        .branding-text {
          font-size: 1.125rem;
          line-height: 1.8;
          opacity: 0.95;
        }

        /* Form Side */
        .auth-form-container {
          padding: 3rem;
          position: relative;
        }

        .theme-toggle-auth {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          padding: 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          color: var(--text-primary);
          transition: all 0.3s;
        }

        .theme-toggle-auth:hover {
          background: var(--border-primary);
        }

        .auth-form-wrapper {
          max-width: 400px;
          margin: 0 auto;
        }

        .auth-header {
          margin-bottom: 2rem;
        }

        .auth-header h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .auth-header p {
          color: var(--text-secondary);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-group {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
        }

        .input-group .input {
          padding-left: 3rem;
        }

        .btn-full {
          width: 100%;
        }

        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .alert-danger {
          background: var(--danger-bg);
          color: var(--danger);
          border: 1px solid var(--danger);
        }

        .auth-footer {
          margin-top: 2rem;
          text-align: center;
        }

        .auth-footer p {
          margin: 0.5rem 0;
          color: var(--text-secondary);
        }

        .auth-footer a {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
        }

        .auth-footer a:hover {
          text-decoration: underline;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .auth-container {
            grid-template-columns: 1fr;
          }

          .auth-branding {
            display: none;
          }

          .auth-form-container {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UserLogin;