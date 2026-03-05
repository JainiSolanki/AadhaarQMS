import { create } from 'zustand';
import { authAPI } from '@services/api';

const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,

    // Initialize from localStorage
    initialize: () => {
        try {
            const token = localStorage.getItem('aqms_token');
            const user = JSON.parse(localStorage.getItem('aqms_user') || 'null');
            if (token && user) {
                set({ user, token, isAuthenticated: true, isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch {
            localStorage.removeItem('aqms_token');
            localStorage.removeItem('aqms_user');
            set({ isLoading: false });
        }
    },

    // Citizen register
    register: async (data) => {
        const res = await authAPI.register(data);
        const { token, user } = res.data;
        localStorage.setItem('aqms_token', token);
        localStorage.setItem('aqms_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
        return res;
    },

    // Citizen login
    login: async (data) => {
        const res = await authAPI.login(data);
        const { token, user } = res.data;
        localStorage.setItem('aqms_token', token);
        localStorage.setItem('aqms_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
        return res;
    },

    // Admin login (super admin, center admin, operator)
    adminLogin: async (data) => {
        const res = await authAPI.adminLogin(data);
        const { token, admin } = res.data;
        const user = { ...admin, userId: admin.adminId };
        localStorage.setItem('aqms_token', token);
        localStorage.setItem('aqms_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
        return res;
    },

    // Update user profile in store + localStorage
    updateUser: (updates) => {
        const current = get().user;
        const updatedUser = { ...current, ...updates };
        localStorage.setItem('aqms_user', JSON.stringify(updatedUser));
        set({ user: updatedUser });
    },

    // Logout
    logout: () => {
        localStorage.removeItem('aqms_token');
        localStorage.removeItem('aqms_user');
        set({ user: null, token: null, isAuthenticated: false });
    },
}));

export default useAuthStore;
