import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Building2, Users, CalendarDays, Wrench, TrendingUp, AlertTriangle,
    CheckCircle2, UserCog, ArrowUpRight, Activity, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import PageHeader from '@components/shared/PageHeader';
import Card from '@components/ui/Card';
import { PageLoader } from '@components/ui/Loader';
import useAuthStore from '@store/authStore';
import { adminAPI } from '@services/api';
import { getGreeting } from '@utils/helpers';

const fadeUp = (i = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: i * 0.06 },
});

const SuperAdminDashboard = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchStats(); }, []);

    const fetchStats = async () => {
        try {
            const res = await adminAPI.getSystemStats();
            setStats(res.data);
        } catch { toast.error('Failed to load stats'); }
        finally { setLoading(false); }
    };

    if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

    const kpis = [
        { icon: Building2, label: 'Active Centers', value: stats?.activeCenters || 0, sub: `of ${stats?.totalCenters || 0}`, gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', bg: 'rgba(59,130,246,0.1)', path: '/super-admin/centers' },
        { icon: UserCog, label: 'Center Admins', value: stats?.activeAdmins || 0, sub: `of ${stats?.totalCenterAdmins || 0}`, gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', bg: 'rgba(139,92,246,0.1)', path: '/super-admin/center-admins' },
        { icon: Users, label: 'Operators', value: stats?.activeOperators || 0, sub: `of ${stats?.totalOperators || 0}`, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', bg: 'rgba(245,158,11,0.1)', path: '/super-admin/operators' },
        { icon: Wrench, label: 'Services', value: stats?.totalServices || 0, sub: 'configured', gradient: 'linear-gradient(135deg, #10b981, #059669)', bg: 'rgba(16,185,129,0.1)', path: '/super-admin/services' },
    ];

    const appointmentItems = [
        { label: 'Total Appointments', value: stats?.totalAppointments || 0, icon: CalendarDays, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
        { label: "Today's Appointments", value: stats?.todayAppointments || 0, icon: CalendarDays, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
        { label: 'Pending Now', value: stats?.pendingAppointments || 0, icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        { label: 'Completed', value: stats?.completedAppointments || 0, icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        { label: 'Completion Rate', value: `${stats?.completionRate || 0}%`, icon: TrendingUp, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    ];

    const healthItems = [
        { label: 'Active Centers', value: stats?.activeCenters || 0, total: stats?.totalCenters || 0, color: '#3b82f6' },
        { label: 'Active Operators', value: stats?.activeOperators || 0, total: stats?.totalOperators || 0, color: '#f59e0b' },
        { label: 'Active Admins', value: stats?.activeAdmins || 0, total: stats?.totalCenterAdmins || 0, color: '#8b5cf6' },
    ];

    const quickLinks = [
        { label: 'View Analytics', path: '/super-admin/analytics', icon: TrendingUp, gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
        { label: 'Appointments', path: '/super-admin/appointments', icon: CalendarDays, gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
        { label: 'Manage Centers', path: '/super-admin/centers', icon: Building2, gradient: 'linear-gradient(135deg, #10b981, #059669)' },
        { label: 'Admin Profile', path: '/super-admin/profile', icon: Users, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    ];

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', padding: '0.5rem 0' }}>
                <motion.div {...fadeUp(0)}>
                    <PageHeader
                        title={`${getGreeting()}, ${user?.name?.split(' ')[0]}!`}
                        description="System Administration Dashboard"
                    />
                </motion.div>

                {/* ── KPI Cards ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    {kpis.map((card, i) => (
                        <motion.div
                            key={card.label}
                            {...fadeUp(i + 1)}
                            onClick={() => navigate(card.path)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div
                                className="card-lift"
                                style={{
                                    padding: '1.5rem',
                                    borderRadius: 'var(--radius-2xl)',
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border-default)',
                                    boxShadow: 'var(--shadow-sm)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Subtle gradient accent bar at top */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                                    background: card.gradient,
                                }} />
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                                    <div style={{
                                        width: '2.75rem', height: '2.75rem', borderRadius: 'var(--radius-xl)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: card.bg,
                                    }}>
                                        <card.icon size={20} style={{ color: card.gradient.includes('#3b82f6') ? '#3b82f6' : card.gradient.includes('#8b5cf6') ? '#8b5cf6' : card.gradient.includes('#f59e0b') ? '#f59e0b' : '#10b981' }} />
                                    </div>
                                    <ArrowUpRight size={16} style={{ color: 'var(--text-tertiary)' }} />
                                </div>
                                <p style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                                    {card.value}
                                </p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.5rem', fontWeight: 500 }}>
                                    {card.label} <span style={{ color: 'var(--text-tertiary)', opacity: 0.7 }}>· {card.sub}</span>
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ── System Health + Appointment Stats ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
                        {/* System Health */}
                        <motion.div {...fadeUp(5)}>
                            <Card>
                                <Card.Header>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                        <div style={{
                                            width: '2rem', height: '2rem', borderRadius: 'var(--radius-md)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: 'rgba(99,102,241,0.1)',
                                        }}>
                                            <Activity size={14} style={{ color: '#6366f1' }} />
                                        </div>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>System Health</h3>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        {healthItems.map((item) => {
                                            const pct = item.total ? Math.round((item.value / item.total) * 100) : 0;
                                            return (
                                                <div key={item.label}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                                                        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{item.label}</span>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.color }}>{pct}%</span>
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>{item.value}/{item.total}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ height: '6px', borderRadius: '99px', overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${pct}%` }}
                                                            transition={{ duration: 1, delay: 0.4 }}
                                                            style={{
                                                                height: '100%', borderRadius: '99px',
                                                                background: `linear-gradient(90deg, ${item.color}, ${item.color}bb)`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card.Body>
                            </Card>
                        </motion.div>

                        {/* Appointment Stats */}
                        <motion.div {...fadeUp(6)}>
                            <Card>
                                <Card.Header>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                        <div style={{
                                            width: '2rem', height: '2rem', borderRadius: 'var(--radius-md)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: 'rgba(59,130,246,0.1)',
                                        }}>
                                            <CalendarDays size={14} style={{ color: '#3b82f6' }} />
                                        </div>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Appointment Stats</h3>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                        {appointmentItems.map((item) => (
                                            <div
                                                key={item.label}
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)',
                                                    background: 'var(--bg-elevated)',
                                                    border: '1px solid var(--border-subtle)',
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{
                                                        width: '2rem', height: '2rem', borderRadius: 'var(--radius-md)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: item.bg,
                                                    }}>
                                                        <item.icon size={14} style={{ color: item.color }} />
                                                    </div>
                                                    <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{item.label}</span>
                                                </div>
                                                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </div>
                </div>

                {/* ── Quick Actions ── */}
                <motion.div {...fadeUp(7)}>
                    <Card>
                        <Card.Header>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                <div style={{
                                    width: '2rem', height: '2rem', borderRadius: 'var(--radius-md)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'rgba(255,107,43,0.1)',
                                }}>
                                    <Zap size={14} style={{ color: 'var(--color-accent)' }} />
                                </div>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Quick Actions</h3>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                                gap: '0.75rem',
                            }}>
                                {quickLinks.map((link, i) => (
                                    <motion.button
                                        key={link.label}
                                        {...fadeUp(8 + i)}
                                        onClick={() => navigate(link.path)}
                                        className="card-lift"
                                        style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                                            padding: '1.25rem 0.75rem', borderRadius: 'var(--radius-xl)',
                                            background: 'var(--bg-elevated)',
                                            border: '1px solid var(--border-subtle)',
                                            cursor: 'pointer', color: 'inherit',
                                        }}
                                    >
                                        <div style={{
                                            width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-lg)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: link.gradient,
                                        }}>
                                            <link.icon size={16} style={{ color: '#fff' }} />
                                        </div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{link.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default SuperAdminDashboard;
