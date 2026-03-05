import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Phone, Zap, Eye, EyeOff, ArrowRight, Globe, QrCode, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '@store/authStore';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import ThemeToggle from '@components/shared/ThemeToggle';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register: registerUser } = useAuthStore();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await registerUser(data);
            toast.success('Account created successfully!');
            navigate('/citizen/dashboard');
        } catch (err) {
            toast.error(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-bg min-h-screen flex">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(135deg, rgba(26,111,212,0.08), rgba(255,107,43,0.08))' }}
                />
                {/* Decorative circles */}
                <div className="absolute" style={{ width: '350px', height: '350px', borderRadius: '50%', border: '1px solid var(--border-subtle)', top: '-8%', right: '-8%', opacity: 0.4 }} />
                <div className="absolute" style={{ width: '250px', height: '250px', borderRadius: '50%', border: '1px solid var(--border-subtle)', bottom: '-5%', left: '-5%', opacity: 0.3 }} />

                <div className="relative z-10" style={{ maxWidth: '420px', padding: '0 3rem' }}>
                    <Link to="/" className="flex items-center gap-2.5" style={{ marginBottom: '2.5rem' }}>
                        <div
                            className="w-11 h-11 flex items-center justify-center"
                            style={{
                                borderRadius: 'var(--radius-lg)',
                                background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))',
                            }}
                        >
                            <Zap size={22} className="text-white" />
                        </div>
                        <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>AadhaarQMS</span>
                    </Link>

                    <h2 className="font-extrabold" style={{ fontSize: '2.5rem', lineHeight: 1.1, marginBottom: '1rem' }}>
                        Join<br />
                        <span className="gradient-text">AadhaarQMS.</span>
                    </h2>

                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '2.5rem', fontSize: '1.05rem' }}>
                        Create your free citizen account to book appointments, receive digital tokens, and skip the queue everywhere.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { icon: Globe, text: 'Book from anywhere, anytime' },
                            { icon: CheckCircle2, text: 'No more standing in queues' },
                            { icon: QrCode, text: 'Digital QR token on your phone' },
                        ].map((item) => (
                            <div
                                key={item.text}
                                className="flex items-center"
                                style={{
                                    gap: '0.85rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--border-subtle)',
                                }}
                            >
                                <div
                                    className="flex items-center justify-center"
                                    style={{
                                        width: '2rem',
                                        height: '2rem',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'rgba(255,107,43,0.1)',
                                        flexShrink: 0,
                                    }}
                                >
                                    <item.icon size={14} style={{ color: 'var(--color-accent)' }} />
                                </div>
                                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex items-center justify-center" style={{ padding: '2rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full"
                    style={{ maxWidth: '440px' }}
                >
                    {/* Mobile header */}
                    <div className="flex items-center justify-between lg:hidden" style={{ marginBottom: '2rem' }}>
                        <Link to="/" className="flex items-center gap-2">
                            <div
                                className="w-8 h-8 flex items-center justify-center"
                                style={{
                                    borderRadius: 'var(--radius-md)',
                                    background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))',
                                }}
                            >
                                <Zap size={16} className="text-white" />
                            </div>
                            <span className="text-base font-bold">AadhaarQMS</span>
                        </Link>
                        <ThemeToggle />
                    </div>

                    {/* Desktop theme toggle */}
                    <div className="absolute top-6 right-6 hidden lg:block">
                        <ThemeToggle />
                    </div>

                    {/* Form card */}
                    <div
                        style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-2xl)',
                            padding: '2.5rem 2rem',
                        }}
                    >
                        <h1 className="text-2xl font-bold" style={{ marginBottom: '0.5rem' }}>Create Account</h1>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
                            Register as a citizen to start booking Aadhaar appointments.
                        </p>

                        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                            <Input
                                label="Full Name"
                                type="text"
                                icon={User}
                                placeholder="Your full name"
                                error={errors.name?.message}
                                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                            />

                            <Input
                                label="Email Address"
                                type="email"
                                icon={Mail}
                                placeholder="you@example.com"
                                error={errors.email?.message}
                                {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
                            />

                            <Input
                                label="Phone Number"
                                type="tel"
                                icon={Phone}
                                placeholder="10-digit mobile number"
                                error={errors.phone?.message}
                                {...register('phone', { required: 'Phone is required', pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid Indian phone number' } })}
                            />

                            <div className="relative">
                                <Input
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    icon={Lock}
                                    placeholder="Min 8 chars with upper, lower, number & special"
                                    error={errors.password?.message}
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: { value: 8, message: 'At least 8 characters' },
                                        pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, message: 'Must contain uppercase, lowercase, number & special char' },
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute cursor-pointer"
                                    style={{ color: 'var(--text-tertiary)', right: '0.85rem', top: '2.35rem' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <Button type="submit" loading={loading} className="w-full" size="lg" style={{ marginTop: '0.5rem' }}>
                                Create Account
                            </Button>
                        </form>

                        <p className="text-sm text-center" style={{ color: 'var(--text-tertiary)', marginTop: '1.5rem' }}>
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium hover:underline" style={{ color: 'var(--color-accent)' }}>Sign in</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
