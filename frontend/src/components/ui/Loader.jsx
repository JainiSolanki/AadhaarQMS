const Loader = ({ size = 'md', className = '' }) => {
    const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`${sizes[size]} rounded-full animate-spin`}
                style={{ border: '3px solid var(--color-accent)', borderTopColor: 'transparent' }}
            />
        </div>
    );
};

export const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
            <Loader size="lg" />
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading…</p>
        </div>
    </div>
);

export default Loader;
