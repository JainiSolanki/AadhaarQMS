import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, LogOut, Moon, Sun, Activity, List, Clock, BarChart, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { appointmentAPI, adminAPI } from '../../services/api';

const QueueManagement = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await appointmentAPI.getTodayQueue();
      setQueue(response.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await adminAPI.updateAppointmentStatus(appointmentId, newStatus);
      fetchQueue();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <Shield size={24} />
          <span>Admin Portal</span>
        </div>
        <div className="nav-actions">
          <button onClick={toggleTheme} className="icon-btn">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={handleLogout} className="btn btn-danger">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="user-profile">
            <div className="avatar admin-avatar">
              <Shield size={32} />
            </div>
            <h3>{user?.name}</h3>
            <p className="admin-badge">Administrator</p>
          </div>

          <nav className="sidebar-nav">
            <Link to="/admin/dashboard" className="nav-item">
              <Activity size={20} />
              Dashboard
            </Link>
            <Link to="/admin/appointments" className="nav-item">
              <List size={20} />
              All Appointments
            </Link>
            <Link to="/admin/queue" className="nav-item active">
              <Clock size={20} />
              Queue Management
            </Link>
            <Link to="/admin/analytics" className="nav-item">
              <BarChart size={20} />
              Analytics
            </Link>
          </nav>
        </aside>

        <main className="main-content">
          <div className="page-header">
            <div>
              <h1>Today's Queue</h1>
              <p>Real-time queue management and status updates</p>
            </div>
            <button onClick={fetchQueue} className="btn btn-secondary">
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>

          <div className="queue-stats">
            <div className="queue-stat-card">
              <span className="stat-label">In Queue</span>
              <span className="stat-value">{queue.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <span className="spinner"></span>
              <p>Loading queue...</p>
            </div>
          ) : queue.length > 0 ? (
            <div className="queue-grid">
              {queue.map((item) => (
                <div key={item.tokenNumber} className="queue-card card">
                  <div className="queue-header">
                    <span className="token-large">{item.tokenNumber}</span>
                    <span className={`badge badge-${item.status.toLowerCase().replace(' ', '')}`}>
                      {item.status}
                    </span>
                  </div>
                  
                  <div className="queue-info">
                    <div className="info-row">
                      <span className="label">Time Slot:</span>
                      <span className="value">{item.timeSlot}</span>
                    </div>
                  </div>

                  <div className="queue-actions">
                    {item.status === 'Pending' && (
                      <button
                        onClick={() => handleStatusUpdate(item.appointmentId, 'In Progress')}
                        className="btn btn-primary btn-sm"
                      >
                        Start Service
                      </button>
                    )}
                    {item.status === 'In Progress' && (
                      <button
                        onClick={() => handleStatusUpdate(item.appointmentId, 'Served')}
                        className="btn btn-success btn-sm"
                      >
                        Mark as Served
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Clock size={64} />
              <h3>No Appointments in Queue</h3>
              <p>All appointments for today have been processed</p>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .queue-stats {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .queue-stat-card {
          background: var(--bg-primary);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--border-primary);
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 150px;
        }

        .queue-stat-card .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .queue-stat-card .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--primary);
        }

        .queue-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .queue-card {
          padding: 1.5rem;
        }

        .queue-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .token-large {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
        }

        .queue-info {
          margin-bottom: 1.5rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
        }

        .info-row .label {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .info-row .value {
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.875rem;
        }

        .queue-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-sm {
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            grid-template-columns: 1fr;
          }

          .sidebar {
            display: none;
          }

          .queue-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default QueueManagement;