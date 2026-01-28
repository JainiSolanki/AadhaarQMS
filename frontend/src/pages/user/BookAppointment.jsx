import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, LogOut, Moon, Sun, Plus, List, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { appointmentAPI, adminAPI } from '../../services/api';
import { SERVICE_TYPES, VALIDATION, ERROR_MESSAGES } from '../../utils/constants';

const BookAppointment = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // TIME SLOTS - Addressing professor's question about capacity
  // Each slot can handle 10 users (configurable)
  const TIME_SLOTS = [
    { value: '09:00 - 10:00', label: '09:00 AM - 10:00 AM', capacity: 10 },
    { value: '10:00 - 11:00', label: '10:00 AM - 11:00 AM', capacity: 10 },
    { value: '11:00 - 12:00', label: '11:00 AM - 12:00 PM', capacity: 10 },
    { value: '12:00 - 01:00', label: '12:00 PM - 01:00 PM', capacity: 10 },
    { value: '02:00 - 03:00', label: '02:00 PM - 03:00 PM', capacity: 10 },
    { value: '03:00 - 04:00', label: '03:00 PM - 04:00 PM', capacity: 10 },
    { value: '04:00 - 05:00', label: '04:00 PM - 05:00 PM', capacity: 10 },
  ];

  // Total capacity per day = 7 slots × 10 users = 70 appointments/day

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    aadhaarNumber: '',
    serviceType: '',
    date: '',
    timeSlot: ''
  });

  const [slotAvailability, setSlotAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  // Fetch slot availability when date changes
  useEffect(() => {
    if (formData.date) {
      fetchSlotAvailability(formData.date);
    }
  }, [formData.date]);

  const fetchSlotAvailability = async (date) => {
    try {
      // Fetch all appointments for selected date
      const response = await adminAPI.getAllAppointments({ date, status: 'Pending' });
      
      // Calculate availability for each slot
      const availability = {};
      TIME_SLOTS.forEach(slot => {
        const bookedCount = response.data.filter(apt => apt.timeSlot === slot.value).length;
        availability[slot.value] = {
          available: slot.capacity - bookedCount,
          total: slot.capacity,
          isFull: bookedCount >= slot.capacity
        };
      });
      
      setSlotAvailability(availability);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle Aadhaar number formatting (add spaces every 4 digits)
    if (name === 'aadhaarNumber') {
      const cleaned = value.replace(/\s/g, '');
      if (cleaned.length <= 12 && /^\d*$/.test(cleaned)) {
        setFormData({ ...formData, [name]: cleaned });
      }
      return;
    }

    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = ERROR_MESSAGES.REQUIRED_FIELD;
    
    if (!formData.email) {
      newErrors.email = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!VALIDATION.EMAIL.test(formData.email)) {
      newErrors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }

    if (!formData.phone) {
      newErrors.phone = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!VALIDATION.PHONE.test(formData.phone)) {
      newErrors.phone = ERROR_MESSAGES.INVALID_PHONE;
    }

    if (!formData.aadhaarNumber) {
      newErrors.aadhaarNumber = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!VALIDATION.AADHAAR.test(formData.aadhaarNumber)) {
      newErrors.aadhaarNumber = ERROR_MESSAGES.INVALID_AADHAAR;
    }

    if (!formData.serviceType) newErrors.serviceType = 'Please select a service';
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.timeSlot) newErrors.timeSlot = 'Please select a time slot';

    // Check if selected date is not in past
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      newErrors.date = 'Cannot book appointments for past dates';
    }

    // Check if slot is full
    if (formData.timeSlot && slotAvailability[formData.timeSlot]?.isFull) {
      newErrors.timeSlot = 'This slot is fully booked. Please select another slot.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError('');
    setSuccess(null);

    try {
      const response = await appointmentAPI.bookAppointment(formData);
      
      if (response.success) {
        setSuccess(response.data);
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate(`/user/appointments/${response.data.appointmentId}`);
        }, 3000);
      }
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
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
            <Link to="/user/dashboard" className="nav-item">
              <Calendar size={20} />
              Dashboard
            </Link>
            <Link to="/user/book" className="nav-item active">
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
            <Link to="/user/dashboard" className="back-link">
              <ArrowLeft size={20} />
              Back to Dashboard
            </Link>
            <h1>Book New Appointment</h1>
            <p>Fill the form below to schedule your Aadhaar service</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="alert alert-success">
              <CheckCircle size={20} />
              <div>
                <strong>Appointment Booked Successfully!</strong>
                <p>Token Number: <strong>{success.tokenNumber}</strong></p>
                <p>Date: {success.date} • Time: {success.timeSlot}</p>
                <p>Redirecting to appointment details...</p>
              </div>
            </div>
          )}

          {/* API Error */}
          {apiError && (
            <div className="alert alert-danger">
              <AlertCircle size={20} />
              <span>{apiError}</span>
            </div>
          )}

          {/* Info Box - Capacity Information */}
          <div className="info-box">
            <h3>📋 Booking Information</h3>
            <ul>
              <li><strong>Capacity:</strong> 10 appointments per hour slot</li>
              <li><strong>Daily Limit:</strong> 70 appointments per day (7 slots × 10)</li>
              <li><strong>Booking Window:</strong> Up to 30 days in advance</li>
              <li><strong>No-Show Policy:</strong> If you miss your slot, appointment will be marked as "No Show"</li>
              <li><strong>Cancellation:</strong> You can cancel up to 2 hours before your slot</li>
            </ul>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="booking-form card">
            <h2>Appointment Details</h2>

            <div className="form-row">
              <div className="form-group">
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className={`input ${errors.name ? 'input-error' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  className={`input ${errors.phone ? 'input-error' : ''}`}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label className="label">Aadhaar Number *</label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  className={`input ${errors.aadhaarNumber ? 'input-error' : ''}`}
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  placeholder="12-digit Aadhaar number"
                  maxLength={12}
                />
                {errors.aadhaarNumber && <span className="error-text">{errors.aadhaarNumber}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="label">Service Type *</label>
              <select
                name="serviceType"
                className={`select ${errors.serviceType ? 'input-error' : ''}`}
                value={formData.serviceType}
                onChange={handleChange}
              >
                <option value="">Select service</option>
                {SERVICE_TYPES.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
              {errors.serviceType && <span className="error-text">{errors.serviceType}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label">Appointment Date *</label>
                <input
                  type="date"
                  name="date"
                  className={`input ${errors.date ? 'input-error' : ''}`}
                  value={formData.date}
                  onChange={handleChange}
                  min={getMinDate()}
                  max={getMaxDate()}
                />
                {errors.date && <span className="error-text">{errors.date}</span>}
              </div>

              <div className="form-group">
                <label className="label">Time Slot *</label>
                <select
                  name="timeSlot"
                  className={`select ${errors.timeSlot ? 'input-error' : ''}`}
                  value={formData.timeSlot}
                  onChange={handleChange}
                  disabled={!formData.date}
                >
                  <option value="">Select time slot</option>
                  {TIME_SLOTS.map(slot => {
                    const availability = slotAvailability[slot.value];
                    return (
                      <option 
                        key={slot.value} 
                        value={slot.value}
                        disabled={availability?.isFull}
                      >
                        {slot.label} 
                        {availability && ` (${availability.available}/${availability.total} available)`}
                        {availability?.isFull && ' - FULL'}
                      </option>
                    );
                  })}
                </select>
                {errors.timeSlot && <span className="error-text">{errors.timeSlot}</span>}
                {formData.date && !formData.timeSlot && (
                  <span className="help-text">Please select an available time slot</span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <Link to="/user/dashboard" className="btn btn-secondary">
                Cancel
              </Link>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Booking...
                  </>
                ) : success ? (
                  'Booked Successfully!'
                ) : (
                  <>
                    <Calendar size={18} />
                    Book Appointment
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>

      <style>{`
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          text-decoration: none;
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .back-link:hover {
          color: var(--primary);
        }

        .info-box {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.1) 100%);
          border: 1px solid var(--primary);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .info-box h3 {
          margin: 0 0 1rem;
          color: var(--text-primary);
        }

        .info-box ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .info-box li {
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }

        .booking-form {
          max-width: 800px;
        }

        .booking-form h2 {
          margin: 0 0 1.5rem;
          color: var(--text-primary);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .help-text {
          font-size: 0.875rem;
          color: var(--text-tertiary);
          font-style: italic;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-primary);
        }

        .alert {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .alert-success {
          background: var(--success-bg);
          border: 1px solid var(--success);
          color: var(--success);
        }

        .alert-success strong {
          color: var(--success);
        }

        .alert-success p {
          margin: 0.25rem 0;
          color: var(--text-secondary);
        }

        .alert-danger {
          background: var(--danger-bg);
          border: 1px solid var(--danger);
          color: var(--danger);
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
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

export default BookAppointment;