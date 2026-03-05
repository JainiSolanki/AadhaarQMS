import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, MapPin, Clock, FileText, User, Hash, XCircle, Calendar, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import Modal from '@components/ui/Modal';
import StatusBadge from '@components/ui/StatusBadge';
import { PageLoader } from '@components/ui/Loader';
import { appointmentsAPI, queueAPI } from '@services/api';
import { formatDate, formatTimeSlot } from '@utils/helpers';

const AppointmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    useEffect(() => { fetchAppointment(); }, [id]);

    const fetchAppointment = async () => {
        try {
            const res = await appointmentsAPI.getById(id);
            setAppointment(res.data);
            if (['Pending', 'Checked In', 'In Progress'].includes(res.data.status)) {
                try { const posRes = await queueAPI.getMyPosition(id); setPosition(posRes.data); } catch { /* ignore */ }
            }
        } catch (err) {
            toast.error('Failed to load appointment');
            navigate('/citizen/appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => setShowCancelModal(true);

    const confirmCancel = async () => {
        setCancelling(true);
        try {
            await appointmentsAPI.cancel(id);
            toast.success('Appointment cancelled');
            setShowCancelModal(false);
            fetchAppointment();
        } catch (err) {
            toast.error(err.message || 'Cannot cancel');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;
    if (!appointment) return null;

    const a = appointment;
    const canCancel = ['Pending', 'Checked In'].includes(a.status);

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <button
                    onClick={() => navigate(-1)}
                    className="cursor-pointer transition-colors"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'var(--text-secondary)',
                        marginBottom: '1.5rem',
                        background: 'transparent',
                        border: 'none',
                        padding: '0.35rem 0',
                    }}
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div
                    className="detail-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '1.5rem',
                    }}
                >
                    {/* Main Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <Card>
                            <Card.Header>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-accent)' }}>{a.tokenNumber}</span>
                                        <StatusBadge status={a.status} />
                                    </div>
                                    {canCancel && (
                                        <Button variant="danger" size="sm" icon={XCircle} loading={cancelling} onClick={handleCancel}>Cancel</Button>
                                    )}
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                        gap: '1.25rem',
                                    }}
                                >
                                    <InfoRow icon={FileText} label="Service" value={a.service?.name} />
                                    <InfoRow icon={MapPin} label="Center" value={a.center?.name} />
                                    <InfoRow icon={Calendar} label="Date" value={formatDate(a.date)} />
                                    <InfoRow icon={Clock} label="Time Slot" value={formatTimeSlot(a.timeSlot)} />
                                    <InfoRow icon={User} label="Name" value={a.name} />
                                    <InfoRow icon={Hash} label="Queue Position" value={`#${a.queuePosition}`} />
                                </div>
                                {a.center?.address && (
                                    <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
                                        <InfoRow icon={MapPin} label="Full Address" value={`${a.center.address}, ${a.center.city}, ${a.center.state} - ${a.center.pincode}`} />
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {/* Queue Position */}
                        {position && (
                            <Card>
                                <Card.Header>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Live Queue Status</h3>
                                </Card.Header>
                                <Card.Body>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                            gap: '1rem',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <QueueStat value={position.position} label="Your Position" color="var(--color-accent)" />
                                        <QueueStat value={position.totalInQueue} label="Total in Queue" color="var(--text-primary)" />
                                        <QueueStat value={position.currentServing || '—'} label="Now Serving" color="var(--color-success)" />
                                        <QueueStat value={`${position.estimatedWaitMinutes} min`} label="Est. Wait" color="var(--color-warning)" />
                                    </div>
                                </Card.Body>
                            </Card>
                        )}
                    </div>

                    {/* QR Code */}
                    <div>
                        <Card>
                            <Card.Body>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Your E-Token</p>
                                    <div
                                        style={{
                                            padding: '1.25rem',
                                            background: '#ffffff',
                                            borderRadius: 'var(--radius-xl)',
                                            display: 'inline-flex',
                                        }}
                                    >
                                        <QRCodeSVG
                                            value={JSON.stringify({
                                                appointmentId: a.appointmentId,
                                                tokenNumber: a.tokenNumber,
                                                date: a.date,
                                                timeSlot: a.timeSlot,
                                            })}
                                            size={180}
                                            level="H"
                                        />
                                    </div>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-accent)', marginTop: '1rem' }}>{a.tokenNumber}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>Show this QR at the center</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </motion.div>

            {/* Cancel Confirmation Modal */}
            <Modal isOpen={showCancelModal} onClose={() => !cancelling && setShowCancelModal(false)} title="Cancel Appointment">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
                    <div
                        style={{
                            width: '3.5rem',
                            height: '3.5rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(239, 68, 68, 0.12)',
                        }}
                    >
                        <AlertTriangle size={24} style={{ color: 'var(--color-danger)' }} />
                    </div>
                    <div>
                        <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                            Are you sure?
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', maxWidth: '22rem', lineHeight: 1.6 }}>
                            This action cannot be undone. Your appointment <strong style={{ color: 'var(--color-accent)' }}>{a.tokenNumber}</strong> will be cancelled and your slot will be released.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', width: '100%' }}>
                        <Button
                            variant="secondary"
                            onClick={() => setShowCancelModal(false)}
                            disabled={cancelling}
                            style={{ flex: 1 }}
                        >
                            Go Back
                        </Button>
                        <Button
                            variant="danger"
                            icon={XCircle}
                            loading={cancelling}
                            onClick={confirmCancel}
                            style={{ flex: 1 }}
                        >
                            Confirm Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
};

const InfoRow = ({ icon: Icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div
            style={{
                width: '2rem',
                height: '2rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-elevated)',
                flexShrink: 0,
            }}
        >
            <Icon size={14} style={{ color: 'var(--text-tertiary)' }} />
        </div>
        <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>{value || '—'}</p>
        </div>
    </div>
);

const QueueStat = ({ value, label, color }) => (
    <div
        style={{
            padding: '1rem',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-lg)',
        }}
    >
        <p style={{ fontSize: '1.75rem', fontWeight: 800, color, lineHeight: 1.1 }}>{value}</p>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    </div>
);

export default AppointmentDetail;
