import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, Activity, LogOut, Moon, Sun, Shield, List, BarChart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, appointmentsRes] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getAllAppointments({})
      ]);
      
      setAnalytics(analyticsRes.data);
      setRecentAppointments(appointmentsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
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
            <Link to="/admin/dashboard" className="nav-item active">
              <Activity size={20} />
              Dashboard
            </Link>
            <Link to="/admin/appointments" className="nav-item">
              <List size={20} />
              All Appointments
            </Link>
            <Link to="/admin/queue" className="nav-item">
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
              <h1>Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
              <p>Manage appointments and monitor operations</p>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <span className="spinner"></span>
              <p>Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <Calendar size={28} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Total Appointments</span>
                    <span className="stat-value">{analytics?.overview.total || 0}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                    <Clock size={28} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Pending</span>
                    <span className="stat-value">{analytics?.overview.pending || 0}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                    <Activity size={28} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">In Progress</span>
                    <span className="stat-value">{analytics?.overview.inProgress || 0}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                    <Users size={28} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Served</span>
                    <span className="stat-value">{analytics?.overview.served || 0}</span>
                  </div>
                </div>
              </div>

              {/* Today's Stats */}
              <div className="today-stats card">
                <h2>Today's Overview</h2>
                <div className="today-grid">
                  <div className="today-stat">
                    <span className="label">Total Appointments</span>
                    <span className="value">{analytics?.today.total || 0}</span>
                  </div>
                  <div className="today-stat">
                    <span className="label">Pending</span>
                    <span className="value">{analytics?.today.pending || 0}</span>
                  </div>
                  <div className="today-stat">
                    <span className="label">Served</span>
                    <span className="value">{analytics?.today.served || 0}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-grid">
                <Link to="/admin/appointments" className="action-card">
                  <List size={32} />
                  <h3>View All Appointments</h3>
                  <p>Manage all bookings</p>
                </Link>

                <Link to="/admin/queue" className="action-card">
                  <Clock size={32} />
                  <h3>Queue Management</h3>
                  <p>Real-time queue control</p>
                </Link>

                <Link to="/admin/analytics" className="action-card">
                  <BarChart size={32} />
                  <h3>View Analytics</h3>
                  <p>Detailed reports & charts</p>
                </Link>
              </div>

              {/* Recent Appointments */}
              <div className="card">
                <div className="card-header">
                  <h2>Recent Appointments</h2>
                  <Link to="/admin/appointments" className="link">View All →</Link>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Token</th>
                        <th>Name</th>
                        <th>Service</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAppointments.map(apt => (
                        <tr key={apt.appointmentId}>
                          <td><span className="token-cell">{apt.tokenNumber}</span></td>
                          <td>{apt.name}</td>
                          <td>{apt.serviceType}</td>
                          <td>{apt.date}</td>
                          <td>{apt.timeSlot}</td>
                          <td>
                            <span className={`badge badge-${apt.status.toLowerCase().replace(' ', '')}`}>
                              {apt.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <style>{`
        .admin-avatar {
          background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%) !important;
        }

        .admin-badge {
          background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-block;
          margin-top: 0.5rem;
        }

        .today-stats {
          margin-bottom: 2rem;
        }

        .today-stats h2 {
          margin: 0 0 1.5rem;
          color: var(--text-primary);
        }

        .today-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 2rem;
        }

        .today-stat {
          text-align: center;
        }

        .today-stat .label {
          display: block;
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .today-stat .value {
          display: block;
          color: var(--text-primary);
          font-size: 2rem;
          font-weight: 700;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .card-header h2 {
          margin: 0;
          color: var(--text-primary);
        }

        .link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
        }

        .link:hover {
          text-decoration: underline;
        }

        .token-cell {
          background: var(--primary);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.75rem;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            grid-template-columns: 1fr;
          }

          .sidebar {
            display: none;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;