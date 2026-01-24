// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Service Types
export const SERVICE_TYPES = [
  'New Aadhaar Enrollment',
  'Aadhaar Update',
  'Biometric Update',
  'Mobile Number Update',
  'Address Update'
];

// Time Slots
export const TIME_SLOTS = [
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 01:00',
  '02:00 - 03:00',
  '03:00 - 04:00',
  '04:00 - 05:00'
];

// Appointment Status
export const APPOINTMENT_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  SERVED: 'Served',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show'
};

// Status Colors
export const STATUS_COLORS = {
  [APPOINTMENT_STATUS.PENDING]: 'warning',
  [APPOINTMENT_STATUS.IN_PROGRESS]: 'info',
  [APPOINTMENT_STATUS.SERVED]: 'success',
  [APPOINTMENT_STATUS.CANCELLED]: 'danger',
  [APPOINTMENT_STATUS.NO_SHOW]: 'danger'
};

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Routes
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN_LOGIN: '/admin/login',
  QUEUE_STATUS: '/queue',
  
  // User Routes
  USER_DASHBOARD: '/user/dashboard',
  BOOK_APPOINTMENT: '/user/book',
  MY_APPOINTMENTS: '/user/appointments',
  APPOINTMENT_DETAILS: '/user/appointments/:id',
  
  // Admin Routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ALL_APPOINTMENTS: '/admin/appointments',
  QUEUE_MANAGEMENT: '/admin/queue',
  ANALYTICS: '/admin/analytics'
};

// Validation Regex
export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[6-9]\d{9}$/,
  AADHAAR: /^\d{12}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
};

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Phone number must be 10 digits starting with 6-9',
  INVALID_AADHAAR: 'Aadhaar number must be exactly 12 digits',
  INVALID_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Registration successful! Please login.',
  LOGIN_SUCCESS: 'Login successful!',
  APPOINTMENT_BOOKED: 'Appointment booked successfully!',
  APPOINTMENT_CANCELLED: 'Appointment cancelled successfully.',
  STATUS_UPDATED: 'Status updated successfully.'
};

// Date Format
export const DATE_FORMAT = 'YYYY-MM-DD';

// Pagination
export const ITEMS_PER_PAGE = 10;

export default {
  API_BASE_URL,
  SERVICE_TYPES,
  TIME_SLOTS,
  APPOINTMENT_STATUS,
  STATUS_COLORS,
  USER_ROLES,
  ROUTES,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DATE_FORMAT,
  ITEMS_PER_PAGE
};