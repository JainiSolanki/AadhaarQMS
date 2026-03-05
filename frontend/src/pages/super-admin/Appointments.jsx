import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Search, Filter, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import PageHeader from '@components/shared/PageHeader';
import Card from '@components/ui/Card';
import { PageLoader } from '@components/ui/Loader';
import EmptyState from '@components/ui/EmptyState';
import { adminAPI } from '@services/api';

const STATUS_COLORS = {
    Pending: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
    'Checked In': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: 'rgba(59,130,246,0.25)' },
    'In Progress': { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6', border: 'rgba(139,92,246,0.25)' },
    Completed: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.25)' },
    'No-Show': { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.25)' },
    Cancelled: { bg: 'rgba(107,114,128,0.12)', color: '#6b7280', border: 'rgba(107,114,128,0.25)' },
};

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

const SuperAdminAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => { fetchAppointments(); }, []);

    const fetchAppointments = async () => {
        try {
            const res = await adminAPI.getAppointments();
            setAppointments(res.data || []);
        } catch {
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const filtered = appointments
        .filter((a) => {
            if (statusFilter && a.status !== statusFilter) return false;
            if (dateFilter && a.date !== dateFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                return (
                    a.name?.toLowerCase().includes(q) ||
                    a.tokenNumber?.toString().includes(q) ||
                    a.appointmentId?.toLowerCase().includes(q)
                );
            }
            return true;
        })
        .sort((a, b) => {
            if (a.date !== b.date) return b.date?.localeCompare(a.date);
            return (a.timeSlot || '').localeCompare(b.timeSlot || '');
        });

    if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

    const statuses = [...new Set(appointments.map((a) => a.status).filter(Boolean))];

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem 0' }}>
                <motion.div {...fadeUp}>
                    <PageHeader title="All Appointments" description={`${appointments.length} total appointments`} />
                </motion.div>

                {/* ── Filters ── */}
                <motion.div {...fadeUp} transition={{ delay: 0.1 }}
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}
                >
                    <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '360px' }}>
                        <Search size={16} style={{
                            position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                            color: 'var(--text-tertiary)',
                        }} />
                        <input
                            type="text" placeholder="Search by name, token, ID…"
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                    <div style={{ position: 'relative', minWidth: '150px' }}>
                        <Filter size={14} style={{
                            position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                            color: 'var(--text-tertiary)',
                        }} />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ paddingLeft: '2.25rem' }}>
                            <option value="">All Status</option>
                            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <input
                        type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
                        style={{ minWidth: '150px' }}
                    />
                </motion.div>

                {/* ── Table ── */}
                {filtered.length === 0 ? (
                    <EmptyState icon={CalendarDays} title="No appointments found" description="No appointments match your filters." />
                ) : (
                    <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
                        <Card>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                                            {['Token', 'Citizen', 'Date', 'Time Slot', 'Service', 'Status', 'Center'].map((h) => (
                                                <th
                                                    key={h}
                                                    style={{
                                                        textAlign: 'left',
                                                        padding: '0.875rem 1.25rem',
                                                        fontSize: '0.6875rem',
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.08em',
                                                        color: 'var(--text-tertiary)',
                                                    }}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.slice(0, 100).map((a, i) => {
                                            const badge = STATUS_COLORS[a.status] || { bg: 'rgba(100,100,100,0.12)', color: '#64748b', border: 'rgba(100,100,100,0.25)' };
                                            return (
                                                <tr
                                                    key={a.appointmentId || i}
                                                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                                                >
                                                    <td style={{ padding: '0.75rem 1.25rem' }}>
                                                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                                                            #{a.tokenNumber || '—'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1.25rem' }}>
                                                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{a.name || '—'}</p>
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>{a.phone || a.email || ''}</p>
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                                        {a.date}
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                                        {a.timeSlot || '—'}
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                                        {a.serviceId || '—'}
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1.25rem' }}>
                                                        <span style={{
                                                            display: 'inline-block',
                                                            fontSize: '0.6875rem', fontWeight: 600,
                                                            padding: '0.25rem 0.625rem', borderRadius: '99px',
                                                            background: badge.bg, color: badge.color,
                                                            border: `1px solid ${badge.border}`,
                                                        }}>
                                                            {a.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                        {a.centerId?.slice(0, 10) || '—'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {filtered.length > 100 && (
                                <div style={{
                                    padding: '0.75rem', textAlign: 'center',
                                    fontSize: '0.75rem', color: 'var(--text-tertiary)',
                                    borderTop: '1px solid var(--border-subtle)',
                                }}>
                                    Showing first 100 of {filtered.length} results
                                </div>
                            )}
                        </Card>
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default SuperAdminAppointments;
