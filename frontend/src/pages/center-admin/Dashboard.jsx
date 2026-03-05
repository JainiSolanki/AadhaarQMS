import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Users, BarChart3, Clock, CheckCircle2, TrendingUp, Activity, Monitor, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import Card from '@components/ui/Card';
import { PageLoader } from '@components/ui/Loader';
import useAuthStore from '@store/authStore';
import { adminAPI, operatorsAPI, queueAPI } from '@services/api';
import { getGreeting } from '@utils/helpers';

const fadeUp = (i = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: i * 0.07 },
});

const statusColorMap = {
    Pending: '#f59e0b',
    'Checked In': '#6366f1',
    'In Progress': '#3b82f6',
    Completed: '#10b981',
    Cancelled: '#ef4444',
    'No Show': '#94a3b8',
};

const CenterAdminDashboard = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [operators, setOperators] = useState([]);
    const [queue, setQueue] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [analyticsRes, operatorsRes, queueRes] = await Promise.allSettled([
                adminAPI.getAnalytics({ centerId: user?.centerId }),
                operatorsAPI.getByCenter(user?.centerId),
                queueAPI.getTodayQueue(user?.centerId),
            ]);
            if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data);
            if (operatorsRes.status === 'fulfilled') setOperators(operatorsRes.value.data || []);
            if (queueRes.status === 'fulfilled') setQueue(queueRes.value.data || queueRes.value);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

    const appointments = queue?.appointments || [];
    const todayStats = {
        total: appointments.length,
        pending: appointments.filter((a) => a.status === 'Pending').length,
        inProgress: appointments.filter((a) => a.status === 'In Progress').length,
        completed: appointments.filter((a) => a.status === 'Completed').length,
    };

    const statCards = [
        { icon: CalendarDays, label: "Today's Appointments", value: todayStats.total, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
        { icon: Clock, label: 'Pending', value: todayStats.pending, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
        { icon: Activity, label: 'In Progress', value: todayStats.inProgress, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
        { icon: CheckCircle2, label: 'Completed', value: todayStats.completed, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    ];

    const activeOps = operators.filter(o => o.isActive);

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Greeting */}
                <motion.div {...fadeUp(0)}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        {getGreeting()}, {user?.name?.split(' ')[0]}!
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                        Center Administration Dashboard
                    </p>
                </motion.div>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {statCards.map((s, i) => (
                        <motion.div key={s.label} {...fadeUp(i + 1)}>
                            <div style={{
                                padding: '1.25rem 1.5rem',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-default)',
                                borderRadius: 'var(--radius-xl)',
                                position: 'relative',
                                overflow: 'hidden',
                            }}>
                                {/* Accent strip */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                                    background: `linear-gradient(90deg, ${s.color}, transparent)`,
                                }} />
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <p style={{
                                            fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
                                            letterSpacing: '0.08em', color: 'var(--text-tertiary)',
                                        }}>{s.label}</p>
                                        <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                                            {s.value}
                                        </p>
                                    </div>
                                    <div style={{
                                        width: '2.75rem', height: '2.75rem', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', borderRadius: 'var(--radius-lg)', background: s.bg,
                                    }}>
                                        <s.icon size={20} style={{ color: s.color }} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions Row */}
                <motion.div {...fadeUp(5)} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {[
                        { label: 'Appointments', path: '/center-admin/appointments', icon: CalendarDays },
                        { label: 'Operators', path: '/center-admin/operators', icon: Users },
                        { label: 'Analytics', path: '/center-admin/analytics', icon: BarChart3 },
                    ].map(q => (
                        <button
                            key={q.label}
                            onClick={() => navigate(q.path)}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.5rem 1rem', borderRadius: 'var(--radius-lg)',
                                background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                                color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500,
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                        >
                            <q.icon size={14} style={{ color: 'var(--color-accent)' }} />
                            {q.label}
                            <ArrowRight size={12} style={{ opacity: 0.5 }} />
                        </button>
                    ))}
                </motion.div>

                {/* Two Column: Operators + Performance */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

                    {/* Active Operators */}
                    <motion.div {...fadeUp(6)}>
                        <Card>
                            <Card.Header>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '2rem', height: '2rem', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', borderRadius: 'var(--radius-md)',
                                        background: 'rgba(99,102,241,0.12)',
                                    }}>
                                        <Users size={14} style={{ color: '#818cf8' }} />
                                    </div>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        Active Operators ({activeOps.length})
                                    </h3>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                {operators.length === 0 ? (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', padding: '1rem 0' }}>
                                        No operators assigned yet.
                                    </p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                        {operators.map((op) => (
                                            <div
                                                key={op.operatorId}
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '0.75rem 1rem', background: 'var(--bg-elevated)',
                                                    borderRadius: 'var(--radius-lg)',
                                                    border: '1px solid var(--border-subtle, var(--border-default))',
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{
                                                        width: '2.25rem', height: '2.25rem', borderRadius: '50%',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-trust-blue))',
                                                        flexShrink: 0,
                                                    }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
                                                            {op.name?.[0]?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                            {op.name}
                                                        </p>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.125rem' }}>
                                                            <Monitor size={11} style={{ color: 'var(--text-tertiary)' }} />
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                                Counter {op.counterId}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span
                                                    style={{
                                                        fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.6rem',
                                                        borderRadius: '9999px',
                                                        ...(op.isActive
                                                            ? { background: 'rgba(16,185,129,0.12)', color: '#10b981' }
                                                            : { background: 'rgba(239,68,68,0.12)', color: '#ef4444' }
                                                        ),
                                                    }}
                                                >
                                                    {op.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </motion.div>

                    {/* Performance Overview */}
                    <motion.div {...fadeUp(7)}>
                        <Card>
                            <Card.Header>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '2rem', height: '2rem', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', borderRadius: 'var(--radius-md)',
                                        background: 'rgba(16,185,129,0.12)',
                                    }}>
                                        <TrendingUp size={14} style={{ color: '#10b981' }} />
                                    </div>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        Performance Overview
                                    </h3>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                {analytics ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {/* Status bars */}
                                        {analytics.byStatus && Object.entries(analytics.byStatus).map(([status, count]) => {
                                            const pct = todayStats.total ? Math.round((count / todayStats.total) * 100) : 0;
                                            return (
                                                <div key={status}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{status}</span>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{count}</span>
                                                    </div>
                                                    <div style={{
                                                        height: '6px', borderRadius: '3px', overflow: 'hidden',
                                                        background: 'var(--bg-elevated)',
                                                    }}>
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(pct, 100)}%` }}
                                                            transition={{ duration: 0.8, delay: 0.3 }}
                                                            style={{
                                                                height: '100%', borderRadius: '3px',
                                                                background: statusColorMap[status] || 'var(--color-accent)',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Completion rate */}
                                        {analytics.completionRate != null && (
                                            <div style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                paddingTop: '0.75rem', borderTop: '1px solid var(--border-default)',
                                            }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Completion Rate</span>
                                                <span style={{
                                                    fontSize: '1.1rem', fontWeight: 700,
                                                    color: analytics.completionRate > 50 ? '#10b981' : '#f59e0b',
                                                }}>
                                                    {analytics.completionRate}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', padding: '1rem 0' }}>
                                        No analytics data available yet.
                                    </p>
                                )}
                            </Card.Body>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CenterAdminDashboard;
