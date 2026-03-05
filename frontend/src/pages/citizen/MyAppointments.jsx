import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Search, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import PageHeader from '@components/shared/PageHeader';
import StatusBadge from '@components/ui/StatusBadge';
import { PageLoader } from '@components/ui/Loader';
import EmptyState from '@components/ui/EmptyState';
import { appointmentsAPI } from '@services/api';
import { formatDate, formatTimeSlot } from '@utils/helpers';

const MyAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => { fetchAppointments(); }, []);

    const fetchAppointments = async () => {
        try {
            const res = await appointmentsAPI.getMy();
            setAppointments(res.data || []);
        } catch (err) {
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const filtered = appointments.filter((a) => {
        if (filter !== 'all' && a.status !== filter) return false;
        if (search && !a.tokenNumber?.toLowerCase().includes(search.toLowerCase()) &&
            !a.center?.name?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const statuses = ['all', 'Pending', 'Checked In', 'In Progress', 'Completed', 'Cancelled', 'No Show'];

    if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <PageHeader title="My Appointments" description={`${appointments.length} total appointments`} />

                {/* Filters */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                        padding: '1.25rem 1.5rem',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-xl)',
                    }}
                >
                    {/* Search */}
                    <div style={{ position: 'relative', maxWidth: '24rem' }}>
                        <Search
                            size={16}
                            style={{
                                position: 'absolute',
                                left: '0.85rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-tertiary)',
                                pointerEvents: 'none',
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search by token or center…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                paddingLeft: '2.5rem',
                                paddingRight: '1rem',
                                paddingTop: '0.6rem',
                                paddingBottom: '0.6rem',
                            }}
                        />
                    </div>

                    {/* Status pills */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {statuses.map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className="cursor-pointer transition-colors"
                                style={{
                                    padding: '0.35rem 0.85rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    borderRadius: '999px',
                                    border: 'none',
                                    textTransform: 'capitalize',
                                    ...(filter === s
                                        ? { background: 'var(--color-accent)', color: '#fff' }
                                        : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }),
                                }}
                            >
                                {s === 'all' ? 'All' : s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                {filtered.length === 0 ? (
                    <div
                        style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-2xl)',
                        }}
                    >
                        <EmptyState icon={Calendar} title="No appointments found" description="Try adjusting your filters." />
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {filtered.map((appt, i) => (
                            <motion.div key={appt.appointmentId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <Link to={`/citizen/appointments/${appt.appointmentId}`}>
                                    <div
                                        className="transition-all card-lift"
                                        style={{
                                            padding: '1.25rem 1.5rem',
                                            background: 'var(--bg-surface)',
                                            border: '1px solid var(--border-default)',
                                            borderRadius: 'var(--radius-xl)',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-accent)' }}>{appt.tokenNumber}</span>
                                                    <StatusBadge status={appt.status} />
                                                </div>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{appt.service?.name}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                    {appt.center?.name} · {formatDate(appt.date)} · {formatTimeSlot(appt.timeSlot)}
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                    Booked {formatDate(appt.createdAt, 'dd MMM yyyy, HH:mm')}
                                                </span>
                                                <ArrowRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </DashboardLayout>
    );
};

export default MyAppointments;
