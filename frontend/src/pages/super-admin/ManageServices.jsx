import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Wrench, Edit, Clock, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import PageHeader from '@components/shared/PageHeader';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Modal from '@components/ui/Modal';
import { PageLoader } from '@components/ui/Loader';
import EmptyState from '@components/ui/EmptyState';
import { servicesAPI } from '@services/api';

const fadeUp = (i = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: i * 0.05 },
});

const ManageServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    useEffect(() => { fetchServices(); }, []);

    const fetchServices = async () => {
        try { const res = await servicesAPI.getAll(); setServices(res.data || []); }
        catch { toast.error('Failed to load services'); }
        finally { setLoading(false); }
    };

    const openCreate = () => { setEditing(null); reset({}); setShowModal(true); };

    const openEdit = (s) => {
        setEditing(s);
        ['name', 'description', 'duration'].forEach((f) => setValue(f, s[f]));
        setShowModal(true);
    };

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            if (editing) { await servicesAPI.update(editing.serviceId, data); toast.success('Service updated'); }
            else { await servicesAPI.create(data); toast.success('Service created'); }
            setShowModal(false); fetchServices();
        } catch (err) { toast.error(err.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem 0' }}>
                <motion.div {...fadeUp(0)}>
                    <PageHeader title="Manage Services" description={`${services.length} services configured`}
                        action={<Button icon={Plus} onClick={openCreate}>Add Service</Button>} />
                </motion.div>

                {services.length === 0 ? (
                    <EmptyState icon={Wrench} title="No services" action={<Button size="sm" icon={Plus} onClick={openCreate}>Add Service</Button>} />
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
                        {services.map((svc, i) => (
                            <motion.div key={svc.serviceId} {...fadeUp(i + 1)}>
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
                                        background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                                    }} />
                                    <div style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                                            <div style={{
                                                width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-lg)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: 'rgba(245,158,11,0.1)',
                                            }}>
                                                <Wrench size={18} style={{ color: '#f59e0b' }} />
                                            </div>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                                padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-md)',
                                                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                                            }}>
                                                <Clock size={12} style={{ color: 'var(--text-tertiary)' }} />
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{svc.duration} min</span>
                                            </div>
                                        </div>

                                        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem', lineHeight: 1.3 }}>{svc.name}</h3>
                                        <p style={{
                                            fontSize: '0.8125rem', color: 'var(--text-tertiary)', lineHeight: 1.5,
                                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                        }}>
                                            {svc.description || 'No description'}
                                        </p>

                                        {svc.requiresDocuments && (
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                                marginTop: '0.625rem',
                                            }}>
                                                <FileText size={12} style={{ color: '#f59e0b' }} />
                                                <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 500 }}>Documents required</span>
                                            </div>
                                        )}

                                        <div style={{ paddingTop: '1rem', marginTop: '0.875rem', borderTop: '1px solid var(--border-subtle)' }}>
                                            <Button size="sm" variant="secondary" icon={Edit} onClick={() => openEdit(svc)}>Edit</Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Service' : 'Add Service'}>
                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Input label="Service Name *" error={errors.name?.message} {...register('name', { required: 'Required' })} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Description</label>
                            <textarea rows={3} {...register('description')} placeholder="Service description…" />
                        </div>
                        <Input label="Duration (minutes) *" type="number" error={errors.duration?.message} {...register('duration', { required: 'Required' })} />
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

export default ManageServices;
