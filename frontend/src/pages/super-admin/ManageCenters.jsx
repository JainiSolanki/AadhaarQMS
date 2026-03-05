import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Building2, Edit, Trash2, Search, MapPin, Phone, Mail, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import PageHeader from '@components/shared/PageHeader';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Modal from '@components/ui/Modal';
import Card from '@components/ui/Card';
import { PageLoader } from '@components/ui/Loader';
import EmptyState from '@components/ui/EmptyState';
import { centersAPI } from '@services/api';
import { INDIAN_STATES } from '@utils/constants';

const fadeUp = (i = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: i * 0.05 },
});

const ManageCenters = () => {
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    useEffect(() => { fetchCenters(); }, []);

    const fetchCenters = async () => {
        try { const res = await centersAPI.getAll(); setCenters(res.data || []); }
        catch { toast.error('Failed to load centers'); }
        finally { setLoading(false); }
    };

    const openCreate = () => { setEditing(null); reset({}); setShowModal(true); };

    const openEdit = (c) => {
        setEditing(c);
        ['name', 'address', 'city', 'state', 'pincode', 'phone', 'email', 'operatorCapacity'].forEach((f) => setValue(f, c[f]));
        setShowModal(true);
    };

    const onSubmit = async (data) => {
        setSubmitting(true);
        if (data.operatorCapacity) data.operatorCapacity = parseInt(data.operatorCapacity, 10);
        try {
            if (editing) { await centersAPI.update(editing.centerId, data); toast.success('Center updated'); }
            else { await centersAPI.create(data); toast.success('Center created'); }
            setShowModal(false); fetchCenters();
        } catch (err) { toast.error(err.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Deactivate this center?')) return;
        try { await centersAPI.delete(id); toast.success('Center deactivated'); fetchCenters(); }
        catch (err) { toast.error(err.message || 'Failed'); }
    };

    const filtered = centers.filter((c) =>
        !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.city?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem 0' }}>
                <motion.div {...fadeUp(0)}>
                    <PageHeader title="Manage Centers" description={`${centers.length} centers total`}
                        action={<Button icon={Plus} onClick={openCreate}>Add Center</Button>} />
                </motion.div>

                <motion.div {...fadeUp(1)} style={{ maxWidth: '400px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{
                            position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                            color: 'var(--text-tertiary)',
                        }} />
                        <input
                            type="text"
                            placeholder="Search centers…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                </motion.div>

                {filtered.length === 0 ? (
                    <EmptyState icon={Building2} title="No centers found" action={<Button size="sm" icon={Plus} onClick={openCreate}>Add Center</Button>} />
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                        {filtered.map((c, i) => (
                            <motion.div key={c.centerId} {...fadeUp(i + 2)}>
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
                                    {/* Color accent strip */}
                                    <div style={{
                                        height: '3px',
                                        background: c.isActive !== false
                                            ? 'linear-gradient(90deg, #3b82f6, #6366f1)'
                                            : 'linear-gradient(90deg, #ef4444, #f97316)',
                                    }} />

                                    <div style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-lg)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: 'rgba(59,130,246,0.1)',
                                                }}>
                                                    <Building2 size={18} style={{ color: '#3b82f6' }} />
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{c.name}</h3>
                                                </div>
                                            </div>
                                            <span
                                                style={{
                                                    fontSize: '0.6875rem', fontWeight: 600,
                                                    padding: '0.25rem 0.625rem', borderRadius: '99px',
                                                    ...(c.isActive !== false
                                                        ? { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }
                                                        : { background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }
                                                    ),
                                                }}
                                            >
                                                {c.isActive !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <MapPin size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{c.city}, {c.state}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', paddingLeft: '1.3rem' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{c.address} — {c.pincode}</span>
                                            </div>
                                        </div>

                                        <div style={{
                                            display: 'flex', gap: '0.5rem', paddingTop: '1rem',
                                            borderTop: '1px solid var(--border-subtle)',
                                        }}>
                                            <Button size="sm" variant="secondary" icon={Edit} onClick={() => openEdit(c)}>Edit</Button>
                                            <Button size="sm" variant="danger" icon={Trash2} onClick={() => handleDelete(c.centerId)}>Remove</Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Center' : 'Add Center'} size="lg">
                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <Input label="Center Name *" error={errors.name?.message} {...register('name', { required: 'Required' })} />
                            <Input label="Email" type="email" {...register('email')} />
                            <Input label="Phone" {...register('phone')} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>State *</label>
                                <select {...register('state', { required: 'Required' })}>
                                    <option value="">Select</option>
                                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <Input label="City *" error={errors.city?.message} {...register('city', { required: 'Required' })} />
                            <Input label="Pincode *" error={errors.pincode?.message} {...register('pincode', { required: 'Required' })} />
                        </div>
                        <Input label="Address *" error={errors.address?.message} {...register('address', { required: 'Required' })} />
                        <Input label="Operator Capacity" type="number" {...register('operatorCapacity')} />
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

export default ManageCenters;
