import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
    QrCode, MapPin, Clock, Calendar, Hash,
    CheckCircle2, AlertCircle, Loader2, Download, Share2
} from 'lucide-react';

// ─── API helper (no auth needed) ──────────────────────────
// VITE_API_URL is e.g. "http://localhost:5000/api"
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function fetchAppointmentPublic(id) {
    const res = await fetch(`${API_BASE}/public/appointment/${id}`, {
        headers: {
            'ngrok-skip-browser-warning': 'true',
            'User-Agent': 'AadhaarQMS-Client'
        }
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
        throw new Error(json.message || 'Appointment not found');
    }
    return json.data;
}

// ─── Status config ────────────────────────────────────────
const STATUS_CONFIG = {
    'Pending': { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', label: 'Pending' },
    'Checked In': { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', label: 'Checked In' },
    'In Progress': { color: '#FF6B2B', bg: 'rgba(255,107,43,0.12)', border: 'rgba(255,107,43,0.25)', label: 'In Progress' },
    'Completed': { color: '#22C55E', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', label: 'Completed' },
    'Cancelled': { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', label: 'Cancelled' },
    'No Show': { color: '#6B7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.25)', label: 'No Show' },
};

// ─── Sub-components ───────────────────────────────────────

const InfoRow = ({ icon: Icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{
            width: '2rem', height: '2rem', borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-elevated)', flexShrink: 0,
        }}>
            <Icon size={14} style={{ color: 'var(--color-accent)' }} />
        </div>
        <div>
            <p style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {label}
            </p>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                {value || '—'}
            </p>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Pending'];
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.3rem 0.85rem', borderRadius: '999px',
            fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.02em',
            background: cfg.bg, color: cfg.color,
            border: `1px solid ${cfg.border}`,
        }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
            {cfg.label}
        </span>
    );
};

// ─── Main Component ───────────────────────────────────────

const ViewQR = () => {
    const [searchParams] = useSearchParams();
    const appointmentId = searchParams.get('id');

    const [state, setState] = useState('loading'); // loading | success | error
    const [data, setData] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!appointmentId) {
            setState('error');
            setErrorMsg('No appointment ID provided in the link.');
            return;
        }

        fetchAppointmentPublic(appointmentId)
            .then((appt) => {
                setData(appt);
                setState('success');
            })
            .catch((err) => {
                setErrorMsg(err.message || 'Could not load appointment.');
                setState('error');
            });
    }, [appointmentId]);

    // ── Download QR as PNG ──────────────────────────────
    const handleDownload = () => {
        const canvas = document.querySelector('#viewqr-canvas canvas');
        if (!canvas) return;
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.download = `AadhaarQMS-${data?.tokenNumber || 'QR'}.png`;
        a.href = url;
        a.click();
    };

    // ── Copy link ───────────────────────────────────────
    const handleShare = async () => {
        const link = window.location.href;
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
        }
    };

    // ── Format helpers ──────────────────────────────────
    const formatDate = (d) => {
        if (!d) return '—';
        const [y, m, day] = d.split('-');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${day} ${months[parseInt(m, 10) - 1]} ${y}`;
    };

    return (
        <div className="page-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>

            {/* Background glow orbs */}
            <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                <div style={{
                    position: 'absolute', width: 500, height: 500, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,107,43,0.08) 0%, transparent 70%)',
                    top: '-15%', right: '-10%',
                }} />
                <div style={{
                    position: 'absolute', width: 400, height: 400, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(26,111,212,0.08) 0%, transparent 70%)',
                    bottom: '-10%', left: '-8%',
                }} />
            </div>

            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 520 }}>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: '1.75rem' }}
                >
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                        padding: '0.4rem 1rem', borderRadius: '999px', marginBottom: '0.75rem',
                        background: 'rgba(255,107,43,0.1)', border: '1px solid rgba(255,107,43,0.2)',
                    }}>
                        <QrCode size={14} style={{ color: 'var(--color-accent)' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Aadhaar Queue Management System
                        </span>
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                        Your Appointment QR
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Show this QR code at the Aadhaar center to check in
                    </p>
                </motion.div>

                <AnimatePresence mode="wait">

                    {/* ── LOADING ── */}
                    {state === 'loading' && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="glass-card"
                            style={{ padding: '4rem 2rem', textAlign: 'center' }}
                        >
                            <Loader2
                                size={40}
                                style={{ color: 'var(--color-accent)', margin: '0 auto 1rem', display: 'block', animation: 'spin 1s linear infinite' }}
                            />
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading your appointment…</p>
                        </motion.div>
                    )}

                    {/* ── ERROR ── */}
                    {state === 'error' && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="glass-card"
                            style={{ padding: '3rem 2rem', textAlign: 'center' }}
                        >
                            <div style={{
                                width: 72, height: 72, borderRadius: '50%', margin: '0 auto 1.25rem',
                                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <AlertCircle size={32} style={{ color: 'var(--color-danger)' }} />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-danger)', marginBottom: '0.6rem' }}>
                                Appointment Not Found
                            </h2>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 320, margin: '0 auto' }}>
                                {errorMsg}
                            </p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '1.5rem' }}>
                                Please check the link in your SMS again, or contact the Aadhaar center.
                            </p>
                        </motion.div>
                    )}

                    {/* ── SUCCESS ── */}
                    {state === 'success' && data && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                        >
                            {/* QR Card */}
                            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>

                                {/* Token + Status */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        <span style={{
                                            fontSize: '1.6rem', fontWeight: 900,
                                            background: 'linear-gradient(135deg, var(--color-accent), #FF9462)',
                                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                        }}>
                                            {data.tokenNumber}
                                        </span>
                                        <StatusBadge status={data.status} />
                                    </div>
                                </div>

                                {/* QR Code */}
                                <motion.div
                                    id="viewqr-canvas"
                                    initial={{ scale: 0.85, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', delay: 0.1, damping: 18 }}
                                    style={{
                                        display: 'inline-flex', padding: '1.25rem',
                                        background: '#ffffff', borderRadius: 'var(--radius-xl)',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                                        marginBottom: '1.25rem',
                                    }}
                                >
                                    <QRCodeSVG
                                        value={data.qrContent || `AQMS:${data.appointmentId}:${data.tokenNumber}:${data.date}`}
                                        size={200}
                                        level="H"
                                        includeMargin={false}
                                    />
                                </motion.div>

                                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>
                                    Scan at the center kiosk or present to the operator
                                </p>

                                {/* Action buttons */}
                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                                    <button
                                        onClick={handleDownload}
                                        className="btn-magnetic"
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-lg)',
                                            background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
                                            border: '1px solid var(--border-default)',
                                            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                        }}
                                    >
                                        <Download size={15} /> Save QR
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="btn-magnetic"
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-lg)',
                                            background: copied ? 'rgba(34,197,94,0.12)' : 'var(--bg-elevated)',
                                            color: copied ? 'var(--color-success)' : 'var(--text-secondary)',
                                            border: copied ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border-default)',
                                            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {copied ? <CheckCircle2 size={15} /> : <Share2 size={15} />}
                                        {copied ? 'Link Copied!' : 'Share Link'}
                                    </button>
                                </div>
                            </div>

                            {/* Details Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="glass-card"
                                style={{ padding: '1.5rem' }}
                            >
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.25rem' }}>
                                    Appointment Details
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.1rem' }}>
                                    <InfoRow icon={Calendar} label="Date" value={formatDate(data.date)} />
                                    <InfoRow icon={Clock} label="Time Slot" value={data.timeSlot} />
                                    {data.center?.name && (
                                        <InfoRow icon={MapPin} label="Center" value={data.center.name} />
                                    )}
                                    {data.service?.name && (
                                        <InfoRow icon={Hash} label="Service" value={data.service.name} />
                                    )}
                                    {data.center?.city && (
                                        <InfoRow icon={MapPin} label="Location" value={`${data.center.city}${data.center.state ? ', ' + data.center.state : ''}`} />
                                    )}
                                    {data.queuePosition && (
                                        <InfoRow icon={Hash} label="Queue Position" value={`#${data.queuePosition}`} />
                                    )}
                                </div>
                            </motion.div>

                            {/* Cancelled / No-Show warning banner */}
                            {['Cancelled', 'No Show'].includes(data.status) && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        padding: '1rem 1.25rem', borderRadius: 'var(--radius-xl)',
                                        background: 'rgba(239,68,68,0.08)',
                                        border: '1px solid rgba(239,68,68,0.2)',
                                        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                                    }}
                                >
                                    <AlertCircle size={18} style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: 2 }} />
                                    <div>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-danger)' }}>
                                            This appointment is {data.status === 'Cancelled' ? 'cancelled' : 'marked as No-Show'}
                                        </p>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                                            This QR code is no longer valid. Please book a new appointment.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Completed success banner */}
                            {data.status === 'Completed' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        padding: '1rem 1.25rem', borderRadius: 'var(--radius-xl)',
                                        background: 'rgba(34,197,94,0.08)',
                                        border: '1px solid rgba(34,197,94,0.2)',
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    }}
                                >
                                    <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
                                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-success)' }}>
                                        Service completed — Thank you for visiting!
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '1.5rem' }}
                >
                    🔒 This is a secure link generated by AadhaarQMS. Do not share with untrusted parties.
                </motion.p>
            </div>
        </div>
    );
};

export default ViewQR;
