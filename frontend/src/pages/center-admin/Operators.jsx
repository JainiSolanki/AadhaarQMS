import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Users, Edit, Trash2, Monitor, Mail, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Modal from '@components/ui/Modal';
import Card from '@components/ui/Card';
import { PageLoader } from '@components/ui/Loader';
import EmptyState from '@components/ui/EmptyState';
import useAuthStore from '@store/authStore';
import { operatorsAPI, centersAPI } from '@services/api';

const fadeUp = (i = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay: i * 0.06 },
});

const CenterOperators = () => {
    const { user } = useAuthStore();
    const [operators, setOperators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [centerCapacity, setCenterCapacity] = useState(0);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [opsRes, centerRes] = await Promise.all([
                operatorsAPI.getByCenter(user?.centerId),
                centersAPI.getById(user?.centerId),
            ]);
            setOperators(opsRes.data || []);
            setCenterCapacity(centerRes.data?.operatorCapacity || 5);
        } catch { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    };

    const takenCounters = operators
        .filter(op => op.isActive && (!editing || op.operatorId !== editing.operatorId))
        .map(op => String(op.counterId));

    const counterOptions = Array.from({ length: centerCapacity }, (_, i) => {
        const val = String(i + 1);
        return { value: val, label: `Counter ${val}`, taken: takenCounters.includes(val) };
    });

    const activeCount = operators.filter(o => o.isActive).length;

    const openCreate = () => {
        setEditing(null);
        reset({ name: '', email: '', password: '', counterId: '' });
        setShowModal(true);
    };

    const openEdit = (op) => {
        setEditing(op);
        reset({ name: op.name, email: op.email, counterId: String(op.counterId || '') });
        setShowModal(true);
    };

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            if (editing) {
                await operatorsAPI.update(editing.operatorId, {
                    name: data.name,
                    counterId: data.counterId,
                });
                toast.success('Operator updated');
            } else {
                await operatorsAPI.create({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    counterId: data.counterId,
                    centerId: user?.centerId,
                });
                toast.success('Operator created');
            }
            setShowModal(false);
            fetchData();
        } catch (err) { toast.error(err.message || 'Operation failed'); }
        finally { setSubmitting(false); }
    };

    const handleDeactivate = async (id) => {
        if (!window.confirm('Deactivate this operator?')) return;
        try { await operatorsAPI.delete(id); toast.success('Operator deactivated'); fetchData(); }
        catch (err) { toast.error(err.message || 'Failed'); }
    };

    if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Header */}
                <motion.div {...fadeUp(0)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                            Operators
                        </h1>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                            Manage operators for your center
                        </p>
                    </div>
                    {activeCount >= centerCapacity ? (
                        <Button icon={UserPlus} disabled>Capacity Full</Button>
                    ) : (
                        <Button icon={UserPlus} onClick={openCreate}>Add Operator</Button>
                    )}
                </motion.div>

                {/* Capacity Bar */}
                <motion.div {...fadeUp(1)}>
                    <div style={{
                        padding: '1rem 1.25rem', background: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)',
                        display: 'flex', alignItems: 'center', gap: '1rem',
                    }}>
                        <div style={{
                            width: '2.25rem', height: '2.25rem', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', borderRadius: 'var(--radius-md)',
                            background: 'rgba(99,102,241,0.12)',
                        }}>
                            <Users size={15} style={{ color: '#818cf8' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    Counter Capacity
                                </span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {activeCount}/{centerCapacity}
                                </span>
                            </div>
                            <div style={{
                                height: '6px', borderRadius: '3px', overflow: 'hidden',
                                background: 'var(--bg-elevated)',
                            }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.round((activeCount / (centerCapacity || 1)) * 100)}%` }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    style={{
                                        height: '100%', borderRadius: '3px',
                                        background: activeCount >= centerCapacity
                                            ? '#ef4444'
                                            : 'linear-gradient(90deg, #6366f1, #818cf8)',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Operator Grid */}
                {operators.length === 0 ? (
                    <motion.div {...fadeUp(2)}>
                        <EmptyState icon={Users} title="No operators" description="Add your first operator to get started."
                            action={<Button size="sm" icon={UserPlus} onClick={openCreate}>Add Operator</Button>} />
                    </motion.div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                        {operators.map((op, i) => (
                            <motion.div key={op.operatorId} {...fadeUp(2 + i * 0.3)}>
                                <Card>
                                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                                        {/* Accent strip */}
                                        <div style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                                            background: op.isActive
                                                ? 'linear-gradient(90deg, #6366f1, #818cf8)'
                                                : 'linear-gradient(90deg, #ef4444, transparent)',
                                        }} />

                                        <div style={{ padding: '1.5rem' }}>
                                            {/* Header: avatar + name + status */}
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                                                    <div style={{
                                                        width: '2.75rem', height: '2.75rem', borderRadius: '50%',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-trust-blue))',
                                                        flexShrink: 0,
                                                    }}>
                                                        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                                                            {op.name?.[0]?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                            {op.name}
                                                        </p>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.125rem' }}>
                                                            <Mail size={11} style={{ color: 'var(--text-tertiary)' }} />
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                                {op.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span style={{
                                                    fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.6rem',
                                                    borderRadius: '9999px',
                                                    ...(op.isActive
                                                        ? { background: 'rgba(16,185,129,0.12)', color: '#10b981' }
                                                        : { background: 'rgba(239,68,68,0.12)', color: '#ef4444' }
                                                    ),
                                                }}>
                                                    {op.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>

                                            {/* Counter badge */}
                                            <div style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                                padding: '0.5rem 0.875rem', borderRadius: 'var(--radius-lg)',
                                                background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                                                marginBottom: '1rem',
                                            }}>
                                                <Monitor size={14} style={{ color: '#818cf8' }} />
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                    Counter {op.counterId || '—'}
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Button size="sm" variant="secondary" icon={Edit} onClick={() => openEdit(op)}>Edit</Button>
                                                {op.isActive && (
                                                    <Button size="sm" variant="danger" icon={Trash2} onClick={() => handleDeactivate(op.operatorId)}>Deactivate</Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Operator' : 'Add Operator'}>
                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Input label="Name" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />

                        {!editing && (
                            <>
                                <Input label="Email" type="email" error={errors.email?.message} {...register('email', { required: 'Email is required' })} />
                                <Input
                                    label="Password" type="password" error={errors.password?.message}
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: { value: 8, message: 'Must be at least 8 characters' }
                                    })}
                                    placeholder="Min 8 characters"
                                />
                            </>
                        )}

                        {/* Counter Dropdown */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                Assign Counter <span style={{ color: 'var(--color-danger)' }}>*</span>
                            </label>
                            <select
                                {...register('counterId', { required: 'Please select a counter' })}
                                style={{
                                    width: '100%', padding: '0.625rem 0.875rem',
                                    borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)',
                                    background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                                    fontSize: '0.875rem', outline: 'none', cursor: 'pointer',
                                }}
                            >
                                <option value="">Select a counter…</option>
                                {counterOptions.map(opt => (
                                    <option key={opt.value} value={opt.value} disabled={opt.taken}>
                                        {opt.label}{opt.taken ? ' (assigned)' : ''}
                                    </option>
                                ))}
                            </select>
                            {errors.counterId && (
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>{errors.counterId.message}</p>
                            )}
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
                                {takenCounters.length} of {centerCapacity} counters assigned
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
                            <Button variant="secondary" onClick={() => setShowModal(false)} type="button">Cancel</Button>
                            <Button type="submit" loading={submitting}>{editing ? 'Update' : 'Create'}</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default CenterOperators;
