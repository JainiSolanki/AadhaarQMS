import { Navigate } from 'react-router-dom';
import useAuthStore from '@store/authStore';
import { ROLE_DASHBOARD_PATHS } from '@utils/constants';

/**
 * Protects routes that require authentication + specific roles.
 * - Not authenticated → redirect to /login
 * - Authenticated but wrong role → redirect to user's own dashboard
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-base)' }}>
                <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '3px solid var(--color-accent)', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        const dashboardPath = ROLE_DASHBOARD_PATHS[user?.role] || '/';
        return <Navigate to={dashboardPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
