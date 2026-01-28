import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, RefreshCw, Moon, Sun, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { appointmentAPI } from '../services/api';

const QueueStatus = () => {
  const { theme, toggleTheme } = useTheme();
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await appointmentAPI.getTodayQueue();
      setQueueData(response);
    } catch (err) {
      setError('Failed to fetch queue status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="queue-status-page">
      {/* Header */}
      <div className="queue-header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="back-link">
              <ArrowLeft size={20} />
              Back to Home
            </Link>
            
            <div className="header-actions">
              <button onClick={fetchQueue} className="btn btn-secondary">
                <RefreshCw size={18} />
                Refresh
              </button>
              <button onClick={toggleTheme} className="theme-toggle">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container queue-content">
        <div className="page-title">
          <Calendar size={40} className="title-icon" />
          <div>
            <h1>Today's Queue Status</h1>
            <p>Real-time queue information for Aadhaar center</p>
          </div>
        </div>

        {loading && !queueData ? (
          <div className="loading-container">
            <span className="spinner"></span>
            <p>Loading queue status...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={fetchQueue} className="btn btn-primary">
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="stats-row">
              <div className="stat-card">
                <Calendar size={24} className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-label">Date</span>
                  <span className="stat-value">{queueData?.date}</span>
                </div>
              </div>

              <div className="stat-card">
                <Users size={24} className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-label">In Queue</span>
                  <span className="stat-value">{queueData?.queueLength || 0}</span>
                </div>
              </div>

              <div className="stat-card">
                <Clock size={24} className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-label">Last Updated</span>
                  <span className="stat-value">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Queue List */}
            <div className="card">
              <div className="card-header">
                <h3>Current Queue</h3>
                <span className="badge badge-info">{queueData?.queueLength || 0} in queue</span>
              </div>

              {queueData?.data && queueData.data.length > 0 ? (
                <div className="queue-list">
                  {queueData.data.map((item, index) => (
                    <div key={index} className="queue-item">
                      <div className="token-display">
                        <span className="token-label">Token</span>
                        <span className="token-number">{item.tokenNumber}</span>
                      </div>
                      
                      <div className="queue-details">
                        <span className="time-slot">
                          <Clock size={16} />
                          {item.timeSlot}
                        </span>
                        <span className={`badge badge-${item.status === 'Pending' ? 'warning' : 'info'}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Users size={48} />
                  <p>No appointments in queue</p>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="cta-box">
              <p>Want to book an appointment?</p>
              <Link to="/register" className="btn btn-primary">
                Book Now
              </Link>
            </div>
          </>
        )}
      </div>

      <style>{`
        .queue-status-page {
          min-height: 100vh;
          background: var(--bg-secondary);
        }

        .queue-header {
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-primary);
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }

        .back-link:hover {
          color: var(--primary);
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .queue-content {
          padding: 3rem 1rem;
        }

        .page-title {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .title-icon {
          color: var(--primary);
        }

        .page-title h1 {
          margin: 0;
          font-size: 2rem;
          color: var(--text-primary);
        }

        .page-title p {
          margin: 0.25rem 0 0;
          color: var(--text-secondary);
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: var(--bg-primary);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--border-primary);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          color: var(--primary);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .card-header h3 {
          margin: 0;
          color: var(--text-primary);
        }

        .queue-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .queue-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 8px;
          border: 1px solid var(--border-primary);
        }

        .token-display {
          display: flex;
          flex-direction: column;
        }

        .token-label {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
        }

        .token-number {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary);
        }

        .queue-details {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .time-slot {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--text-tertiary);
        }

        .empty-state svg {
          opacity: 0.5;
          margin-bottom: 1rem;
        }

        .loading-container,
        .error-container {
          text-align: center;
          padding: 3rem;
        }

        .loading-container p {
          margin-top: 1rem;
          color: var(--text-secondary);
        }

        .cta-box {
          margin-top: 2rem;
          text-align: center;
          padding: 2rem;
          background: var(--bg-primary);
          border-radius: 12px;
          border: 1px solid var(--border-primary);
        }

        .cta-box p {
          margin-bottom: 1rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .page-title {
            flex-direction: column;
            align-items: flex-start;
          }

          .queue-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default QueueStatus;