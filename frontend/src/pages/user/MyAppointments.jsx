import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, User, LogOut, Moon, Sun, Plus, List, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { appointmentAPI } from '../../services/api';

const MyAppointments = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [searchTerm, filterStatus, appointments]);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentAPI.getMyAppointments();
      setAppointments(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (filterStatus !== 'All') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.date.includes(searchTerm)
      );
    }

    setFilteredAppointments(filtered);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard">
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
        <aside className="sidebar">
          <div className="user-profile">
            <div className="avatar">
              <User size={32} />
            </div>
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
          </div>
          <nav className="sidebar-nav">
            <Link to="/user/dashboard" className="nav-item">
              <Calendar size={20} />
              Dashboard
            </Link>
            <Link to="/user/book" className="nav-item">
              <Plus size={20} />
              Book Appointment
            </Link>
            <Link to="/user/appointments" className="nav-item active">
              <List size={20} />
              My Appointments
            </Link>
          </nav>
        </aside>

        <main className="main-content">
          <div className="page-header">
            <h1>My Appointments</h1>
            <p>View and manage all your bookings</p>
          </div>

          <div className="filters-bar">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search by token, service, or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Served">Served</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {loading ? (
            <div className="loading-state">
              <span className="spinner"></span>
              <p>Loading appointments...</p>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="appointments-grid">
              {filteredAppointments.map(apt => (
                <Link
                  key={apt.appointmentId}
                  to={`/user/appointments/${apt.appointmentId}`}
                  className="appointment-card"
                >
                  <div className="card-header-apt">
                    <span className="token-badge">{apt.tokenNumber}</span>
                    <span className={`badge badge-${apt.status.toLowerCase().replace(' ', '')}`}>
                      {apt.status}
                    </span>
                  </div>
                  <h3>{apt.serviceType}</h3>
                  <div className="card-details">
                    <p><Calendar size={16} /> {apt.date}</p>
                    <p>⏰ {apt.timeSlot}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Calendar size={64} />
              <h3>No Appointments Found</h3>
              <p>Try adjusting your filters or book a new appointment</p>
              <Link to="/user/book" className="btn btn-primary">
                <Plus size={18} />
                Book Appointment
              </Link>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .filters-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .search-box {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-box svg {
          position: absolute;
          left: 1rem;
          color: var(--text-tertiary);
        }

        .search-box input {
          width: 100%;
          padding-left: 3rem;
        }

        .appointments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .appointment-card {
          background: var(--bg-primary);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--border-primary);
          text-decoration: none;
          transition: all 0.3s;
        }

        .appointment-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary);
        }

        .card-header-apt {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .token-badge {
          background: var(--primary);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .appointment-card h3 {
          margin: 0 0 1rem;
          color: var(--text-primary);
        }

        .card-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .card-details p {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .badge-inprogress {
          background: var(--info-bg);
          color: var(--info);
        }

        @media (max-width: 768px) {
          .filters-bar {
            flex-direction: column;
          }

          .dashboard-container {
            grid-template-columns: 1fr;
          }

          .sidebar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default MyAppointments;