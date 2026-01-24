import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH APIs ====================

export const authAPI = {
  // User Registration
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // User Login
  login: async (data) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Admin Login
  adminLogin: async (data) => {
    const response = await api.post('/auth/admin/login', data);
    return response.data;
  },
};

// ==================== APPOINTMENT APIs ====================

export const appointmentAPI = {
  // Book Appointment
  bookAppointment: async (data) => {
    const response = await api.post('/appointment', data);
    return response.data;
  },

  // Get User's Appointments
  getMyAppointments: async () => {
    const response = await api.get('/my-appointments');
    return response.data;
  },

  // Get Single Appointment
  getAppointmentById: async (id) => {
    const response = await api.get(`/appointment/${id}`);
    return response.data;
  },

  // Cancel Appointment
  cancelAppointment: async (id) => {
    const response = await api.delete(`/appointment/${id}`);
    return response.data;
  },

  // Get Today's Queue (Public)
  getTodayQueue: async () => {
    const response = await api.get('/queue/today');
    return response.data;
  },
};

// ==================== ADMIN APIs ====================

export const adminAPI = {
  // Get All Appointments (with filters)
  getAllAppointments: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.status) params.append('status', filters.status);
    if (filters.serviceType) params.append('serviceType', filters.serviceType);
    
    const response = await api.get(`/admin/appointments?${params.toString()}`);
    return response.data;
  },

  // Update Appointment Status
  updateAppointmentStatus: async (id, status) => {
    const response = await api.put(`/admin/appointment/${id}/status`, { status });
    return response.data;
  },

  // Get Dashboard Analytics
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },
};

// Export default api instance for custom requests
export default api;