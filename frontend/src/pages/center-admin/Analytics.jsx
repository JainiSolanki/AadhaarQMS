import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart, Clock, Activity, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import Card from '@components/ui/Card';
import { PageLoader } from '@components/ui/Loader';
import useAuthStore from '@store/authStore';
import { adminAPI } from '@services/api';

const fadeUp = (i = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay: i * 0.06 },
});

const statusColorMap = {
    Pending: '#f59e0b',
    'Checked In': '#6366f1',
    'In Progress': '#3b82f6',
    Completed: '#10b981',
    Cancelled: '#ef4444',
    'No Show': '#94a3b8',
};

const CenterAnalytics = () => {
    const { user } = useAuthStore();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAnalytics(); }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await adminAPI.getAnalytics({ centerId: user?.centerId });
            setAnalytics(res.data);
        } catch { toast.error('Failed to load analytics'); }
        finally { setLoading(false); }
    };

    if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

    const statCards = analytics ? [
        { icon: BarChart3, label: 'Total Appointments', value: analytics.totalAppointments || 0, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
        { icon: TrendingUp, label: 'Completion Rate', value: `${analytics.completionRate || 0}%`, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
        { icon: PieChart, label: 'No-Show Rate', value: `${analytics.noShowRate || 0}%`, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
        { icon: Clock, label: 'Avg Wait Time', value: analytics.avgWaitTime || '—', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    ] : [];

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Header */}
                <motion.div {...fadeUp(0)}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        Center Analytics
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                        Performance insights for your center
                    </p>
                </motion.div>

                {analytics ? (
                    <>
                        {/* KPI Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            {statCards.map((s, i) => (
                                <motion.div key={s.label} {...fadeUp(i + 1)}>
                                    <div style={{
                                        padding: '1.25rem 1.5rem',
                                        background: 'var(--bg-surface)',
                                        border: '1px solid var(--border-default)',
                                        borderRadius: 'var(--radius-xl)',
                                        position: 'relative', overflow: 'hidden',
                                    }}>
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

                        {/* Status Breakdown */}
                        <motion.div {...fadeUp(5)}>
                            <Card>
                                <Card.Header>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '2rem', height: '2rem', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', borderRadius: 'var(--radius-md)',
                                            background: 'rgba(99,102,241,0.12)',
                                        }}>
                                            <Activity size={14} style={{ color: '#818cf8' }} />
                                        </div>
                                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                            Status Breakdown
                                        </h3>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    {analytics.byStatus && Object.keys(analytics.byStatus).length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {Object.entries(analytics.byStatus).map(([status, count]) => {
                                                const total = analytics.totalAppointments || 1;
                                                const pct = Math.round((count / total) * 100);
                                                return (
                                                    <div key={status}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <div style={{
                                                                    width: '8px', height: '8px', borderRadius: '50%',
                                                                    background: statusColorMap[status] || 'var(--color-accent)',
                                                                }} />
                                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{status}</span>
                                                            </div>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                                {count} ({pct}%)
                                                            </span>
                                                        </div>
                                                        <div style={{
                                                            height: '6px', borderRadius: '3px', overflow: 'hidden',
                                                            background: 'var(--bg-elevated)',
                                                        }}>
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${pct}%` }}
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
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', padding: '0.5rem 0' }}>
                                            No status data available yet.
                                        </p>
                                    )}
                                </Card.Body>
                            </Card>
                        </motion.div>

                        {/* Service Breakdown */}
                        {analytics.byService && Object.keys(analytics.byService).length > 0 && (
                            <motion.div {...fadeUp(6)}>
                                <Card>
                                    <Card.Header>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '2rem', height: '2rem', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', borderRadius: 'var(--radius-md)',
                                                background: 'rgba(245,158,11,0.12)',
                                            }}>
                                                <Layers size={14} style={{ color: '#f59e0b' }} />
                                            </div>
                                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                By Service
                                            </h3>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {Object.entries(analytics.byService).map(([service, count]) => {
                                                const total = analytics.totalAppointments || 1;
                                                const pct = Math.round((count / total) * 100);
                                                return (
                                                    <div
                                                        key={service}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                            padding: '0.75rem 1rem', background: 'var(--bg-elevated)',
                                                            borderRadius: 'var(--radius-lg)',
                                                            border: '1px solid var(--border-subtle, var(--border-default))',
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                                            {service}
                                                        </span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <div style={{
                                                                width: '4rem', height: '4px', borderRadius: '2px',
                                                                background: 'var(--bg-base, var(--bg-surface))', overflow: 'hidden',
                                                            }}>
                                                                <div style={{
                                                                    height: '100%', borderRadius: '2px', width: `${pct}%`,
                                                                    background: '#f59e0b',
                                                                }} />
                                                            </div>
                                                            <span style={{
                                                                fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-accent)',
                                                                minWidth: '2.5rem', textAlign: 'right',
                                                            }}>
                                                                {count}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        )}
                    </>
                ) : (
                    <motion.div {...fadeUp(1)}>
                        <div style={{
                            textAlign: 'center', padding: '3rem 1rem',
                            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-xl)',
                        }}>
                            <BarChart3 size={40} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
                            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                No analytics data available
                            </p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                                Analytics will appear once appointments are processed.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CenterAnalytics;
