import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Shield, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Landing = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="container">
          <div className="nav-content">
            <div className="logo">
              <Calendar className="logo-icon" />
              <span>AadhaarQMS</span>
            </div>
            
            <div className="nav-links">
              <Link to="/queue" className="nav-link">Queue Status</Link>
              <Link to="/login" className="btn btn-secondary">User Login</Link>
              <Link to="/admin/login" className="btn btn-primary">Admin Login</Link>
              
              <button 
                onClick={toggleTheme} 
                className="theme-toggle"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content fade-in">
            <h1 className="hero-title">
              Smart Queue Management for<br />
              <span className="gradient-text">Aadhaar Centers</span>
            </h1>
            <p className="hero-subtitle">
              Book appointments online, get digital tokens, and skip the long queues.
              Experience hassle-free Aadhaar services with real-time queue management.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                <Calendar size={20} />
                Book Appointment
              </Link>
              <Link to="/queue" className="btn btn-secondary btn-large">
                <Clock size={20} />
                Check Queue Status
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose AadhaarQMS?</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Calendar size={32} />
              </div>
              <h3>Online Booking</h3>
              <p>Book your Aadhaar appointment from anywhere, anytime. No need to visit the center in person.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Clock size={32} />
              </div>
              <h3>Digital Tokens</h3>
              <p>Get instant digital token numbers and track your queue position in real-time.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Users size={32} />
              </div>
              <h3>Reduced Waiting</h3>
              <p>Smart queue management reduces overcrowding and minimizes your waiting time.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={32} />
              </div>
              <h3>Secure & Reliable</h3>
              <p>Your data is stored securely on cloud infrastructure with enterprise-grade security.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Register Account</h3>
              <p>Create your account with basic details</p>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <h3>Book Appointment</h3>
              <p>Select service, date, and time slot</p>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Token</h3>
              <p>Receive digital token number instantly</p>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <h3>Visit Center</h3>
              <p>Show token and get served quickly</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of citizens experiencing faster Aadhaar services</p>
            <Link to="/register" className="btn btn-primary btn-large">
              Create Account Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>AadhaarQMS</h4>
              <p>Smart queue management system for Aadhaar centers</p>
            </div>
            
            <div className="footer-section">
              <h4>Quick Links</h4>
              <Link to="/login">User Login</Link>
              <Link to="/register">Register</Link>
              <Link to="/admin/login">Admin Login</Link>
            </div>
            
            <div className="footer-section">
              <h4>Services</h4>
              <p>New Enrollment</p>
              <p>Aadhaar Update</p>
              <p>Biometric Update</p>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2026 AadhaarQMS. Academic Project by Solanki Jaini Jaydeepkumar</p>
          </div>
        </div>
      </footer>

      <style>{`
        .landing-page {
          min-height: 100vh;
        }

        /* Navbar */
        .landing-nav {
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-primary);
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
        }

        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
        }

        .logo-icon {
          width: 32px;
          height: 32px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }

        .nav-link:hover {
          color: var(--primary);
        }

        .theme-toggle {
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

        .theme-toggle:hover {
          background: var(--border-primary);
        }

        /* Hero Section */
        .hero {
          padding: 6rem 0;
          text-align: center;
          background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .gradient-text {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-large {
          padding: 1rem 2rem;
          font-size: 1rem;
        }

        /* Features Section */
        .features {
          padding: 6rem 0;
        }

        .section-title {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 3rem;
          color: var(--text-primary);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          padding: 2rem;
          border-radius: 16px;
          background: var(--bg-primary);
          border: 1px solid var(--border-primary);
          transition: all 0.3s;
          text-align: center;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-xl);
        }

        .feature-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          border-radius: 16px;
          color: white;
        }

        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }

        .feature-card p {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* How It Works */
        .how-it-works {
          padding: 6rem 0;
          background: var(--bg-secondary);
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .step {
          text-align: center;
        }

        .step-number {
          width: 60px;
          height: 60px;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .step h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .step p {
          color: var(--text-secondary);
        }

        /* CTA Section */
        .cta {
          padding: 6rem 0;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
        }

        .cta-content {
          text-align: center;
          color: white;
        }

        .cta-content h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .cta-content p {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .cta .btn {
          background: white;
          color: var(--primary);
        }

        .cta .btn:hover {
          background: var(--bg-secondary);
        }

        /* Footer */
        .footer {
          padding: 3rem 0 1rem;
          background: var(--bg-primary);
          border-top: 1px solid var(--border-primary);
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .footer-section h4 {
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .footer-section p,
        .footer-section a {
          color: var(--text-secondary);
          text-decoration: none;
          display: block;
          margin-bottom: 0.5rem;
        }

        .footer-section a:hover {
          color: var(--primary);
        }

        .footer-bottom {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid var(--border-primary);
          color: var(--text-tertiary);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .nav-links {
            gap: 0.5rem;
          }

          .nav-link {
            display: none;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .section-title {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Landing;