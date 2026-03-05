import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarPlus, Calendar, Clock, MapPin, AlertTriangle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import PageHeader from '@components/shared/PageHeader';
import StatCard from '@components/shared/StatCard';
import Button from '@components/ui/Button';
import StatusBadge from '@components/ui/StatusBadge';
import { PageLoader } from '@components/ui/Loader';
import EmptyState from '@components/ui/EmptyState';
import useAuthStore from '@store/authStore';
import { appointmentsAPI } from '@services/api';
import { getGreeting, formatDate, formatTimeSlot } from '@utils/helpers';

const CitizenDashboard = () => {
    const { user } = useAuthStore();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const upcoming = appointments.filter((a) => ['Pending', 'Checked In', 'In Progress'].includes(a.status));
    const completed = appointments.filter((a) => a.status === 'Completed');
    const cancelled = appointments.filter((a) => a.status === 'Cancelled');

    if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <PageHeader
                    title={`${getGreeting()}, ${user?.name?.split(' ')[0]}!`}
                    description="Manage your Aadhaar appointments from here."
                    action={<Link to="/citizen/book"><Button icon={CalendarPlus}>Book Appointment</Button></Link>}
                />

                {/* Blocked warning */}
                {user?.isBlocked && (
                    <div
                        style={{
                            padding: '1rem 1.25rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.25)',
                            borderRadius: 'var(--radius-xl)',
                        }}
                    >
                        <AlertTriangle size={20} className="shrink-0" style={{ color: 'var(--color-danger)', marginTop: '0.125rem' }} />
                        <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-danger)' }}>Account Temporarily Blocked</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                Due to multiple no-shows, booking is restricted until {formatDate(user.blockedUntil)}.
                            </p>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem',
                    }}
                >
                    <StatCard icon={Clock} label="Upcoming" value={upcoming.length} />
                    <StatCard icon={Calendar} label="Completed" value={completed.length} />
                    <StatCard icon={MapPin} label="Cancelled" value={cancelled.length} />
                </div>

                {/* Upcoming Appointments */}
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        Upcoming Appointments
                    </h2>
                    {upcoming.length === 0 ? (
                        <div
                            style={{
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-default)',
                                borderRadius: 'var(--radius-2xl)',
                            }}
                        >
                            <EmptyState
                                icon={Calendar}
                                title="No upcoming appointments"
                                description="Book your first Aadhaar appointment to get started."
                                action={<Link to="/citizen/book"><Button size="sm" icon={CalendarPlus}>Book Now</Button></Link>}
                            />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {upcoming.map((appt, i) => (
                                <motion.div key={appt.appointmentId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                    <Link to={`/citizen/appointments/${appt.appointmentId}`}>
                                        <div
                                            className="card-lift"
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
                                                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{appt.service?.name || 'Service'}</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                        {appt.center?.name} · {formatDate(appt.date)} · {formatTimeSlot(appt.timeSlot)}
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Queue #{appt.queuePosition}</span>
                                                    <ArrowRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent History */}
                {(completed.length > 0 || cancelled.length > 0) && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent History</h2>
                            <Link to="/citizen/appointments"><Button variant="ghost" size="sm">View All</Button></Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {[...completed, ...cancelled].slice(0, 5).map((appt) => (
                                <Link key={appt.appointmentId} to={`/citizen/appointments/${appt.appointmentId}`}>
                                    <div
                                        className="transition-colors"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0.85rem 1.25rem',
                                            background: 'var(--bg-surface)',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: 'var(--radius-lg)',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{appt.tokenNumber}</span>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>{appt.service?.name}</span>
                                        </div>
                                        <StatusBadge status={appt.status} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </DashboardLayout>
    );
};

export default CitizenDashboard;
