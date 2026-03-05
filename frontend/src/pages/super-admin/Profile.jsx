import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, Calendar, Lock, Eye, EyeOff, Check, AlertTriangle, KeyRound, Fingerprint } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import PageHeader from '@components/shared/PageHeader';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import { passwordAPI } from '@services/api';
import useAuthStore from '@store/authStore';
import { formatDate, getInitials } from '@utils/helpers';

const fadeUp = (i = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: i * 0.06 },
});

const SuperAdminProfile = () => {
    const { user } = useAuthStore();
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [saving, setSaving] = useState(false);

    const getPasswordStrength = (pw) => {
        if (!pw) return { level: 0, label: '', color: '#475569' };
        let score = 0;
        if (pw.length >= 8) score++;
        if (pw.length >= 12) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        if (score <= 1) return { level: 1, label: 'Weak', color: '#ef4444' };
        if (score <= 2) return { level: 2, label: 'Fair', color: '#f59e0b' };
        if (score <= 3) return { level: 3, label: 'Good', color: '#3b82f6' };
        return { level: 4, label: 'Strong', color: '#10b981' };
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) { toast.error('New passwords do not match'); return; }
        if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
        setSaving(true);
        try {
            await passwordAPI.change({ currentPassword, newPassword });
            toast.success('Password changed successfully!');
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
            setShowPasswordForm(false);
        } catch (err) { toast.error(err.message || 'Failed to change password'); }
        finally { setSaving(false); }
    };

    const strength = getPasswordStrength(newPassword);

    const profileFields = [
        { icon: User, label: 'Full Name', value: user?.name, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
        { icon: Mail, label: 'Email Address', value: user?.email, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
        { icon: Shield, label: 'Role', value: 'Super Administrator', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
        { icon: Calendar, label: 'Member Since', value: user?.createdAt ? formatDate(user.createdAt) : 'N/A', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    ];

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem 0' }}>
                <motion.div {...fadeUp(0)}>
                    <PageHeader title="Admin Profile" description="Manage your account & security" />
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    {/* ── Hero Profile Card ── */}
                    <motion.div {...fadeUp(1)}>
                        <div style={{
                            borderRadius: 'var(--radius-2xl)',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-default)',
                            boxShadow: 'var(--shadow-sm)',
                            overflow: 'hidden',
                        }}>
                            {/* Gradient Banner */}
                            <div style={{
                                height: '100px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #a78bfa 70%, #3b82f6 100%)',
                                position: 'relative',
                            }}>
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)',
                                }} />
                            </div>

                            <div style={{ padding: '0 2rem 2rem', position: 'relative' }}>
                                {/* Avatar */}
                                <div style={{
                                    width: '5.5rem', height: '5.5rem', borderRadius: 'var(--radius-2xl)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    boxShadow: '0 8px 32px rgba(99,102,241,0.35), 0 0 0 4px var(--bg-surface)',
                                    marginTop: '-2.75rem', position: 'relative', zIndex: 2,
                                }}>
                                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
                                        {getInitials(user?.name || 'SA')}
                                    </span>
                                </div>

                                {/* Name + Role badge */}
                                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                        {user?.name || 'Super Admin'}
                                    </h2>
                                    <span style={{
                                        fontSize: '0.6875rem', fontWeight: 700,
                                        padding: '0.3rem 0.75rem', borderRadius: '99px',
                                        background: 'rgba(99,102,241,0.12)', color: '#818cf8',
                                        border: '1px solid rgba(99,102,241,0.25)',
                                        letterSpacing: '0.06em', textTransform: 'uppercase',
                                    }}>
                                        Super Admin
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                                    {user?.email || 'admin@aadhaarqms.com'}
                                </p>

                                {/* Quick Stats */}
                                <div style={{
                                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                    gap: '0.75rem', marginTop: '1.5rem',
                                }}>
                                    {[
                                        { icon: Fingerprint, label: 'Admin Level', value: 'Super', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
                                        { icon: Shield, label: 'Status', value: 'Active', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                                        { icon: KeyRound, label: 'Access', value: 'Full', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                                    ].map((stat) => (
                                        <div
                                            key={stat.label}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                padding: '0.75rem 1rem', borderRadius: 'var(--radius-xl)',
                                                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                                            }}
                                        >
                                            <div style={{
                                                width: '2rem', height: '2rem', borderRadius: 'var(--radius-md)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: stat.bg,
                                            }}>
                                                <stat.icon size={14} style={{ color: stat.color }} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', lineHeight: 1 }}>{stat.label}</p>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{stat.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Two-column: Account Info + Security ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
                        {/* Account Details */}
                        <motion.div {...fadeUp(2)}>
                            <Card>
                                <Card.Header>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                        <div style={{
                                            width: '2rem', height: '2rem', borderRadius: 'var(--radius-md)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: 'rgba(99,102,241,0.1)',
                                        }}>
                                            <User size={14} style={{ color: '#6366f1' }} />
                                        </div>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Account Information</h3>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {profileFields.map((item) => (
                                            <div
                                                key={item.label}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                                                    padding: '0.875rem 1rem', borderRadius: 'var(--radius-lg)',
                                                    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                                                }}
                                            >
                                                <div style={{
                                                    width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-md)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: item.bg, flexShrink: 0,
                                                }}>
                                                    <item.icon size={15} style={{ color: item.color }} />
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <p style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</p>
                                                    <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value || '—'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card.Body>
                            </Card>
                        </motion.div>

                        {/* Security */}
                        <motion.div {...fadeUp(3)}>
                            <Card>
                                <Card.Header>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                            <div style={{
                                                width: '2rem', height: '2rem', borderRadius: 'var(--radius-md)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: 'rgba(245,158,11,0.1)',
                                            }}>
                                                <Lock size={14} style={{ color: '#f59e0b' }} />
                                            </div>
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Security</h3>
                                        </div>
                                        {!showPasswordForm && (
                                            <Button size="sm" variant="secondary" icon={Lock} onClick={() => setShowPasswordForm(true)}>
                                                Change Password
                                            </Button>
                                        )}
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <AnimatePresence mode="wait">
                                        {showPasswordForm ? (
                                            <motion.form
                                                key="form"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                onSubmit={handleChangePassword}
                                                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                                            >
                                                <PasswordField
                                                    label="Current Password"
                                                    value={currentPassword}
                                                    onChange={setCurrentPassword}
                                                    show={showCurrent}
                                                    onToggle={() => setShowCurrent(!showCurrent)}
                                                    placeholder="Enter your current password"
                                                />

                                                <PasswordField
                                                    label="New Password"
                                                    value={newPassword}
                                                    onChange={setNewPassword}
                                                    show={showNew}
                                                    onToggle={() => setShowNew(!showNew)}
                                                    placeholder="Enter new password (min 8 chars)"
                                                />

                                                {/* Strength Indicator */}
                                                {newPassword && (
                                                    <div>
                                                        <div style={{ display: 'flex', gap: '4px', marginBottom: '0.375rem' }}>
                                                            {[1, 2, 3, 4].map((i) => (
                                                                <div
                                                                    key={i}
                                                                    style={{
                                                                        height: '5px', flex: 1, borderRadius: '99px',
                                                                        background: i <= strength.level ? strength.color : 'var(--bg-elevated)',
                                                                        transition: 'background 0.3s ease',
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: strength.color }}>{strength.label}</p>
                                                    </div>
                                                )}

                                                <PasswordField
                                                    label="Confirm New Password"
                                                    value={confirmPassword}
                                                    onChange={setConfirmPassword}
                                                    show={showConfirm}
                                                    onToggle={() => setShowConfirm(!showConfirm)}
                                                    placeholder="Re-enter new password"
                                                />

                                                {confirmPassword && newPassword !== confirmPassword && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                        <AlertTriangle size={13} style={{ color: '#ef4444' }} />
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#ef4444' }}>Passwords do not match</span>
                                                    </div>
                                                )}

                                                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        onClick={() => {
                                                            setShowPasswordForm(false);
                                                            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        loading={saving}
                                                        disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
                                                        icon={Check}
                                                    >
                                                        Update Password
                                                    </Button>
                                                </div>
                                            </motion.form>
                                        ) : (
                                            <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                <div style={{
                                                    display: 'flex', flexDirection: 'column', gap: '0.75rem',
                                                }}>
                                                    <div style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.875rem',
                                                        padding: '0.875rem 1rem', borderRadius: 'var(--radius-lg)',
                                                        background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                                                    }}>
                                                        <div style={{
                                                            width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-md)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            background: 'rgba(16,185,129,0.1)',
                                                        }}>
                                                            <Shield size={15} style={{ color: '#10b981' }} />
                                                        </div>
                                                        <div>
                                                            <p style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Password Status</p>
                                                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Password set — keep it strong and unique</p>
                                                        </div>
                                                    </div>

                                                    <div style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.875rem',
                                                        padding: '0.875rem 1rem', borderRadius: 'var(--radius-lg)',
                                                        background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                                                    }}>
                                                        <div style={{
                                                            width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-md)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            background: 'rgba(99,102,241,0.1)',
                                                        }}>
                                                            <Fingerprint size={15} style={{ color: '#6366f1' }} />
                                                        </div>
                                                        <div>
                                                            <p style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Two-Factor Auth</p>
                                                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Not configured</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

/* ── Sub-component ── */
const PasswordField = ({ label, value, onChange, show, onToggle, placeholder }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</label>
        <div style={{ position: 'relative' }}>
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required
                style={{ paddingRight: '2.75rem' }}
            />
            <button
                type="button"
                onClick={onToggle}
                style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer',
                    padding: 0, display: 'flex',
                }}
            >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    </div>
);

export default SuperAdminProfile;
