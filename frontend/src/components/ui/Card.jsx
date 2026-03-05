import { cn } from '@utils/helpers';

const Card = ({ children, className = '', hover = false, glass = false, ...props }) => {
    return (
        <div
            className={cn(
                'overflow-hidden',
                glass && 'glass-card',
                hover && 'card-lift cursor-pointer',
                className
            )}
            style={{
                borderRadius: 'var(--radius-2xl)',
                border: '1px solid var(--border-default)',
                background: glass ? undefined : 'var(--bg-surface)',
                boxShadow: 'var(--shadow-sm)',
            }}
            {...props}
        >
            {children}
        </div>
    );
};

const CardHeader = ({ children, className = '' }) => (
    <div
        className={cn(className)}
        style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
        }}
    >
        {children}
    </div>
);

const CardBody = ({ children, className = '' }) => (
    <div
        className={cn(className)}
        style={{ padding: '1.5rem 1.5rem' }}
    >
        {children}
    </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;

export default Card;
