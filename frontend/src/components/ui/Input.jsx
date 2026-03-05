import { forwardRef } from 'react';
import { cn } from '@utils/helpers';

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {label && (
                <label
                    className="block text-sm font-medium tracking-wide"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div
                        className="absolute top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--text-tertiary)', left: '0.85rem' }}
                    >
                        <Icon size={18} />
                    </div>
                )}
                <input
                    ref={ref}
                    className={cn(className)}
                    style={{
                        ...(Icon ? { paddingLeft: '2.75rem' } : {}),
                        ...(error ? { borderColor: 'var(--color-danger)' } : {}),
                    }}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-xs" style={{ color: 'var(--color-danger)', marginTop: '0.1rem' }}>{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
