import { motion } from 'framer-motion';
import { cn } from '@utils/helpers';

const variantStyles = {
    primary: {
        background: 'var(--color-accent)',
        color: '#fff',
    },
    secondary: {
        background: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-default)',
    },
    danger: {
        background: 'var(--color-danger)',
        color: '#fff',
    },
    ghost: {
        background: 'transparent',
        color: 'var(--text-secondary)',
    },
    trust: {
        background: 'var(--color-trust-blue)',
        color: '#fff',
    },
};

const sizeStyles = {
    sm: { padding: '0.4rem 0.85rem', fontSize: '0.75rem' },
    md: { padding: '0.625rem 1.35rem', fontSize: '0.875rem' },
    lg: { padding: '0.85rem 1.85rem', fontSize: '1rem' },
};

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    loading = false,
    icon: Icon,
    disabled,
    style: propStyle,
    ...props
}) => {
    return (
        <motion.button
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            className={cn(
                'inline-flex items-center justify-center gap-2 font-semibold cursor-pointer',
                'transition-all duration-200',
                (disabled || loading) && 'opacity-50 cursor-not-allowed pointer-events-none',
                className
            )}
            style={{
                borderRadius: 'var(--radius-lg)',
                ...sizeStyles[size],
                ...variantStyles[variant],
                ...propStyle,
            }}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : Icon ? (
                <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
            ) : null}
            {children}
        </motion.button>
    );
};

export default Button;
