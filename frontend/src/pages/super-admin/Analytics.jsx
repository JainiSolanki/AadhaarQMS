import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3, TrendingUp, PieChart, Building2, Users, Clock,
    CalendarDays, CheckCircle2, AlertTriangle, XCircle, Activity, Wrench
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import PageHeader from '@components/shared/PageHeader';
import Card from '@components/ui/Card';
import { PageLoader } from '@components/ui/Loader';
import { adminAPI } from '@services/api';

const STATUS_COLORS = {
    Pending: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
    'Checked In': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: 'rgba(59,130,246,0.25)' },
    'In Progress': { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6', border: 'rgba(139,92,246,0.25)' },
    Completed: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.25)' },
    'No-Show': { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.25)' },
    Cancelled: { bg: 'rgba(107,114,128,0.12)', color: '#6b7280', border: 'rgba(107,114,128,0.25)' },
};

const fadeUp = (i = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: i * 0.06 },
});

const SectionIcon = ({ icon: Icon, color, bg }) => (
    <div style={{
        width: '2rem', height: '2rem', borderRadius: 'var(--radius-md)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg,
    }}>
        <Icon size={14} style={{ color }} />
    </div>
);

const SuperAdminAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAnalytics(); }, []);

    const fetchAnalytics = async () => {
        try { const res = await adminAPI.getAnalytics(); setAnalytics(res.data); }
        catch { toast.error('Failed to load analytics'); }
        finally { setLoading(false); }
    };

    if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;
    if (!analytics) return (
        <DashboardLayout>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
                <p style={{ color: 'var(--text-tertiary)' }}>No analytics data available.</p>
            </div>
        </DashboardLayout>
    );

    const maxDailyCount = Math.max(...(analytics.dailyTrend || []).map(d => d.count), 1);
    const maxServiceCount = Math.max(...Object.values(analytics.byService || {}), 1);

    const kpis = [
        { icon: CalendarDays, label: 'Total Appointments', value: analytics.totalAppointments || 0, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
        { icon: CheckCircle2, label: 'Completion Rate', value: `${analytics.completionRate || 0}%`, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        { icon: XCircle, label: 'No-Show Rate', value: `${analytics.noShowRate || 0}%`, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
        { icon: Building2, label: 'Active Centers', value: analytics.activeCenters || 0, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    ];

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem 0' }}>
                <motion.div {...fadeUp(0)}>
                    <PageHeader title="Global Analytics" description="System-wide performance insights & trends" />
                </motion.div>

                {/* ── KPI Cards ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {kpis.map((card, i) => (
                        <motion.div key={card.label} {...fadeUp(i + 1)}>
                            <div style={{
                                padding: '1.25rem 1.5rem',
                                borderRadius: 'var(--radius-2xl)',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-default)',
                                boxShadow: 'var(--shadow-sm)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                                    <span style={{
                                        fontSize: '0.6875rem', fontWeight: 700,
                                        textTransform: 'uppercase', letterSpacing: '0.06em',
                                        color: 'var(--text-tertiary)',
                                    }}>
                                        {card.label}
                                    </span>
                                    <div style={{
                                        width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-md)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: card.bg,
                                    }}>
                                        <card.icon size={16} style={{ color: card.color }} />
                                    </div>
                                </div>
                                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                                    {card.value}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ── Today's Snapshot + Status Distribution ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
                    <motion.div {...fadeUp(5)}>
                        <Card>
                            <Card.Header>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                    <SectionIcon icon={Activity} color="var(--color-accent)" bg="rgba(255,107,43,0.1)" />
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Today's Live Snapshot</h3>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                {analytics.todaySnapshot ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.625rem' }}>
                                        {[
                                            { label: 'Total', value: analytics.todaySnapshot.total, color: '#6366f1' },
                                            { label: 'Pending', value: analytics.todaySnapshot.pending, color: '#f59e0b' },
                                            { label: 'Checked In', value: analytics.todaySnapshot.checkedIn, color: '#3b82f6' },
                                            { label: 'In Progress', value: analytics.todaySnapshot.inProgress, color: '#8b5cf6' },
                                            { label: 'Completed', value: analytics.todaySnapshot.completed, color: '#10b981' },
                                            { label: 'No-Show', value: analytics.todaySnapshot.noShow, color: '#ef4444' },
                                            { label: 'Cancelled', value: analytics.todaySnapshot.cancelled, color: '#6b7280' },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                style={{
                                                    textAlign: 'center', padding: '0.75rem 0.5rem',
                                                    borderRadius: 'var(--radius-lg)', background: 'var(--bg-elevated)',
                                                    border: '1px solid var(--border-subtle)',
                                                }}
                                            >
                                                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: item.color }}>{item.value}</p>
                                                <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>{item.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>No data</p>}
                            </Card.Body>
                        </Card>
                    </motion.div>

                    <motion.div {...fadeUp(6)}>
                        <Card>
                            <Card.Header>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                    <SectionIcon icon={PieChart} color="#8b5cf6" bg="rgba(139,92,246,0.1)" />
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Status Distribution</h3>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                {analytics.byStatus && Object.keys(analytics.byStatus).length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                        {Object.entries(analytics.byStatus).map(([status, count]) => {
                                            const total = analytics.totalAppointments || 1;
                                            const pct = Math.round((count / total) * 100);
                                            const sc = STATUS_COLORS[status] || { bg: 'rgba(100,100,100,0.12)', color: '#64748b' };
                                            return (
                                                <div key={status}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: sc.color }} />
                                                            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{status}</span>
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{count} ({pct}%)</span>
                                                    </div>
                                                    <div style={{ height: '6px', borderRadius: '99px', overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${pct}%` }}
                                                            transition={{ duration: 0.8, delay: 0.2 }}
                                                            style={{ height: '100%', borderRadius: '99px', background: sc.color }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>No data</p>}
                            </Card.Body>
                        </Card>
                    </motion.div>
                </div>

                {/* ── 7-Day Trend + Peak Hours ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
                    <motion.div {...fadeUp(7)}>
                        <Card>
                            <Card.Header>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                    <SectionIcon icon={TrendingUp} color="#6366f1" bg="rgba(99,102,241,0.1)" />
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>7-Day Appointment Trend</h3>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                {analytics.dailyTrend && analytics.dailyTrend.length > 0 ? (
                                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '160px' }}>
                                        {analytics.dailyTrend.map((d, i) => {
                                            const heightPct = maxDailyCount > 0 ? (d.count / maxDailyCount) * 100 : 0;
                                            const isToday = i === analytics.dailyTrend.length - 1;
                                            return (
                                                <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{d.count}</span>
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${Math.max(heightPct, 4)}%` }}
                                                        transition={{ duration: 0.6, delay: i * 0.08 }}
                                                        style={{
                                                            width: '100%', borderRadius: '6px 6px 0 0', minHeight: '4px',
                                                            background: isToday
                                                                ? 'linear-gradient(180deg, #6366f1, #818cf8)'
                                                                : 'linear-gradient(180deg, rgba(99,102,241,0.4), rgba(99,102,241,0.15))',
                                                        }}
                                                    />
                                                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{d.day}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>No data</p>}
                            </Card.Body>
                        </Card>
                    </motion.div>

                    <motion.div {...fadeUp(8)}>
                        <Card>
                            <Card.Header>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                    <SectionIcon icon={Clock} color="#f59e0b" bg="rgba(245,158,11,0.1)" />
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Peak Hours</h3>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                {analytics.peakHours && Object.keys(analytics.peakHours).length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {Object.entries(analytics.peakHours)
                                            .sort(([, a], [, b]) => b - a)
                                            .slice(0, 8)
                                            .map(([slot, count]) => {
                                                const maxPeak = Math.max(...Object.values(analytics.peakHours));
                                                const pct = Math.round((count / maxPeak) * 100);
                                                return (
                                                    <div key={slot}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{slot}</span>
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{count}</span>
                                                        </div>
                                                        <div style={{ height: '5px', borderRadius: '99px', overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${pct}%` }}
                                                                transition={{ duration: 0.8 }}
                                                                style={{ height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg, #f59e0b, #f97316)' }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ) : <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>No data</p>}
                            </Card.Body>
                        </Card>
                    </motion.div>
                </div>

                {/* ── Service Breakdown + Center Performance ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
                    <motion.div {...fadeUp(9)}>
                        <Card>
                            <Card.Header>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                    <SectionIcon icon={Wrench} color="#10b981" bg="rgba(16,185,129,0.1)" />
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Appointments by Service</h3>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                {analytics.byService && Object.keys(analytics.byService).length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                        {Object.entries(analytics.byService)
                                            .sort(([, a], [, b]) => b - a)
                                            .map(([service, count]) => {
                                                const pct = Math.round((count / maxServiceCount) * 100);
                                                return (
                                                    <div key={service}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                                                            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{service}</span>
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent)' }}>{count}</span>
                                                        </div>
                                                        <div style={{ height: '6px', borderRadius: '99px', overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${pct}%` }}
                                                                transition={{ duration: 0.8 }}
                                                                style={{ height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg, #6366f1, #a78bfa)' }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ) : <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>No data</p>}
                            </Card.Body>
                        </Card>
                    </motion.div>

                    <motion.div {...fadeUp(10)}>
                        <Card>
                            <Card.Header>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                    <SectionIcon icon={Building2} color="#3b82f6" bg="rgba(59,130,246,0.1)" />
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Center Performance</h3>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                {analytics.byCenter && Object.keys(analytics.byCenter).length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {Object.entries(analytics.byCenter).map(([center, stats]) => (
                                            <div
                                                key={center}
                                                style={{
                                                    padding: '0.875rem 1rem', borderRadius: 'var(--radius-lg)',
                                                    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                                                }}
                                            >
                                                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.625rem' }}>{center}</p>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                                                    {[
                                                        { label: 'Total', val: stats.total, color: '#6366f1' },
                                                        { label: 'Done', val: stats.completed, color: '#10b981' },
                                                        { label: 'Pending', val: stats.pending, color: '#f59e0b' },
                                                        { label: 'Checked', val: stats.checkedIn, color: '#3b82f6' },
                                                    ].map((s) => (
                                                        <div key={s.label}>
                                                            <p style={{ fontSize: '1.125rem', fontWeight: 800, color: s.color }}>{s.val}</p>
                                                            <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>{s.label}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>No data</p>}
                            </Card.Body>
                        </Card>
                    </motion.div>
                </div>

                {/* ── Quick Info ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {[
                        { icon: Users, label: 'Active Operators', value: analytics.totalOperators || 0, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
                        { icon: Wrench, label: 'Available Services', value: analytics.totalServices || 0, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                        {
                            icon: BarChart3, label: 'Avg/Day (7d)',
                            value: analytics.dailyTrend
                                ? (analytics.dailyTrend.reduce((s, d) => s + d.count, 0) / 7).toFixed(1)
                                : '0',
                            color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',
                        },
                    ].map((card, i) => (
                        <motion.div key={card.label} {...fadeUp(11 + i)}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                padding: '1rem 1.25rem', borderRadius: 'var(--radius-2xl)',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-default)',
                                boxShadow: 'var(--shadow-sm)',
                            }}>
                                <div style={{
                                    width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-lg)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: card.bg,
                                }}>
                                    <card.icon size={18} style={{ color: card.color }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{card.value}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{card.label}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SuperAdminAnalytics;
