import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title = 'No data found', description = '', action }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 1.5rem',
                textAlign: 'center',
            }}
        >
            <div
                style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-elevated)',
                    marginBottom: '1.25rem',
                }}
            >
                <Icon size={28} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                {title}
            </h3>
            {description && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', maxWidth: '24rem' }}>
                    {description}
                </p>
            )}
            {action && <div style={{ marginTop: '1.25rem' }}>{action}</div>}
        </div>
    );
};

export default EmptyState;
