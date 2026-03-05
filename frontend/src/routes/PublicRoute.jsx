import { Navigate } from 'react-router-dom';
import useAuthStore from '@store/authStore';
import { ROLE_DASHBOARD_PATHS } from '@utils/constants';

/**
 * Public-only routes (login, register).
 * If user is already authenticated, redirect to their dashboard.
 */
const PublicRoute = ({ children }) => {
    const { isAuthenticated, user, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-base)' }}>
                <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '3px solid var(--color-accent)', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    if (isAuthenticated && user) {
        const dashboardPath = ROLE_DASHBOARD_PATHS[user.role] || '/';
        return <Navigate to={dashboardPath} replace />;
    }

    return children;
};

export default PublicRoute;
