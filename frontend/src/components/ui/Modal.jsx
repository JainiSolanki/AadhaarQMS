import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    const maxWidths = {
        sm: '28rem',
        md: '32rem',
        lg: '42rem',
        xl: '56rem',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.5rem',
                    }}
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(4px)',
                        }}
                        onClick={onClose}
                    />

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: maxWidths[size] || maxWidths.md,
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-2xl)',
                            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Header */}
                        {title && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1.25rem 1.5rem',
                                    borderBottom: '1px solid var(--border-subtle)',
                                }}
                            >
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="cursor-pointer transition-colors"
                                    style={{
                                        padding: '0.35rem',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--text-tertiary)',
                                        background: 'transparent',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        )}

                        {/* Body */}
                        <div
                            style={{
                                padding: '1.5rem 1.5rem',
                                maxHeight: '70vh',
                                overflowY: 'auto',
                            }}
                        >
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
