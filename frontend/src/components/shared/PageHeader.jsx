const PageHeader = ({ title, description, action }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                marginBottom: '2rem',
            }}
        >
            <div>
                <h1
                    style={{
                        fontSize: 'clamp(1.5rem, 3vw, 1.85rem)',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        lineHeight: 1.2,
                    }}
                >
                    {title}
                </h1>
                {description && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                        {description}
                    </p>
                )}
            </div>
            {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </div>
    );
};

export default PageHeader;
