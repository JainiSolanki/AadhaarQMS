import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Building2, Mail, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import PageHeader from '@components/shared/PageHeader';
import { PageLoader } from '@components/ui/Loader';
import EmptyState from '@components/ui/EmptyState';
import { adminAPI } from '@services/api';

const fadeUp = (i = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: i * 0.05 },
});

const ManageOperators = () => {
    const [operators, setOperators] = useState([]);
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [opsRes, centersRes] = await Promise.all([
                adminAPI.getAllOperators(),
                adminAPI.getAllCenters(),
            ]);
            setOperators(opsRes.data || []);
            setCenters(centersRes.data || []);
        } catch { toast.error('Failed to load operators'); }
        finally { setLoading(false); }
    };

    const getCenterName = (centerId) => {
        const c = centers.find((c) => c.centerId === centerId);
        return c ? c.name : centerId || '—';
    };

    const filtered = operators.filter((o) =>
        !search || o.name?.toLowerCase().includes(search.toLowerCase()) || o.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem 0' }}>
                <motion.div {...fadeUp(0)}>
                    <PageHeader title="All Operators" description={`${operators.length} operators system-wide`} />
                </motion.div>

                <motion.div {...fadeUp(1)} style={{ maxWidth: '400px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{
                            position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                            color: 'var(--text-tertiary)',
                        }} />
                        <input
                            type="text"
                            placeholder="Search operators…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                </motion.div>

                {filtered.length === 0 ? (
                    <EmptyState icon={Users} title="No operators found" />
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                        {filtered.map((op, i) => (
                            <motion.div key={op.operatorId} {...fadeUp(i + 2)}>
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
                                        background: op.isActive
                                            ? 'linear-gradient(90deg, #10b981, #3b82f6)'
                                            : 'linear-gradient(90deg, #6b7280, #9ca3af)',
                                    }} />
                                    <div style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
                                            <div style={{
                                                width: '2.75rem', height: '2.75rem', borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                                flexShrink: 0,
                                            }}>
                                                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>{op.name?.[0]}</span>
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{op.name}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.125rem' }}>
                                                    <Mail size={12} style={{ color: 'var(--text-tertiary)' }} />
                                                    <span style={{
                                                        fontSize: '0.75rem', color: 'var(--text-tertiary)',
                                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                    }}>
                                                        {op.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.875rem' }}>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                                padding: '0.375rem 0.625rem', borderRadius: 'var(--radius-lg)',
                                                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                                            }}>
                                                <Building2 size={12} style={{ color: '#3b82f6' }} />
                                                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                                    {getCenterName(op.centerId)}
                                                </span>
                                            </div>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                                padding: '0.375rem 0.625rem', borderRadius: 'var(--radius-lg)',
                                                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                                            }}>
                                                <Hash size={12} style={{ color: 'var(--text-tertiary)' }} />
                                                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                                    Counter {op.counterId || '—'}
                                                </span>
                                            </div>
                                        </div>

                                        <span
                                            style={{
                                                display: 'inline-block',
                                                fontSize: '0.6875rem', fontWeight: 600,
                                                padding: '0.25rem 0.625rem', borderRadius: '99px',
                                                ...(op.isActive
                                                    ? { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }
                                                    : { background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }
                                                ),
                                            }}
                                        >
                                            {op.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ManageOperators;
