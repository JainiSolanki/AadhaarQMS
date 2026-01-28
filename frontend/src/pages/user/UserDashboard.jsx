import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, LogOut, Moon, Sun, Plus, List } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { appointmentAPI } from '../../services/api';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentAPI.getMyAppointments();
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'Pending').length,
    served: appointments.filter(a => a.status === 'Served').length,
  };

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <Calendar size={24} />
          <span>AadhaarQMS</span>
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
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="user-profile">
            <div className="avatar">
              <User size={32} />
            </div>
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
          </div>

          <nav className="sidebar-nav">
            <Link to="/user/dashboard" className="nav-item active">
              <Calendar size={20} />
              Dashboard
            </Link>
            <Link to="/user/book" className="nav-item">
              <Plus size={20} />
              Book Appointment
            </Link>
            <Link to="/user/appointments" className="nav-item">
              <List size={20} />
              My Appointments
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="page-header">
            <div>
              <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
              <p>Manage your Aadhaar appointments</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Calendar size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Appointments</span>
                <span className="stat-value">{stats.total}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Pending</span>
                <span className="stat-value">{stats.pending}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <Calendar size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Completed</span>
                <span className="stat-value">{stats.served}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <Link to="/user/book" className="action-card">
              <Plus size={32} />
              <h3>Book New Appointment</h3>
              <p>Schedule your Aadhaar service</p>
            </Link>

            <Link to="/user/appointments" className="action-card">
              <List size={32} />
              <h3>View Appointments</h3>
              <p>Check your booking history</p>
            </Link>

            <Link to="/queue" className="action-card">
              <Clock size={32} />
              <h3>Queue Status</h3>
              <p>Check today's queue</p>
            </Link>
          </div>

          {/* Recent Appointments */}
          {loading ? (
            <div className="loading-state">
              <span className="spinner"></span>
              <p>Loading appointments...</p>
            </div>
          ) : appointments.length > 0 ? (
            <div className="card">
              <h2>Recent Appointments</h2>
              <div className="appointments-list">
                {appointments.slice(0, 3).map((apt) => (
                  <Link 
                    key={apt.appointmentId} 
                    to={`/user/appointments/${apt.appointmentId}`}
                    className="appointment-item"
                  >
                    <div className="apt-info">
                      <span className="token">{apt.tokenNumber}</span>
                      <div>
                        <h4>{apt.serviceType}</h4>
                        <p>{apt.date} • {apt.timeSlot}</p>
                      </div>
                    </div>
                    <span className={`badge badge-${apt.status.toLowerCase()}`}>
                      {apt.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <Calendar size={64} />
              <h3>No Appointments Yet</h3>
              <p>Book your first appointment to get started</p>
              <Link to="/user/book" className="btn btn-primary">
                <Plus size={18} />
                Book Now
              </Link>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .dashboard {
          min-height: 100vh;
          background: var(--bg-secondary);
        }

        .dashboard-nav {
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-primary);
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary);
        }

        .nav-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .icon-btn {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          padding: 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          color: var(--text-primary);
          transition: all 0.3s;
        }

        .icon-btn:hover {
          background: var(--border-primary);
        }

        .dashboard-container {
          display: grid;
          grid-template-columns: 280px 1fr;
          max-width: 1400px;
          margin: 0 auto;
        }

        .sidebar {
          background: var(--bg-primary);
          border-right: 1px solid var(--border-primary);
          padding: 2rem 0;
          min-height: calc(100vh - 73px);
        }

        .user-profile {
          text-align: center;
          padding: 0 1.5rem 2rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .avatar {
          width: 80px;
          height: 80px;
          margin: 0 auto 1rem;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .user-profile h3 {
          margin: 0 0 0.25rem;
          color: var(--text-primary);
        }

        .user-profile p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .sidebar-nav {
          padding: 1.5rem 0;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1.5rem;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.3s;
          border-left: 3px solid transparent;
        }

        .nav-item:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .nav-item.active {
          background: var(--bg-secondary);
          color: var(--primary);
          border-left-color: var(--primary);
        }

        .main-content {
          padding: 2rem;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          margin: 0 0 0.5rem;
          font-size: 2rem;
          color: var(--text-primary);
        }

        .page-header p {
          margin: 0;
          color: var(--text-secondary);
        }

        .stats-grid {
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
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .action-card {
          background: var(--bg-primary);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid var(--border-primary);
          text-align: center;
          text-decoration: none;
          transition: all 0.3s;
        }

        .action-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary);
        }

        .action-card svg {
          color: var(--primary);
          margin-bottom: 1rem;
        }

        .action-card h3 {
          margin: 0 0 0.5rem;
          color: var(--text-primary);
        }

        .action-card p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .appointments-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .appointment-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem;
          background: var(--bg-secondary);
          border-radius: 8px;
          border: 1px solid var(--border-primary);
          text-decoration: none;
          transition: all 0.3s;
        }

        .appointment-item:hover {
          transform: translateX(4px);
          border-color: var(--primary);
        }

        .apt-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .token {
          background: var(--primary);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .apt-info h4 {
          margin: 0 0 0.25rem;
          color: var(--text-primary);
        }

        .apt-info p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: var(--bg-primary);
          border-radius: 12px;
          border: 1px solid var(--border-primary);
        }

        .empty-state svg {
          color: var(--text-tertiary);
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          margin: 0 0 0.5rem;
          color: var(--text-primary);
        }

        .empty-state p {
          margin: 0 0 1.5rem;
          color: var(--text-secondary);
        }

        .loading-state {
          text-align: center;
          padding: 3rem;
        }

        .loading-state p {
          margin-top: 1rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .dashboard-container {
            grid-template-columns: 1fr;
          }

          .sidebar {
            display: none;
          }

          .main-content {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;