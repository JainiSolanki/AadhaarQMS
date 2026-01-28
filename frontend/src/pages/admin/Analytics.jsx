import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, LogOut, Moon, Sun, Activity, List, Clock, BarChart } from 'lucide-react';
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { adminAPI } from '../../services/api';

const Analytics = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics();
      setAnalytics(response.data);
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

  // Prepare chart data
  const statusData = analytics ? [
    { name: 'Pending', value: analytics.overview.pending, color: '#f59e0b' },
    { name: 'In Progress', value: analytics.overview.inProgress, color: '#3b82f6' },
    { name: 'Served', value: analytics.overview.served, color: '#10b981' },
    { name: 'Cancelled', value: analytics.overview.cancelled, color: '#ef4444' },
    { name: 'No Show', value: analytics.overview.noShow, color: '#6b7280' },
  ].filter(item => item.value > 0) : [];

  const serviceData = analytics ? Object.entries(analytics.serviceBreakdown).map(([key, value]) => ({
    name: key.replace('Aadhaar ', '').slice(0, 15),
    appointments: value
  })) : [];

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
            <Link to="/admin/queue" className="nav-item">
              <Clock size={20} />
              Queue Management
            </Link>
            <Link to="/admin/analytics" className="nav-item active">
              <BarChart size={20} />
              Analytics
            </Link>
          </nav>
        </aside>

        <main className="main-content">
          <div className="page-header">
            <div>
              <h1>Analytics & Reports</h1>
              <p>Detailed insights and performance metrics</p>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <span className="spinner"></span>
              <p>Loading analytics...</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="summary-grid">
                <div className="summary-card">
                  <h3>Total Appointments</h3>
                  <div className="summary-value">{analytics.overview.total}</div>
                </div>
                <div className="summary-card">
                  <h3>Success Rate</h3>
                  <div className="summary-value">
                    {analytics.overview.total > 0
                      ? Math.round((analytics.overview.served / analytics.overview.total) * 100)
                      : 0}%
                  </div>
                </div>
                <div className="summary-card">
                  <h3>No-Show Rate</h3>
                  <div className="summary-value">
                    {analytics.overview.total > 0
                      ? Math.round((analytics.overview.noShow / analytics.overview.total) * 100)
                      : 0}%
                  </div>
                </div>
                <div className="summary-card">
                  <h3>Today's Total</h3>
                  <div className="summary-value">{analytics.today.total}</div>
                </div>
              </div>

              {/* Charts */}
              <div className="charts-grid">
                {/* Status Distribution */}
                <div className="card chart-card">
                  <h2>Status Distribution</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Service Type Breakdown */}
                <div className="card chart-card">
                  <h2>Service Type Breakdown</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBar data={serviceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="appointments" fill="#3b82f6" />
                    </RechartsBar>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="card">
                <h2>Status Breakdown</h2>
                <div className="breakdown-grid">
                  <div className="breakdown-item">
                    <span className="breakdown-label">Pending</span>
                    <span className="breakdown-value">{analytics.overview.pending}</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(analytics.overview.pending / analytics.overview.total) * 100}%`,
                          background: '#f59e0b'
                        }}
                      />
                    </div>
                  </div>

                  <div className="breakdown-item">
                    <span className="breakdown-label">In Progress</span>
                    <span className="breakdown-value">{analytics.overview.inProgress}</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(analytics.overview.inProgress / analytics.overview.total) * 100}%`,
                          background: '#3b82f6'
                        }}
                      />
                    </div>
                  </div>

                  <div className="breakdown-item">
                    <span className="breakdown-label">Served</span>
                    <span className="breakdown-value">{analytics.overview.served}</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(analytics.overview.served / analytics.overview.total) * 100}%`,
                          background: '#10b981'
                        }}
                      />
                    </div>
                  </div>

                  <div className="breakdown-item">
                    <span className="breakdown-label">Cancelled</span>
                    <span className="breakdown-value">{analytics.overview.cancelled}</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(analytics.overview.cancelled / analytics.overview.total) * 100}%`,
                          background: '#ef4444'
                        }}
                      />
                    </div>
                  </div>

                  <div className="breakdown-item">
                    <span className="breakdown-label">No Show</span>
                    <span className="breakdown-value">{analytics.overview.noShow}</span>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(analytics.overview.noShow / analytics.overview.total) * 100}%`,
                          background: '#6b7280'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <style>{`
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          background: var(--bg-primary);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--border-primary);
          text-align: center;
        }

        .summary-card h3 {
          margin: 0 0 1rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .summary-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .chart-card {
          padding: 1.5rem;
        }

        .chart-card h2 {
          margin: 0 0 1.5rem;
          color: var(--text-primary);
          font-size: 1.125rem;
        }

        .breakdown-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .breakdown-item {
          display: grid;
          grid-template-columns: 120px 60px 1fr;
          align-items: center;
          gap: 1rem;
        }

        .breakdown-label {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .breakdown-value {
          color: var(--text-primary);
          font-weight: 700;
          text-align: right;
        }

        .progress-bar {
          height: 8px;
          background: var(--bg-tertiary);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            grid-template-columns: 1fr;
          }

          .sidebar {
            display: none;
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Analytics;