import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, LogOut, Moon, Sun, Activity, List, Clock, BarChart, Search, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { adminAPI } from '../../services/api';
import { SERVICE_TYPES } from '../../utils/constants';

const AllAppointments = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    date: '',
    status: 'All',
    serviceType: 'All'
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, appointments]);

  const fetchAppointments = async () => {
    try {
      const response = await adminAPI.getAllAppointments({});
      setAppointments(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    if (filters.date) {
      filtered = filtered.filter(apt => apt.date === filters.date);
    }

    if (filters.status !== 'All') {
      filtered = filtered.filter(apt => apt.status === filters.status);
    }

    if (filters.serviceType !== 'All') {
      filtered = filtered.filter(apt => apt.serviceType === filters.serviceType);
    }

    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAppointments(filtered);
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await adminAPI.updateAppointmentStatus(appointmentId, newStatus);
      fetchAppointments(); // Refresh data
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
            <Link to="/admin/appointments" className="nav-item active">
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
              <h1>All Appointments</h1>
              <p>Manage and monitor all bookings</p>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-section card">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search by name, token, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Date:</label>
                <input
                  type="date"
                  className="input"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                />
              </div>

              <div className="filter-group">
                <label>Status:</label>
                <select
                  className="select"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Served">Served</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="No Show">No Show</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Service:</label>
                <select
                  className="select"
                  value={filters.serviceType}
                  onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
                >
                  <option value="All">All Services</option>
                  {SERVICE_TYPES.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="results-count">
              Showing <strong>{filteredAppointments.length}</strong> of {appointments.length} appointments
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="loading-state">
              <span className="spinner"></span>
              <p>Loading appointments...</p>
            </div>
          ) : (
            <div className="card">
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map(apt => (
                      <tr key={apt.appointmentId}>
                        <td><span className="token-cell">{apt.tokenNumber}</span></td>
                        <td>
                          <div>
                            <div>{apt.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                              {apt.phone}
                            </div>
                          </div>
                        </td>
                        <td>{apt.serviceType}</td>
                        <td>{apt.date}</td>
                        <td>{apt.timeSlot}</td>
                        <td>
                          <span className={`badge badge-${apt.status.toLowerCase().replace(' ', '')}`}>
                            {apt.status}
                          </span>
                        </td>
                        <td>
                          <select
                            className="status-select"
                            value={apt.status}
                            onChange={(e) => handleStatusUpdate(apt.appointmentId, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Served">Served</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="No Show">No Show</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredAppointments.length === 0 && (
                  <div className="empty-table">
                    <p>No appointments found matching your filters</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .filters-section {
          margin-bottom: 1.5rem;
        }

        .search-box {
          margin-bottom: 1rem;
        }

        .filter-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .results-count {
          padding-top: 1rem;
          border-top: 1px solid var(--border-primary);
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .status-select {
          padding: 0.5rem;
          border: 1px solid var(--border-primary);
          border-radius: 6px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 0.875rem;
          cursor: pointer;
        }

        .empty-table {
          text-align: center;
          padding: 3rem;
          color: var(--text-tertiary);
        }

        @media (max-width: 768px) {
          .dashboard-container {
            grid-template-columns: 1fr;
          }

          .sidebar {
            display: none;
          }

          .filter-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AllAppointments;