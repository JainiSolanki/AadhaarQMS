import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import useAuthStore from '@store/authStore';
import useThemeStore from '@store/themeStore';
import AppRouter from '@routes/AppRouter';

const App = () => {
    const initialize = useAuthStore((s) => s.initialize);
    const initializeTheme = useThemeStore((s) => s.initialize);

    useEffect(() => {
        initialize();
        initializeTheme();
    }, [initialize, initializeTheme]);

    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3500,
                    style: {
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: '0.875rem',
                    },
                    success: { iconTheme: { primary: 'var(--color-success)', secondary: '#fff' } },
                    error: { iconTheme: { primary: 'var(--color-danger)', secondary: '#fff' } },
                }}
            />
            <AppRouter />
        </>
    );
};

export default App;
