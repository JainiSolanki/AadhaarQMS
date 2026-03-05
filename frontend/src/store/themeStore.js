import { create } from 'zustand';

const useThemeStore = create((set, get) => ({
    theme: localStorage.getItem('aqms_theme') || 'dark',

    initialize: () => {
        const saved = localStorage.getItem('aqms_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
        set({ theme: saved });
    },

    toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('aqms_theme', next);
        set({ theme: next });
    },

    setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('aqms_theme', theme);
        set({ theme });
    },
}));

export default useThemeStore;
