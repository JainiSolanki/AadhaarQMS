import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Calendar, Search } from 'lucide-react';
import { adminAPI } from '@services/api';
import toast from 'react-hot-toast';
import { PageLoader } from '@components/ui/Loader';
import DashboardLayout from '@components/layout/DashboardLayout';

const fadeUp = (i = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay: i * 0.06 },
});

const STATUS_META = {
    'Completed': { color: '#10b981' },
    'No Show': { color: '#ef4444' },
    'Cancelled': { color: '#6b7280' },
    'In Progress': { color: '#a855f7' },
    'Checked In': { color: '#3b82f6' },
    'Pending': { color: '#eab308' },
};

const History = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (startDate && endDate) { params.startDate = startDate; params.endDate = endDate; }
            const res = await adminAPI.getOperatorHistory(params);
            setAppointments(res.data.data || []);
        } catch { toast.error('Failed to load history'); }
        finally { setLoading(false); }
    }, [startDate, endDate]);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    const filtered = appointments.filter(a => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return a.name?.toLowerCase().includes(q) || a.tokenNumber?.toLowerCase().includes(q) || a.status?.toLowerCase().includes(q);
    });

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Header */}
                <motion.div {...fadeUp(0)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <HistoryIcon size={22} style={{ color: '#6366f1' }} />
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Appointment History
                        </h1>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                        View your past appointments
                    </p>
                </motion.div>

                {/* Filters */}
                <motion.div {...fadeUp(1)} style={{
                    display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center',
                    padding: '1rem 1.25rem',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border-default)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={14} style={{ color: 'var(--text-tertiary)' }} />
                        <input
                            type="date" value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            style={{
                                padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border-default)', background: 'var(--bg-elevated)',
                                color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none',
                            }}
                        />
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>to</span>
                        <input
                            type="date" value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            style={{
                                padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border-default)', background: 'var(--bg-elevated)',
                                color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none',
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 180 }}>
                        <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
                        <input
                            type="text" placeholder="Search by name or token..."
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            style={{
                                flex: 1, padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border-default)', background: 'var(--bg-elevated)',
                                color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none',
                            }}
                        />
                    </div>
                </motion.div>

                {loading ? <PageLoader /> : (
                    <>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                            {filtered.length} appointment{filtered.length !== 1 ? 's' : ''} found
                        </p>

                        {filtered.length === 0 ? (
                            <motion.div {...fadeUp(2)} style={{
                                background: 'var(--bg-surface)',
                                border: '1px dashed var(--border-default)',
                                borderRadius: 'var(--radius-xl)',
                                padding: '3rem', textAlign: 'center',
                                color: 'var(--text-tertiary)',
                            }}>
                                <HistoryIcon size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                                <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No appointments found</p>
                            </motion.div>
                        ) : (
                            <motion.div {...fadeUp(2)} style={{
                                background: 'var(--bg-surface)',
                                borderRadius: 'var(--radius-xl)',
                                border: '1px solid var(--border-default)',
                                overflow: 'hidden',
                            }}>
                                {/* Table Header */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '100px 1fr 1fr 120px 100px',
                                    padding: '0.75rem 1rem',
                                    background: 'var(--bg-elevated)',
                                    borderBottom: '1px solid var(--border-default)',
                                    fontSize: '0.7rem', fontWeight: 700,
                                    color: 'var(--text-tertiary)',
                                    textTransform: 'uppercase', letterSpacing: '0.04em',
                                }}>
                                    <span>Token</span>
                                    <span>Citizen</span>
                                    <span>Service</span>
                                    <span>Date</span>
                                    <span>Status</span>
                                </div>

                                {filtered.map((appt, i) => {
                                    const sc = STATUS_META[appt.status] || STATUS_META['Pending'];
                                    return (
                                        <motion.div
                                            key={appt.appointmentId}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.02 }}
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '100px 1fr 1fr 120px 100px',
                                                padding: '0.75rem 1rem',
                                                borderTop: '1px solid var(--border-default)',
                                                fontSize: '0.8rem', alignItems: 'center',
                                            }}
                                        >
                                            <span style={{
                                                background: 'rgba(99,102,241,0.12)', color: '#6366f1',
                                                fontSize: '0.7rem', fontWeight: 800,
                                                padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-md)',
                                                width: 'fit-content',
                                            }}>{appt.tokenNumber}</span>
                                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{appt.name}</span>
                                            <span style={{ color: 'var(--text-secondary)' }}>{appt.service?.name || '—'}</span>
                                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{appt.date}</span>
                                            <span style={{
                                                background: `${sc.color}18`, color: sc.color,
                                                fontSize: '0.65rem', fontWeight: 700,
                                                padding: '0.15rem 0.5rem', borderRadius: 20,
                                                width: 'fit-content',
                                            }}>{appt.status}</span>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default History;
