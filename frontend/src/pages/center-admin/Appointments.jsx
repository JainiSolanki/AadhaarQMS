import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCw, CalendarDays, User, Clock, Inbox, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import StatusBadge from '@components/ui/StatusBadge';
import Button from '@components/ui/Button';
import { PageLoader } from '@components/ui/Loader';
import EmptyState from '@components/ui/EmptyState';
import useAuthStore from '@store/authStore';
import { adminAPI, operatorsAPI } from '@services/api';
import { formatDate, formatTimeSlot } from '@utils/helpers';
import { ALLOWED_TRANSITIONS } from '@utils/constants';

const fadeUp = (i = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay: i * 0.06 },
});

const statusFilters = ['all', 'Pending', 'Checked In', 'In Progress', 'Completed', 'Cancelled'];

const CenterAppointments = () => {
    const { user } = useAuthStore();
    const [appointments, setAppointments] = useState([]);
    const [operators, setOperators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState('');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [apptRes, opRes] = await Promise.all([
                adminAPI.getAppointments({ centerId: user?.centerId }),
                operatorsAPI.getByCenter(user?.centerId),
            ]);
            setAppointments(apptRes.data || []);
            setOperators(opRes.data || []);
        } catch { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    };

    const updateStatus = async (id, status) => {
        setActionLoading(id + status);
        try {
            await adminAPI.updateStatus(id, { status });
            toast.success(`Updated to ${status}`);
            fetchData();
        } catch (err) { toast.error(err.message || 'Update failed'); }
        finally { setActionLoading(''); }
    };

    const filtered = appointments.filter((a) => {
        if (filter !== 'all' && a.status !== filter) return false;
        if (search && !a.tokenNumber?.toLowerCase().includes(search.toLowerCase()) &&
            !a.name?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Header */}
                <motion.div {...fadeUp(0)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                            Appointments
                        </h1>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                            Manage center appointments · {appointments.length} total
                        </p>
                    </div>
                    <Button icon={RefreshCw} variant="secondary" size="sm" onClick={fetchData}>Refresh</Button>
                </motion.div>

                {/* Search & Filters */}
                <motion.div {...fadeUp(1)} style={{
                    display: 'flex', flexDirection: 'column', gap: '0.875rem',
                    padding: '1.25rem', background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)',
                }}>
                    {/* Search bar */}
                    <div style={{ position: 'relative', maxWidth: '400px' }}>
                        <Search size={16} style={{
                            position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                            color: 'var(--text-tertiary)',
                        }} />
                        <input
                            type="text" placeholder="Search by name or token..."
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%', padding: '0.625rem 0.875rem 0.625rem 2.5rem',
                                background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                                borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)',
                                fontSize: '0.85rem', outline: 'none',
                            }}
                        />
                    </div>

                    {/* Status pills */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {statusFilters.map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                style={{
                                    padding: '0.375rem 0.875rem', borderRadius: '9999px',
                                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                                    transition: 'all 0.2s', border: 'none',
                                    ...(filter === s
                                        ? { background: 'var(--color-accent)', color: '#fff' }
                                        : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }
                                    ),
                                }}
                            >
                                {s === 'all' ? 'All' : s}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Results */}
                {filtered.length === 0 ? (
                    <motion.div {...fadeUp(2)}>
                        <EmptyState icon={Inbox} title="No appointments" description="No appointments match your criteria." />
                    </motion.div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {filtered.map((appt, i) => (
                            <motion.div key={appt.appointmentId} {...fadeUp(2 + i * 0.3)}>
                                <div style={{
                                    padding: '1.25rem 1.5rem',
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border-default)',
                                    borderRadius: 'var(--radius-xl)',
                                    display: 'flex', flexDirection: 'column', gap: '0.875rem',
                                }}>
                                    {/* Top row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                            {/* Token + Status */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                                                <span style={{
                                                    fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-accent)',
                                                    letterSpacing: '0.02em',
                                                }}>
                                                    {appt.tokenNumber}
                                                </span>
                                                <StatusBadge status={appt.status} />
                                                {appt.operatorId && (
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                                        fontSize: '0.7rem', fontWeight: 500,
                                                        padding: '0.2rem 0.6rem', borderRadius: '9999px',
                                                        background: 'rgba(99,102,241,0.1)', color: '#818cf8',
                                                    }}>
                                                        <Monitor size={10} />
                                                        {appt.operator?.name || 'Assigned'} {appt.counterId ? `· C${appt.counterId}` : ''}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Name + Service */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <User size={13} style={{ color: 'var(--text-tertiary)' }} />
                                                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                                    {appt.name}
                                                </span>
                                                {appt.service?.name && (
                                                    <>
                                                        <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                            {appt.service.name}
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Date, time, queue */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <CalendarDays size={12} style={{ color: 'var(--text-tertiary)' }} />
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                    {formatDate(appt.date)}
                                                </span>
                                                <Clock size={12} style={{ color: 'var(--text-tertiary)' }} />
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                    {formatTimeSlot(appt.timeSlot)}
                                                </span>
                                                {appt.queuePosition && (
                                                    <span style={{
                                                        fontSize: '0.7rem', fontWeight: 600,
                                                        padding: '0.125rem 0.5rem', borderRadius: '9999px',
                                                        background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
                                                    }}>
                                                        Queue #{appt.queuePosition}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        {ALLOWED_TRANSITIONS[appt.status]?.length > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {ALLOWED_TRANSITIONS[appt.status].map((ns) => (
                                                    <Button
                                                        key={ns} size="sm"
                                                        variant={ns === 'Cancelled' || ns === 'No Show' ? 'danger' : 'primary'}
                                                        loading={actionLoading === appt.appointmentId + ns}
                                                        onClick={() => updateStatus(appt.appointmentId, ns)}
                                                    >
                                                        {ns}
                                                    </Button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CenterAppointments;
