import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Shield, Building2, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import PageHeader from '@components/shared/PageHeader';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Modal from '@components/ui/Modal';
import { PageLoader } from '@components/ui/Loader';
import EmptyState from '@components/ui/EmptyState';
import { adminAPI, centersAPI } from '@services/api';

const fadeUp = (i = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: i * 0.05 },
});

const ManageCenterAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [adminsRes, centersRes] = await Promise.all([
                adminAPI.getAllAdmins(),
                adminAPI.getAllCenters(),
            ]);
            setAdmins((adminsRes.data || []).filter((a) => a.role === 'CENTER_ADMIN'));
            setCenters(centersRes.data || []);
        } catch { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    };

    const getCenterName = (centerId) => {
        const c = centers.find((c) => c.centerId === centerId);
        return c ? c.name : centerId || '—';
    };

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            await adminAPI.createCenterAdmin(data);
            toast.success('Center Admin created');
            setShowModal(false);
            reset();
            fetchData();
        } catch (err) { toast.error(err.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem 0' }}>
                <motion.div {...fadeUp(0)}>
                    <PageHeader title="Center Admins" description={`${admins.length} center admins`}
                        action={<Button icon={UserPlus} onClick={() => { reset(); setShowModal(true); }}>Add Center Admin</Button>} />
                </motion.div>

                {admins.length === 0 ? (
                    <EmptyState icon={Shield} title="No center admins" description="Create your first center admin."
                        action={<Button size="sm" icon={UserPlus} onClick={() => setShowModal(true)}>Add Admin</Button>} />
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                        {admins.map((admin, i) => (
                            <motion.div key={admin.adminId} {...fadeUp(i + 1)}>
                                <div
                                    className="card-lift"
                                    style={{
                                        borderRadius: 'var(--radius-2xl)',
                                        background: 'var(--bg-surface)',
                                        border: '1px solid var(--border-default)',
                                        boxShadow: 'var(--shadow-sm)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div style={{
                                        height: '3px',
                                        background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
                                    }} />
                                    <div style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
                                            <div style={{
                                                width: '2.75rem', height: '2.75rem', borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                                flexShrink: 0,
                                            }}>
                                                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>{admin.name?.[0]}</span>
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{admin.name}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.125rem' }}>
                                                    <Mail size={12} style={{ color: 'var(--text-tertiary)' }} />
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin.email}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {admin.centerId && (
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-lg)',
                                                background: 'var(--bg-elevated)', marginBottom: '0.875rem',
                                                border: '1px solid var(--border-subtle)',
                                            }}>
                                                <Building2 size={13} style={{ color: '#3b82f6', flexShrink: 0 }} />
                                                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                                    {getCenterName(admin.centerId)}
                                                </span>
                                            </div>
                                        )}

                                        <span
                                            style={{
                                                display: 'inline-block',
                                                fontSize: '0.6875rem', fontWeight: 600,
                                                padding: '0.25rem 0.625rem', borderRadius: '99px',
                                                ...(admin.isActive !== false
                                                    ? { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }
                                                    : { background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }
                                                ),
                                            }}
                                        >
                                            {admin.isActive !== false ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Center Admin">
                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Input label="Full Name *" error={errors.name?.message} {...register('name', { required: 'Required' })} />
                        <Input label="Email *" type="email" error={errors.email?.message} {...register('email', { required: 'Required' })} />
                        <Input label="Password *" type="password" error={errors.password?.message} {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Assign to Center *</label>
                            <select {...register('centerId', { required: 'Required' })}>
                                <option value="">Select Center</option>
                                {centers.filter((c) => c.isActive !== false).map((c) => (
                                    <option key={c.centerId} value={c.centerId}>{c.name} — {c.city}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
                            <Button variant="secondary" onClick={() => setShowModal(false)} type="button">Cancel</Button>
                            <Button type="submit" loading={submitting}>Create Admin</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default ManageCenterAdmins;
