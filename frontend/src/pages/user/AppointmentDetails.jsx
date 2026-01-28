import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, LogOut, Moon, Sun, ArrowLeft, Download, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { appointmentAPI } from '../../services/api';

const AppointmentDetails = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const fetchAppointment = async () => {
    try {
      const response = await appointmentAPI.getAppointmentById(id);
      setAppointment(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await appointmentAPI.cancelAppointment(id);
      navigate('/user/appointments');
    } catch (error) {
      alert('Failed to cancel appointment');
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  };

  const handleDownload = () => {
    const canvas = document.querySelector('canvas');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointment-${appointment.tokenNumber}.png`;
    link.click();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <span className="spinner"></span>
        <p>Loading appointment details...</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="error-screen">
        <h2>Appointment Not Found</h2>
        <Link to="/user/appointments" className="btn btn-primary">
          Back to Appointments
        </Link>
      </div>
    );
  }

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

      <div className="details-container container">
        <Link to="/user/appointments" className="back-link">
          <ArrowLeft size={20} />
          Back to Appointments
        </Link>

        <div className="details-grid">
          {/* Left Column - Details */}
          <div className="details-card card">
            <div className="details-header">
              <div>
                <h1>Appointment Details</h1>
                <span className={`badge badge-${appointment.status.toLowerCase().replace(' ', '')}`}>
                  {appointment.status}
                </span>
              </div>
              {appointment.status === 'Pending' && (
                <button 
                  onClick={() => setShowCancelModal(true)}
                  className="btn btn-danger"
                >
                  Cancel Appointment
                </button>
              )}
            </div>

            <div className="detail-section">
              <h3>Personal Information</h3>
              <div className="detail-row">
                <span className="label">Name:</span>
                <span className="value">{appointment.name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Email:</span>
                <span className="value">{appointment.email}</span>
              </div>
              <div className="detail-row">
                <span className="label">Phone:</span>
                <span className="value">{appointment.phone}</span>
              </div>
              <div className="detail-row">
                <span className="label">Aadhaar:</span>
                <span className="value">XXXX-XXXX-{appointment.aadhaarNumber.slice(-4)}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Appointment Information</h3>
              <div className="detail-row">
                <span className="label">Token Number:</span>
                <span className="value token-highlight">{appointment.tokenNumber}</span>
              </div>
              <div className="detail-row">
                <span className="label">Service Type:</span>
                <span className="value">{appointment.serviceType}</span>
              </div>
              <div className="detail-row">
                <span className="label">Date:</span>
                <span className="value">{appointment.date}</span>
              </div>
              <div className="detail-row">
                <span className="label">Time Slot:</span>
                <span className="value">{appointment.timeSlot}</span>
              </div>
              <div className="detail-row">
                <span className="label">Queue Position:</span>
                <span className="value">{appointment.queuePosition}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Instructions</h3>
              <ul className="instructions-list">
                <li>Arrive 10 minutes before your scheduled time</li>
                <li>Bring original Aadhaar card (if available)</li>
                <li>Show this QR code or token number at the counter</li>
                <li>Carry required documents for your service type</li>
                <li>Follow center guidelines and queue discipline</li>
              </ul>
            </div>
          </div>

          {/* Right Column - QR Code */}
          <div className="qr-card card">
            <h2>Your Token</h2>
            <div className="qr-container">
              <QRCode
                value={JSON.stringify({
                  appointmentId: appointment.appointmentId,
                  tokenNumber: appointment.tokenNumber,
                  date: appointment.date,
                  timeSlot: appointment.timeSlot
                })}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="token-display-large">
              {appointment.tokenNumber}
            </div>
            <button onClick={handleDownload} className="btn btn-primary btn-full">
              <Download size={18} />
              Download QR Code
            </button>
          </div>
        </div>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Cancel Appointment?</h3>
              <p>Are you sure you want to cancel this appointment? This action cannot be undone.</p>
              <div className="modal-actions">
                <button onClick={() => setShowCancelModal(false)} className="btn btn-secondary">
                  No, Keep It
                </button>
                <button 
                  onClick={handleCancel} 
                  className="btn btn-danger"
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .details-container {
          padding: 2rem 1rem;
          max-width: 1200px;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          text-decoration: none;
          margin-bottom: 2rem;
          font-weight: 500;
        }

        .back-link:hover {
          color: var(--primary);
        }

        .details-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .details-card {
          padding: 2rem;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .details-header h1 {
          margin: 0 0 0.5rem;
          font-size: 1.75rem;
          color: var(--text-primary);
        }

        .detail-section {
          margin-bottom: 2rem;
        }

        .detail-section h3 {
          margin: 0 0 1rem;
          color: var(--text-primary);
          font-size: 1.125rem;
        }

        .detail-row {
          display: grid;
          grid-template-columns: 140px 1fr;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border-primary);
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-row .label {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .detail-row .value {
          color: var(--text-primary);
        }

        .token-highlight {
          background: var(--primary);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-weight: 700;
          display: inline-block;
        }

        .instructions-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .instructions-list li {
          padding: 0.5rem 0;
          padding-left: 1.5rem;
          position: relative;
          color: var(--text-secondary);
        }

        .instructions-list li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: var(--success);
          font-weight: bold;
        }

        .qr-card {
          text-align: center;
          padding: 2rem;
          position: sticky;
          top: 1rem;
        }

        .qr-card h2 {
          margin: 0 0 1.5rem;
          color: var(--text-primary);
        }

        .qr-container {
          background: white;
          padding: 1rem;
          border-radius: 12px;
          display: inline-block;
          margin-bottom: 1.5rem;
        }

        .token-display-large {
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 1.5rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--bg-primary);
          padding: 2rem;
          border-radius: 12px;
          max-width: 400px;
          width: 90%;
        }

        .modal-content h3 {
          margin: 0 0 1rem;
          color: var(--text-primary);
        }

        .modal-content p {
          margin: 0 0 1.5rem;
          color: var(--text-secondary);
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .loading-screen,
        .error-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 2rem;
        }

        @media (max-width: 768px) {
          .details-grid {
            grid-template-columns: 1fr;
          }

          .qr-card {
            position: static;
          }

          .detail-row {
            grid-template-columns: 1fr;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AppointmentDetails;