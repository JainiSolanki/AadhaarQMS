import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, PlayCircle, CheckCircle2, UserCheck, XCircle, AlertTriangle, ChevronRight } from 'lucide-react';
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
    'Pending': { color: '#eab308' },
    'Checked In': { color: '#3b82f6' },
    'In Progress': { color: '#a855f7' },
    'Completed': { color: '#10b981' },
    'No Show': { color: '#ef4444' },
    'Cancelled': { color: '#6b7280' },
};

const TodayAppointments = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [actionLoading, setActionLoading] = useState(null);

    const fetchQueue = useCallback(async () => {
        try {
            const res = await adminAPI.getOperatorQueue();
            setData(res.data);
        } catch { toast.error('Failed to load appointments'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchQueue();
    }, [fetchQueue]);

    // Real-time updates via Socket.IO (replaces 30s polling)
    useSocket('queue:updated', fetchQueue);

    const updateStatus = async (appointmentId, newStatus) => {
        setActionLoading(appointmentId);
        try {
            await adminAPI.updateStatus(appointmentId, { status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
            fetchQueue();
        } catch (err) { toast.error(err.message || 'Failed to update'); }
        finally { setActionLoading(null); }
    };

    if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

    const appointments = data?.appointments || [];
    const filtered = statusFilter === 'all'
        ? appointments
        : appointments.filter(a => a.status === statusFilter);

    // Group by time slot
    const grouped = {};
    filtered.forEach(appt => {
        const slot = appt.timeSlot || 'Unknown';
        if (!grouped[slot]) grouped[slot] = [];
        grouped[slot].push(appt);
    });

    const statuses = ['all', 'Pending', 'Checked In', 'In Progress', 'Completed', 'No Show', 'Cancelled'];

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Header */}
                <motion.div {...fadeUp(0)}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        Today's Appointments
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                        {data?.date ? new Date(data.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Today'}
                        {' • '}{appointments.length} total appointments
                    </p>
                </motion.div>

                {/* Filter Pills */}
                <motion.div {...fadeUp(1)} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {statuses.map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            style={{
                                padding: '0.375rem 0.875rem', borderRadius: '9999px',
                                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                                transition: 'all 0.2s', border: 'none',
                                ...(statusFilter === s
                                    ? { background: 'var(--color-accent)', color: '#fff' }
                                    : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }
                                ),
                            }}
                        >
                            {s === 'all' ? `All (${appointments.length})` : `${s} (${appointments.filter(a => a.status === s).length})`}
                        </button>
                    ))}
                </motion.div>

                {/* Content */}
                {Object.keys(grouped).length === 0 ? (
                    <motion.div {...fadeUp(2)} style={{
                        background: 'var(--bg-surface)',
                        border: '1px dashed var(--border-default)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '3rem', textAlign: 'center',
                        color: 'var(--text-tertiary)',
                    }}>
                        <Calendar size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>No appointments found</p>
                    </motion.div>
                ) : (
                    Object.entries(grouped).map(([slot, appts], gi) => (
                        <motion.div key={slot} {...fadeUp(2 + gi)} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {/* Slot header */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.5rem 0.75rem',
                                background: 'var(--bg-elevated)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border-default)',
                            }}>
                                <Clock size={14} style={{ color: '#6366f1' }} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{slot}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                                    {appts.length} appointment{appts.length > 1 ? 's' : ''}
                                </span>
                            </div>

                            {/* Appointment rows */}
                            {appts.map((appt, i) => {
                                const sc = STATUS_META[appt.status] || STATUS_META['Pending'];
                                const canStart = appt.status === 'Checked In' && !data?.currentServing;
                                const canComplete = appt.status === 'In Progress';

                                return (
                                    <motion.div
                                        key={appt.appointmentId}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        style={{
                                            background: 'var(--bg-surface)',
                                            borderRadius: 'var(--radius-xl)',
                                            border: '1px solid var(--border-default)',
                                            padding: '0.875rem 1rem',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem',
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <span style={{
                                                    background: 'rgba(99,102,241,0.12)', color: '#6366f1',
                                                    fontSize: '0.65rem', fontWeight: 800,
                                                    padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-md)',
                                                }}>{appt.tokenNumber}</span>
                                                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{appt.name}</span>
                                                <span style={{
                                                    background: `${sc.color}18`, color: sc.color,
                                                    fontSize: '0.6rem', fontWeight: 700,
                                                    padding: '0.1rem 0.4rem', borderRadius: 20,
                                                    border: `1px solid ${sc.color}33`,
                                                }}>{appt.status}</span>
                                            </div>
                                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                                                {appt.service?.name || 'Service'}
                                                {appt.user?.phone && ` • ${appt.user.phone}`}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {canStart && (
                                                <button
                                                    onClick={() => updateStatus(appt.appointmentId, 'In Progress')}
                                                    disabled={actionLoading === appt.appointmentId}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                                                        color: '#fff', border: 'none', borderRadius: 'var(--radius-lg)',
                                                        padding: '0.4rem 0.75rem', fontSize: '0.7rem', fontWeight: 700,
                                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                        opacity: actionLoading === appt.appointmentId ? 0.6 : 1,
                                                    }}
                                                ><ChevronRight size={12} /> Start</button>
                                            )}
                                            {canComplete && (
                                                <button
                                                    onClick={() => updateStatus(appt.appointmentId, 'Completed')}
                                                    disabled={actionLoading === appt.appointmentId}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                                        color: '#fff', border: 'none', borderRadius: 'var(--radius-lg)',
                                                        padding: '0.4rem 0.75rem', fontSize: '0.7rem', fontWeight: 700,
                                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                        opacity: actionLoading === appt.appointmentId ? 0.6 : 1,
                                                    }}
                                                ><CheckCircle2 size={12} /> Complete</button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ))
                )}
            </div>
        </DashboardLayout>
    );
};

export default TodayAppointments;
