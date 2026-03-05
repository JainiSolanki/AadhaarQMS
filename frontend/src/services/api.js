import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// Request interceptor — attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('aqms_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('aqms_token');
            localStorage.removeItem('aqms_user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error.response?.data || { message: 'Network error' });
    }
);

// ═══════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    adminLogin: (data) => api.post('/auth/admin/login', data),
    getProfile: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// ═══════════════════════════════════════════
// PASSWORD
// ═══════════════════════════════════════════
export const passwordAPI = {
    change: (data) => api.put('/password/change', data),
};

// ═══════════════════════════════════════════
// CENTERS
// ═══════════════════════════════════════════
export const centersAPI = {
    getAll: (params) => api.get('/centers', { params }),
    getCities: () => api.get('/centers/cities'),
    getById: (id) => api.get(`/centers/${id}`),
    create: (data) => api.post('/centers', data),
    update: (id, data) => api.put(`/centers/${id}`, data),
    delete: (id) => api.delete(`/centers/${id}`),
};

// ═══════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════
export const servicesAPI = {
    getAll: () => api.get('/services'),
    getById: (id) => api.get(`/services/${id}`),
    create: (data) => api.post('/services', data),
    update: (id, data) => api.put(`/services/${id}`, data),
};

// ═══════════════════════════════════════════
// APPOINTMENTS
// ═══════════════════════════════════════════
export const appointmentsAPI = {
    book: (data) => api.post('/appointments', data),
    getMy: () => api.get('/appointments/my'),
    getById: (id) => api.get(`/appointments/${id}`),
    cancel: (id) => api.delete(`/appointments/${id}`),
    checkIn: (qrData) => api.post('/appointments/check-in', { qrData }),
};

// ═══════════════════════════════════════════
// QUEUE
// ═══════════════════════════════════════════
export const queueAPI = {
    getAvailability: (centerId, date) =>
        api.get('/queue/availability', { params: { centerId, date } }),
    getTodayQueue: (centerId) => api.get(`/queue/today/${centerId}`),
    getMyPosition: (appointmentId) =>
        api.get(`/queue/my-position/${appointmentId}`),
};

// ═══════════════════════════════════════════
// OPERATORS
// ═══════════════════════════════════════════
export const operatorsAPI = {
    getAll: () => api.get('/operators'),
    getByCenter: (centerId) => api.get(`/operators/center/${centerId}`),
    create: (data) => api.post('/operators', data),
    update: (id, data) => api.put(`/operators/${id}`, data),
    delete: (id) => api.delete(`/operators/${id}`),
};

// ═══════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════
export const adminAPI = {
    getAppointments: (params) => api.get('/admin/appointments', { params }),
    updateStatus: (id, data) =>
        api.put(`/admin/appointments/${id}/status`, data),
    assignOperator: (id, data) =>
        api.put(`/admin/appointments/${id}/assign-operator`, data),
    createCenterAdmin: (data) => api.post('/admin/center-admin', data),
    getAnalytics: (params) => api.get('/admin/analytics', { params }),
    getAllCenters: () => api.get('/admin/all-centers'),
    getAllOperators: () => api.get('/admin/all-operators'),
    getAllAdmins: () => api.get('/admin/all-admins'),
    getSystemStats: () => api.get('/admin/system-stats'),
    getOperatorQueue: () => api.get('/admin/operator-queue'),
    getOperatorHistory: (params) => api.get('/admin/operator-history', { params }),
};

export default api;
