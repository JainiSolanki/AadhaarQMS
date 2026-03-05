import { cn } from '@utils/helpers';

const StatCard = ({ icon: Icon, label, value, trend, trendUp, className = '' }) => {
    return (
        <div
            className={cn('transition-all', className)}
            style={{
                padding: '1.25rem 1.5rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xl)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <p
                        style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: 'var(--text-tertiary)',
                        }}
                    >
                        {label}
                    </p>
                    <p
                        style={{
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            lineHeight: 1.1,
                        }}
                    >
                        {value}
                    </p>
                    {trend && (
                        <p
                            style={{
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                color: trendUp ? 'var(--color-success)' : 'var(--color-danger)',
                            }}
                        >
                            {trendUp ? '↑' : '↓'} {trend}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div
                        style={{
                            width: '2.75rem',
                            height: '2.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'var(--radius-lg)',
                            background: 'rgba(255, 107, 43, 0.1)',
                        }}
                    >
                        <Icon size={20} style={{ color: 'var(--color-accent)' }} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
