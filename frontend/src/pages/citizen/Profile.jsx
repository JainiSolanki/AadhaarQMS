import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, Shield, Calendar, Edit3, Save, X, Lock,
    Eye, EyeOff, CheckCircle2, AlertCircle, ChevronRight, Clock, Hash, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import PageHeader from '@components/shared/PageHeader';
import Button from '@components/ui/Button';
import { authAPI, passwordAPI } from '@services/api';
import useAuthStore from '@store/authStore';
import { getInitials, formatDate } from '@utils/helpers';

const Profile = () => {
    const { user, updateUser } = useAuthStore();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Edit mode
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [saving, setSaving] = useState(false);

    // Password
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [changingPw, setChangingPw] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await authAPI.getProfile();
            setProfile(res.data);
            setEditName(res.data.name || '');
            setEditPhone(res.data.phone || '');
        } catch (err) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!editName.trim() || editName.trim().length < 2) {
            toast.error('Name must be at least 2 characters');
            return;
        }
        setSaving(true);
        try {
            await authAPI.updateProfile({ name: editName.trim(), phone: editPhone.trim() });
            updateUser({ name: editName.trim(), phone: editPhone.trim() });
            setProfile((p) => ({ ...p, name: editName.trim(), phone: editPhone.trim() }));
            setEditing(false);
            toast.success('Profile updated!');
        } catch (err) {
            toast.error(err.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword) { toast.error('Enter current password'); return; }
        if (newPassword.length < 8) { toast.error('New password must be at least 8 characters'); return; }
        if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }

        setChangingPw(true);
        try {
            await passwordAPI.change({ currentPassword, newPassword });
            toast.success('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordSection(false);
        } catch (err) {
            toast.error(err.message || 'Password change failed');
        } finally {
            setChangingPw(false);
        }
    };

    const cancelEdit = () => {
        setEditing(false);
        setEditName(profile?.name || '');
        setEditPhone(profile?.phone || '');
    };

    // Password strength
    const getPasswordStrength = (pw) => {
        if (!pw) return { level: 0, label: '', color: '' };
        let score = 0;
        if (pw.length >= 8) score++;
        if (pw.length >= 12) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        if (score <= 1) return { level: 1, label: 'Weak', color: 'var(--color-danger)' };
        if (score <= 3) return { level: 2, label: 'Medium', color: 'var(--color-warning)' };
        return { level: 3, label: 'Strong', color: 'var(--color-success)' };
    };

    const pwStrength = getPasswordStrength(newPassword);

    if (loading) {
        return (
            <DashboardLayout>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                    <div className="animate-spin" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', border: '3px solid var(--color-accent)', borderTopColor: 'transparent' }} />
                </div>
            </DashboardLayout>
        );
    }

    const isBlocked = profile?.blockedUntil && new Date(profile.blockedUntil) > new Date();

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <PageHeader title="My Profile" description="View and manage your personal information." />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>

                    {/* ── Profile Header Card ── */}
                    <div
                        style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-2xl)',
                            padding: '2rem',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                            {/* Avatar */}
                            <div style={{ position: 'relative' }}>
                                <div
                                    style={{
                                        width: '5rem',
                                        height: '5rem',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'var(--color-accent)',
                                        boxShadow: '0 0 0 3px var(--bg-surface), 0 0 0 5px var(--color-accent)',
                                        flexShrink: 0,
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '0.02em' }}>
                                        {getInitials(profile?.name)}
                                    </span>
                                </div>
                                {/* Online dot */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: '2px',
                                        right: '2px',
                                        width: '14px',
                                        height: '14px',
                                        borderRadius: '50%',
                                        background: 'var(--color-success)',
                                        border: '3px solid var(--bg-surface)',
                                    }}
                                />
                            </div>

                            {/* Name & meta */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                                    {profile?.name}
                                </h2>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.6rem' }}>
                                    {profile?.email}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <span
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.3rem',
                                            padding: '0.2rem 0.6rem',
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em',
                                            borderRadius: '999px',
                                            background: 'rgba(255, 107, 43, 0.12)',
                                            color: 'var(--color-accent)',
                                        }}
                                    >
                                        <Shield size={11} />
                                        {profile?.role?.replace('_', ' ')}
                                    </span>
                                    {profile?.createdAt && (
                                        <span
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.3rem',
                                                padding: '0.2rem 0.6rem',
                                                fontSize: '0.65rem',
                                                fontWeight: 600,
                                                borderRadius: '999px',
                                                background: 'var(--bg-elevated)',
                                                color: 'var(--text-tertiary)',
                                            }}
                                        >
                                            <Clock size={11} />
                                            Member since {formatDate(profile.createdAt)}
                                        </span>
                                    )}
                                    {isBlocked && (
                                        <span
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.3rem',
                                                padding: '0.2rem 0.6rem',
                                                fontSize: '0.65rem',
                                                fontWeight: 700,
                                                borderRadius: '999px',
                                                background: 'rgba(239, 68, 68, 0.12)',
                                                color: 'var(--color-danger)',
                                            }}
                                        >
                                            <AlertTriangle size={11} />
                                            Account Restricted
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Edit button */}
                            {!editing && (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    icon={Edit3}
                                    onClick={() => setEditing(true)}
                                >
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </div>


                    {/* ── Quick Stats Strip ── */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: '0.75rem',
                        }}
                    >
                        <QuickStat icon={Hash} label="User ID" value={profile?.userId?.slice(-8) || '—'} />
                        <QuickStat icon={Shield} label="Account Status" value={isBlocked ? 'Restricted' : 'Active'} valueColor={isBlocked ? 'var(--color-danger)' : 'var(--color-success)'} />
                        <QuickStat icon={AlertTriangle} label="No-Shows" value={profile?.noShowCount ?? 0} valueColor={profile?.noShowCount > 0 ? 'var(--color-warning)' : 'var(--text-primary)'} />
                    </div>


                    {/* ── Personal Information ── */}
                    <div
                        style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-2xl)',
                            padding: '1.75rem 2rem',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Personal Information</h3>
                            <AnimatePresence>
                                {editing && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        style={{ display: 'flex', gap: '0.5rem' }}
                                    >
                                        <Button size="sm" variant="secondary" icon={X} onClick={cancelEdit}>Cancel</Button>
                                        <Button size="sm" icon={Save} loading={saving} onClick={handleSaveProfile}>Save Changes</Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                            <InfoField
                                icon={User}
                                label="Full Name"
                                editing={editing}
                                value={profile?.name}
                                editValue={editName}
                                onChange={setEditName}
                                placeholder="Your full name"
                            />
                            <InfoField
                                icon={Mail}
                                label="Email Address"
                                value={profile?.email}
                                editing={false}
                                readOnly
                                badge="Verified"
                            />
                            <InfoField
                                icon={Phone}
                                label="Phone Number"
                                editing={editing}
                                value={profile?.phone || 'Not set'}
                                editValue={editPhone}
                                onChange={setEditPhone}
                                placeholder="10-digit phone number"
                                maxLength={10}
                            />
                            <InfoField
                                icon={Calendar}
                                label="Account Created"
                                value={profile?.createdAt ? formatDate(profile.createdAt) : '—'}
                            />
                        </div>
                    </div>


                    {/* ── Security / Change Password ── */}
                    <div
                        style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-2xl)',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Accordion header */}
                        <button
                            onClick={() => setShowPasswordSection(!showPasswordSection)}
                            className="transition-colors"
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1.25rem 2rem',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-primary)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                <div
                                    style={{
                                        width: '2.5rem',
                                        height: '2.5rem',
                                        borderRadius: 'var(--radius-xl)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'var(--bg-elevated)',
                                        border: '1px solid var(--border-subtle)',
                                    }}
                                >
                                    <Lock size={17} style={{ color: 'var(--color-accent)' }} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ fontSize: '0.95rem', fontWeight: 700 }}>Change Password</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>Update your password to keep your account secure</p>
                                </div>
                            </div>
                            <motion.div
                                animate={{ rotate: showPasswordSection ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {showPasswordSection && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div style={{ padding: '0 2rem 2rem', borderTop: '1px solid var(--border-subtle)' }}>
                                        <div style={{ maxWidth: '420px', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>

                                            <PasswordInput
                                                label="Current Password"
                                                value={currentPassword}
                                                onChange={setCurrentPassword}
                                                show={showCurrentPw}
                                                onToggle={() => setShowCurrentPw(!showCurrentPw)}
                                                placeholder="Enter current password"
                                            />

                                            <div>
                                                <PasswordInput
                                                    label="New Password"
                                                    value={newPassword}
                                                    onChange={setNewPassword}
                                                    show={showNewPw}
                                                    onToggle={() => setShowNewPw(!showNewPw)}
                                                    placeholder="At least 8 characters"
                                                />
                                                {newPassword && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        style={{ marginTop: '0.5rem' }}
                                                    >
                                                        <div style={{ display: 'flex', gap: '4px', marginBottom: '0.3rem' }}>
                                                            {[1, 2, 3].map((bar) => (
                                                                <div
                                                                    key={bar}
                                                                    style={{
                                                                        flex: 1,
                                                                        height: '3px',
                                                                        borderRadius: '999px',
                                                                        transition: 'background 0.3s',
                                                                        background: bar <= pwStrength.level ? pwStrength.color : 'var(--bg-elevated)',
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <p style={{ fontSize: '0.675rem', fontWeight: 600, color: pwStrength.color }}>{pwStrength.label}</p>
                                                    </motion.div>
                                                )}
                                            </div>

                                            <div>
                                                <PasswordInput
                                                    label="Confirm New Password"
                                                    value={confirmPassword}
                                                    onChange={setConfirmPassword}
                                                    show={showConfirmPw}
                                                    onToggle={() => setShowConfirmPw(!showConfirmPw)}
                                                    placeholder="Re-enter new password"
                                                />
                                                {confirmPassword && newPassword && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.4rem' }}>
                                                        {confirmPassword === newPassword ? (
                                                            <>
                                                                <CheckCircle2 size={13} style={{ color: 'var(--color-success)' }} />
                                                                <span style={{ fontSize: '0.675rem', fontWeight: 600, color: 'var(--color-success)' }}>Passwords match</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <AlertCircle size={13} style={{ color: 'var(--color-danger)' }} />
                                                                <span style={{ fontSize: '0.675rem', fontWeight: 600, color: 'var(--color-danger)' }}>Passwords do not match</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ paddingTop: '0.35rem' }}>
                                                <Button
                                                    icon={Lock}
                                                    loading={changingPw}
                                                    onClick={handleChangePassword}
                                                    disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
                                                >
                                                    Update Password
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </motion.div>
        </DashboardLayout>
    );
};


/* ─────────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────────── */

const QuickStat = ({ icon: Icon, label, value, valueColor }) => (
    <div
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.15rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
        }}
    >
        <div
            style={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-elevated)',
                flexShrink: 0,
            }}
        >
            <Icon size={15} style={{ color: 'var(--color-accent)' }} />
        </div>
        <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: valueColor || 'var(--text-primary)', marginTop: '0.1rem' }}>{value}</p>
        </div>
    </div>
);


const InfoField = ({ icon: Icon, label, value, editing, editValue, onChange, placeholder, maxLength, readOnly, badge }) => (
    <div
        style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
            padding: '1rem 1.15rem',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            transition: 'border-color 0.2s',
        }}
    >
        <div
            style={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                flexShrink: 0,
                marginTop: '0.1rem',
            }}
        >
            <Icon size={15} style={{ color: 'var(--color-accent)' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                {label}
            </p>
            {editing && !readOnly ? (
                <input
                    type="text"
                    value={editValue}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    style={{
                        width: '100%',
                        padding: '0.4rem 0.65rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        background: 'var(--bg-surface)',
                        border: '1.5px solid var(--color-accent)',
                        borderRadius: 'var(--radius-md)',
                        outline: 'none',
                    }}
                />
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <p
                        style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: value && value !== 'Not set' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                            fontStyle: value === 'Not set' ? 'italic' : 'normal',
                        }}
                    >
                        {value}
                    </p>
                    {badge && (
                        <span
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                padding: '0.1rem 0.4rem',
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                borderRadius: '999px',
                                background: 'rgba(34, 197, 94, 0.12)',
                                color: 'var(--color-success)',
                            }}
                        >
                            <CheckCircle2 size={9} />
                            {badge}
                        </span>
                    )}
                </div>
            )}
        </div>
    </div>
);


const PasswordInput = ({ label, value, onChange, show, onToggle, placeholder }) => (
    <div>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            {label}
        </label>
        <div style={{ position: 'relative' }}>
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: '100%',
                    padding: '0.6rem 2.5rem 0.6rem 0.85rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-lg)',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
            />
            <button
                type="button"
                onClick={onToggle}
                style={{
                    position: 'absolute',
                    right: '0.6rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-tertiary)',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    </div>
);


export default Profile;
