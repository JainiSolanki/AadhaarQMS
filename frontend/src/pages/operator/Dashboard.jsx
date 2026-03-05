import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, PlayCircle, CheckCircle2, Clock, AlertTriangle, XCircle, UserCheck, RotateCw, ChevronRight, Phone, Mail } from 'lucide-react';
import { adminAPI } from '@services/api';
import toast from 'react-hot-toast';
import { PageLoader } from '@components/ui/Loader';
import DashboardLayout from '@components/layout/DashboardLayout';
import useSocket from '@hooks/useSocket';

const fadeUp = (i = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay: i * 0.06 },
});

const STATUS_META = {
    'Pending': { color: '#eab308', icon: Clock },
    'Checked In': { color: '#3b82f6', icon: UserCheck },
    'In Progress': { color: '#a855f7', icon: PlayCircle },
    'Completed': { color: '#10b981', icon: CheckCircle2 },
    'No Show': { color: '#ef4444', icon: AlertTriangle },
    'Cancelled': { color: '#6b7280', icon: XCircle },
};

const OperatorDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchQueue = useCallback(async () => {
        try {
            const res = await adminAPI.getOperatorQueue();
            setData(res.data);
        } catch { toast.error('Failed to load queue'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchQueue();
    }, [fetchQueue]);

    // Real-time updates via Socket.IO (replaces 15s polling)
    useSocket('queue:updated', fetchQueue);

    const updateStatus = async (appointmentId, newStatus) => {
        setActionLoading(appointmentId);
        try {
            await adminAPI.updateStatus(appointmentId, { status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
            fetchQueue();
        } catch (err) { toast.error(err.message || 'Failed to update status'); }
        finally { setActionLoading(null); }
    };

    if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

    const { currentServing, appointments, summary } = data || {};
    const checkedInQueue = (appointments || []).filter(a => a.status === 'Checked In');
    const pendingQueue = (appointments || []).filter(a => a.status === 'Pending');

    const kpiCards = [
        { label: 'Pending', count: summary?.pending || 0, color: '#eab308', bg: 'rgba(234,179,8,0.12)', icon: Clock },
        { label: 'Checked In', count: summary?.checkedIn || 0, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: UserCheck },
        { label: 'In Progress', count: summary?.inProgress || 0, color: '#a855f7', bg: 'rgba(168,85,247,0.12)', icon: PlayCircle },
        { label: 'Completed', count: summary?.completed || 0, color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: CheckCircle2 },
        { label: 'No Show', count: summary?.noShow || 0, color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: AlertTriangle },
    ];

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Header */}
                <motion.div {...fadeUp(0)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                            Operator Dashboard
                        </h1>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                            {data?.date ? new Date(data.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Today'}
                        </p>
                    </div>
                    <button
                        onClick={fetchQueue}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 1rem', borderRadius: 'var(--radius-lg)',
                            background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                            color: 'var(--color-accent)', fontSize: '0.8rem', fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        <RotateCw size={14} /> Refresh
                    </button>
                </motion.div>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                    {kpiCards.map((s, i) => (
                        <motion.div key={s.label} {...fadeUp(i + 1)}>
                            <div style={{
                                padding: '1rem',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-default)',
                                borderRadius: 'var(--radius-xl)',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                                    background: `linear-gradient(90deg, ${s.color}, transparent)`,
                                }} />
                                <div style={{
                                    width: '2rem', height: '2rem', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', borderRadius: 'var(--radius-md)',
                                    background: s.bg, margin: '0 auto 0.5rem',
                                }}>
                                    <s.icon size={15} style={{ color: s.color }} />
                                </div>
                                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.count}</p>
                                <p style={{
                                    fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-tertiary)',
                                    textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.125rem',
                                }}>{s.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Currently Serving */}
                <AnimatePresence>
                    {currentServing ? (
                        <motion.div
                            key="serving"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{
                                background: 'var(--bg-surface)',
                                border: '1px solid rgba(168,85,247,0.3)',
                                borderRadius: 'var(--radius-xl)',
                                padding: '1.5rem',
                                position: 'relative', overflow: 'hidden',
                            }}
                        >
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                                background: 'linear-gradient(90deg, #a855f7, #6366f1)',
                            }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <PlayCircle size={18} style={{ color: '#a855f7' }} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Currently Serving
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{currentServing.name}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                                        <span style={{
                                            fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem',
                                            borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.12)', color: '#6366f1',
                                        }}>{currentServing.tokenNumber}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {currentServing.service?.name || 'Service'} • {currentServing.timeSlot}
                                        </span>
                                    </div>
                                    {currentServing.user && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem' }}>
                                            {currentServing.user.phone && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                    <Phone size={11} /> {currentServing.user.phone}
                                                </span>
                                            )}
                                            {currentServing.user.email && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                    <Mail size={11} /> {currentServing.user.email}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => updateStatus(currentServing.appointmentId, 'Completed')}
                                    disabled={actionLoading === currentServing.appointmentId}
                                    style={{
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        color: '#fff', border: 'none', borderRadius: 'var(--radius-lg)',
                                        padding: '0.75rem 1.5rem', fontSize: '0.85rem', fontWeight: 700,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                                        opacity: actionLoading === currentServing.appointmentId ? 0.6 : 1,
                                    }}
                                >
                                    <CheckCircle2 size={16} /> Mark Complete
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div style={{
                            background: 'var(--bg-surface)',
                            border: '1px dashed var(--border-default)',
                            borderRadius: 'var(--radius-xl)',
                            padding: '2rem', textAlign: 'center',
                            color: 'var(--text-tertiary)',
                        }}>
                            <PlayCircle size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                            <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No citizen currently being served</p>
                            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Start a checked-in appointment from the queue below</p>
                        </div>
                    )}
                </AnimatePresence>

                {/* Checked In Queue */}
                <SectionHeader title="Checked-In Queue" count={checkedInQueue.length} color="#3b82f6" icon={UserCheck} />
                {checkedInQueue.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {checkedInQueue.map((appt, i) => (
                            <AppointmentCard
                                key={appt.appointmentId} appt={appt} index={i}
                                actions={
                                    !currentServing && (
                                        <button
                                            onClick={() => updateStatus(appt.appointmentId, 'In Progress')}
                                            disabled={actionLoading === appt.appointmentId}
                                            style={{
                                                background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                                                color: '#fff', border: 'none', borderRadius: 'var(--radius-lg)',
                                                padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700,
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                                whiteSpace: 'nowrap',
                                                opacity: actionLoading === appt.appointmentId ? 0.6 : 1,
                                            }}
                                        >
                                            <ChevronRight size={14} /> Start
                                        </button>
                                    )
                                }
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyBox text="No checked-in citizens waiting" />
                )}

                {/* Pending */}
                <SectionHeader title="Pending Appointments" count={pendingQueue.length} color="#eab308" icon={Clock} />
                {pendingQueue.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {pendingQueue.map((appt, i) => (
                            <AppointmentCard key={appt.appointmentId} appt={appt} index={i} />
                        ))}
                    </div>
                ) : (
                    <EmptyBox text="No pending appointments" />
                )}
            </div>
        </DashboardLayout>
    );
};

/* ── Sub-components ── */

const SectionHeader = ({ title, count, color, icon: Icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon size={16} style={{ color }} />
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
        <span style={{
            background: `${color}22`, color,
            fontSize: '0.7rem', fontWeight: 700,
            padding: '0.15rem 0.5rem', borderRadius: 20,
        }}>{count}</span>
    </div>
);

const AppointmentCard = ({ appt, index, actions }) => {
    const meta = STATUS_META[appt.status] || STATUS_META['Pending'];
    const StatusIcon = meta.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-default)',
                padding: '1rem 1.25rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
            }}
        >
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{
                        background: 'rgba(99,102,241,0.12)', color: '#6366f1',
                        fontSize: '0.7rem', fontWeight: 800,
                        padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-md)',
                    }}>{appt.tokenNumber}</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{appt.name}</span>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                        background: `${meta.color}18`, color: meta.color,
                        fontSize: '0.65rem', fontWeight: 700,
                        padding: '0.15rem 0.5rem', borderRadius: 20,
                        border: `1px solid ${meta.color}33`,
                    }}>
                        <StatusIcon size={10} /> {appt.status}
                    </span>
                </div>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                    {appt.service?.name || 'Service'} • {appt.timeSlot}
                    {appt.user?.phone && ` • ${appt.user.phone}`}
                </p>
            </div>
            {actions && <div style={{ flexShrink: 0 }}>{actions}</div>}
        </motion.div>
    );
};

const EmptyBox = ({ text }) => (
    <div style={{
        background: 'var(--bg-surface)',
        border: '1px dashed var(--border-default)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem', textAlign: 'center',
        color: 'var(--text-tertiary)', fontSize: '0.85rem',
    }}>
        {text}
    </div>
);

export default OperatorDashboard;
