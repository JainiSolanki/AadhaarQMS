import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Calendar, CalendarPlus, CalendarDays, Users, Building2,
    BarChart3, LogOut, Menu, X, ChevronLeft, Zap, UserCog, Wrench, ClipboardList, History, Shield
} from 'lucide-react';
import useAuthStore from '@store/authStore';
import { ROLES } from '@utils/constants';
import { getInitials } from '@utils/helpers';
import ThemeToggle from '@components/shared/ThemeToggle';

const navConfig = {
    [ROLES.CITIZEN]: [
        { label: 'Dashboard', path: '/citizen/dashboard', icon: LayoutDashboard },
        { label: 'Book Appointment', path: '/citizen/book', icon: CalendarPlus },
        { label: 'My Appointments', path: '/citizen/appointments', icon: Calendar },
        { label: 'Profile', path: '/citizen/profile', icon: Users },
    ],
    [ROLES.OPERATOR]: [
        { label: 'Queue Dashboard', path: '/operator/dashboard', icon: LayoutDashboard },
        { label: "Today's Queue", path: '/operator/today', icon: ClipboardList },
        { label: 'History', path: '/operator/history', icon: History },
        { label: 'Profile', path: '/operator/profile', icon: Shield },
    ],
    [ROLES.CENTER_ADMIN]: [
        { label: 'Dashboard', path: '/center-admin/dashboard', icon: LayoutDashboard },
        { label: 'Appointments', path: '/center-admin/appointments', icon: ClipboardList },
        { label: 'Operators', path: '/center-admin/operators', icon: Users },
        { label: 'Analytics', path: '/center-admin/analytics', icon: BarChart3 },
        { label: 'Profile', path: '/center-admin/profile', icon: Shield },
    ],
    [ROLES.SUPER_ADMIN]: [
        { label: 'Dashboard', path: '/super-admin/dashboard', icon: LayoutDashboard },
        { label: 'Centers', path: '/super-admin/centers', icon: Building2 },
        { label: 'Center Admins', path: '/super-admin/center-admins', icon: UserCog },
        { label: 'Services', path: '/super-admin/services', icon: Wrench },
        { label: 'Operators', path: '/super-admin/operators', icon: Users },
        { label: 'Appointments', path: '/super-admin/appointments', icon: CalendarDays },
        { label: 'Analytics', path: '/super-admin/analytics', icon: BarChart3 },
        { label: 'Profile', path: '/super-admin/profile', icon: Shield },
    ],
};

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();

    const links = navConfig[user?.role] || [];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const SidebarContent = ({ isMobile = false }) => {
        const showText = !collapsed || isMobile;
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Logo */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1.25rem 1.25rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                    }}
                >
                    <div
                        className="shrink-0"
                        style={{
                            width: '2.25rem',
                            height: '2.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'var(--radius-lg)',
                            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))',
                        }}
                    >
                        <Zap size={18} className="text-white" />
                    </div>
                    {showText && (
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                            AadhaarQMS
                        </span>
                    )}
                </div>

                {/* Nav Links */}
                <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {links.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => isMobile && setMobileOpen(false)}
                                className="transition-all"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.65rem 0.85rem',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    borderRadius: 'var(--radius-lg)',
                                    justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                                    ...(isActive
                                        ? {
                                            background: 'rgba(255, 107, 43, 0.12)',
                                            color: 'var(--color-accent)',
                                            border: '1px solid rgba(255, 107, 43, 0.2)',
                                        }
                                        : {
                                            color: 'var(--text-secondary)',
                                            border: '1px solid transparent',
                                        }),
                                }}
                                title={collapsed ? link.label : undefined}
                            >
                                <link.icon size={18} className="shrink-0" />
                                {showText && <span>{link.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom section */}
                <div
                    style={{
                        padding: '0.75rem',
                        borderTop: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                    }}
                >
                    {/* Theme toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem 0' }}>
                        <ThemeToggle />
                    </div>

                    {/* User info */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.6rem 0.75rem',
                            borderRadius: 'var(--radius-lg)',
                            background: 'var(--bg-elevated)',
                            justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                        }}
                    >
                        <div
                            className="shrink-0"
                            style={{
                                width: '2rem',
                                height: '2rem',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, var(--color-accent), var(--color-trust-blue))',
                            }}
                        >
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>{getInitials(user?.name)}</span>
                        </div>
                        {showText && (
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user?.name}
                                </p>
                                <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {user?.role?.replace('_', ' ')}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="cursor-pointer transition-colors"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            width: '100%',
                            padding: '0.6rem 0.85rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            borderRadius: 'var(--radius-lg)',
                            color: 'var(--color-danger)',
                            background: 'transparent',
                            border: 'none',
                            justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                        }}
                    >
                        <LogOut size={18} />
                        {showText && <span>Logout</span>}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Mobile hamburger */}
            <button
                className="lg:hidden fixed z-50 cursor-pointer"
                style={{
                    top: '1rem',
                    left: '1rem',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                }}
                onClick={() => setMobileOpen(true)}
            >
                <Menu size={20} />
            </button>

            {/* Mobile drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="lg:hidden fixed left-0 top-0 bottom-0 z-50"
                            style={{
                                width: '260px',
                                background: 'var(--bg-surface)',
                                borderRight: '1px solid var(--border-default)',
                            }}
                        >
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="absolute cursor-pointer"
                                style={{
                                    top: '1rem',
                                    right: '1rem',
                                    padding: '0.375rem',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-tertiary)',
                                    background: 'transparent',
                                    border: 'none',
                                }}
                            >
                                <X size={18} />
                            </button>
                            <SidebarContent isMobile />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            <aside
                className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30 transition-[width] duration-300 ease-in-out"
                style={{
                    width: collapsed ? '72px' : '240px',
                    background: 'var(--bg-surface)',
                    borderRight: '1px solid var(--border-default)',
                }}
            >
                <SidebarContent />
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute cursor-pointer"
                    style={{
                        right: '-0.75rem',
                        top: '5rem',
                        width: '1.5rem',
                        height: '1.5rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-tertiary)',
                    }}
                >
                    <ChevronLeft size={14} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                </button>
            </aside>
        </>
    );
};

export default Sidebar;
