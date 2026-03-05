import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Shield, Zap, Clock, MapPin, Users, ArrowRight, CheckCircle2, Star, Globe, Headphones, BarChart3, FileText, Mail, Phone, Github, Twitter } from 'lucide-react';
import Button from '@components/ui/Button';
import ThemeToggle from '@components/shared/ThemeToggle';

const features = [
    { icon: Calendar, title: 'Smart Booking', desc: 'Book your Aadhaar appointment in under 60 seconds with real-time slot availability.' },
    { icon: Clock, title: 'Live Queue', desc: 'Track your position in real-time. No more waiting in endless lines at the center.' },
    { icon: MapPin, title: 'Multi-Center', desc: 'Choose from multiple Aadhaar centers across your city and state.' },
    { icon: Shield, title: 'Secure & Encrypted', desc: 'Your Aadhaar data is encrypted end-to-end. Privacy-first architecture.' },
    { icon: Users, title: 'Role-Based Access', desc: 'Citizens, operators, and admins — each gets a tailored dashboard experience.' },
    { icon: Zap, title: 'Instant Tokens', desc: 'Receive your QR-coded token instantly after booking. No paperwork needed.' },
];

const steps = [
    { num: '01', title: 'Select Center', desc: 'Choose an Aadhaar center near you' },
    { num: '02', title: 'Pick Service & Slot', desc: 'Select your service type and time' },
    { num: '03', title: 'Get Token', desc: 'Receive QR token with queue position' },
    { num: '04', title: 'Visit & Done', desc: 'Show QR, skip the line, get served' },
];

const stats = [
    { value: '10K+', label: 'Appointments Booked' },
    { value: '200+', label: 'Aadhaar Centers' },
    { value: '99.5%', label: 'Uptime' },
    { value: '< 2min', label: 'Avg. Wait Time' },
];

const LandingPage = () => {
    return (
        <div className="page-bg">
            {/* ─── Navbar ─── */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="container-main flex items-center justify-between" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
                    <Link to="/" className="flex items-center gap-2.5">
                        <div
                            className="w-9 h-9 flex items-center justify-center"
                            style={{
                                borderRadius: 'var(--radius-lg)',
                                background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))',
                            }}
                        >
                            <Zap size={18} className="text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                            AadhaarQMS
                        </span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Link to="/login">
                            <Button variant="ghost" size="sm">Sign In</Button>
                        </Link>
                        <Link to="/register">
                            <Button size="sm">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ─── Hero Section ─── */}
            <section className="relative flex items-center" style={{ minHeight: '100vh', paddingTop: '7rem', paddingBottom: '4rem' }}>
                <div className="container-main relative z-10">
                    <div className="grid lg:grid-cols-2 items-center" style={{ gap: '4rem' }}>
                        {/* Left: Copy */}
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div
                                className="inline-flex items-center gap-2 text-xs font-semibold"
                                style={{
                                    padding: '0.4rem 1rem',
                                    borderRadius: '999px',
                                    background: 'rgba(255, 107, 43, 0.1)',
                                    border: '1px solid rgba(255, 107, 43, 0.2)',
                                    color: 'var(--color-accent)',
                                    marginBottom: '1.5rem',
                                }}
                            >
                                <Zap size={12} /> Queue Management Reimagined
                            </div>

                            <h1 className="font-extrabold" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.08, letterSpacing: '-0.04em', marginBottom: '1.5rem' }}>
                                Skip the Queue.
                                <br />
                                <span className="gradient-text">Book Smart.</span>
                            </h1>

                            <p className="text-lg" style={{ color: 'var(--text-secondary)', maxWidth: '520px', lineHeight: 1.75, marginBottom: '1rem' }}>
                                The modern way to manage Aadhaar center appointments. Book, track, and get served — without the chaos of traditional queues.
                            </p>

                            <p className="text-sm" style={{ color: 'var(--text-tertiary)', maxWidth: '520px', lineHeight: 1.7, marginBottom: '2rem' }}>
                                Whether it's a new Aadhaar enrollment, address update, or biometric correction — find the nearest center, pick a convenient slot, and walk in at your scheduled time. No waiting, no token-counter confusion.
                            </p>

                            <div className="flex flex-wrap items-center" style={{ gap: '0.875rem', marginBottom: '2rem' }}>
                                <Link to="/register">
                                    <Button size="lg" icon={ArrowRight} className="btn-magnetic">
                                        Book Your Slot
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button variant="secondary" size="lg">
                                        Admin Portal
                                    </Button>
                                </Link>
                            </div>

                            {/* Trust signals */}
                            <div className="flex items-center flex-wrap" style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', gap: '1.25rem' }}>
                                {['Free to use', 'No paperwork', 'Instant tokens', 'Govt. aligned'].map((item) => (
                                    <div key={item} className="flex items-center gap-1.5">
                                        <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} /> {item}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right: Dashboard Preview */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="hidden lg:block"
                        >
                            <div className="relative">
                                {/* glow */}
                                <div
                                    className="absolute"
                                    style={{
                                        inset: '-1.5rem',
                                        borderRadius: 'var(--radius-3xl)',
                                        background: 'linear-gradient(135deg, rgba(255,107,43,0.15), rgba(26,111,212,0.15))',
                                        filter: 'blur(40px)',
                                    }}
                                />
                                <div className="glass-card relative" style={{ padding: '2rem' }}>
                                    {/* Top bar with dots */}
                                    <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ background: 'var(--color-danger)' }} />
                                            <div className="w-3 h-3 rounded-full" style={{ background: 'var(--color-warning)' }} />
                                            <div className="w-3 h-3 rounded-full" style={{ background: 'var(--color-success)' }} />
                                        </div>
                                        <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Live Queue Dashboard</span>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-3" style={{ gap: '0.75rem', marginBottom: '1.25rem' }}>
                                        {[
                                            { value: '42', label: "Today's Tokens", color: 'var(--color-accent)' },
                                            { value: '7', label: 'In Queue', color: 'var(--color-warning)' },
                                            { value: '35', label: 'Completed', color: 'var(--color-success)' },
                                        ].map((s) => (
                                            <div
                                                key={s.label}
                                                className="text-center"
                                                style={{
                                                    background: 'var(--bg-elevated)',
                                                    borderRadius: 'var(--radius-lg)',
                                                    padding: '1.25rem 0.75rem',
                                                }}
                                            >
                                                <p className="text-2xl font-bold" style={{ color: s.color, marginBottom: '0.35rem' }}>{s.value}</p>
                                                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{s.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Divider label */}
                                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>Current Queue</p>

                                    {/* Ticket rows */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        {[
                                            { token: 'TKN-001', time: '09:00 AM', status: 'In Progress', color: 'var(--color-accent)' },
                                            { token: 'TKN-002', time: '09:15 AM', status: 'Checked In', color: 'var(--color-info)' },
                                            { token: 'TKN-003', time: '09:30 AM', status: 'Pending', color: 'var(--color-warning)' },
                                            { token: 'TKN-004', time: '09:45 AM', status: 'Pending', color: 'var(--color-warning)' },
                                        ].map((t, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between text-sm"
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    background: 'var(--bg-elevated)',
                                                    borderRadius: 'var(--radius-lg)',
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                                                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{t.token}</span>
                                                    <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                                                    <span style={{ color: 'var(--text-tertiary)' }}>{t.time}</span>
                                                </div>
                                                <span
                                                    className="text-xs font-medium"
                                                    style={{
                                                        padding: '0.2rem 0.65rem',
                                                        borderRadius: '999px',
                                                        background: `color-mix(in srgb, ${t.color} 12%, transparent)`,
                                                        color: t.color,
                                                    }}
                                                >
                                                    {t.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Mini footer */}
                                    <div className="flex items-center justify-between" style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Avg. service time: 8 min</span>
                                        <span className="text-xs font-medium" style={{ color: 'var(--color-success)' }}>● System Online</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ─── Stats Strip ─── */}
            <section className="relative z-10" style={{ padding: '3rem 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="container-main">
                    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: '2rem' }}>
                        {stats.map((s, i) => (
                            <motion.div
                                key={s.label}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center"
                            >
                                <p className="text-3xl font-extrabold" style={{ color: 'var(--color-accent)', marginBottom: '0.25rem' }}>{s.value}</p>
                                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{s.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── How It Works ─── */}
            <section className="relative z-10" style={{ padding: '6rem 0' }}>
                <div className="container-main">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center"
                        style={{ marginBottom: '4rem' }}
                    >
                        <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', marginBottom: '1rem' }}>
                            How It <span className="gradient-text">Works</span>
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto' }}>
                            From booking to completion — in just four simple steps.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.num}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.12 }}
                                className="relative"
                            >
                                <div
                                    className="card-lift h-full"
                                    style={{
                                        background: 'var(--bg-surface)',
                                        border: '1px solid var(--border-default)',
                                        borderRadius: 'var(--radius-2xl)',
                                        padding: '1.75rem',
                                    }}
                                >
                                    <span className="font-extrabold" style={{ fontSize: '2.5rem', color: 'var(--color-accent)', opacity: 0.18 }}>
                                        {step.num}
                                    </span>
                                    <h3 className="font-bold mt-2 mb-2" style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                                        {step.title}
                                    </h3>
                                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{step.desc}</p>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className="hidden lg:flex absolute items-center justify-center" style={{ top: '50%', right: '-0.75rem', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
                                        <ArrowRight size={16} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Features ─── */}
            <section className="relative z-10" style={{ padding: '6rem 0' }}>
                <div className="container-main">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center"
                        style={{ marginBottom: '4rem' }}
                    >
                        <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', marginBottom: '1rem' }}>
                            Built for <span className="gradient-text">Everyone</span>
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto' }}>
                            Whether you're a citizen booking your first appointment or a center admin managing thousands.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <div
                                    className="card-lift h-full"
                                    style={{
                                        background: 'var(--bg-surface)',
                                        border: '1px solid var(--border-default)',
                                        borderRadius: 'var(--radius-2xl)',
                                        padding: '1.75rem',
                                    }}
                                >
                                    <div
                                        className="flex items-center justify-center"
                                        style={{
                                            width: '2.75rem',
                                            height: '2.75rem',
                                            borderRadius: 'var(--radius-lg)',
                                            background: 'rgba(255, 107, 43, 0.1)',
                                            marginBottom: '1rem',
                                        }}
                                    >
                                        <f.icon size={20} style={{ color: 'var(--color-accent)' }} />
                                    </div>
                                    <h3 className="font-bold mb-2" style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                                        {f.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                                        {f.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA ─── */}
            <section className="relative z-10" style={{ padding: '6rem 0' }}>
                <div className="container-main" style={{ maxWidth: '56rem' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass-card text-center relative overflow-hidden"
                        style={{ padding: '4rem 2rem' }}
                    >
                        <div
                            className="absolute"
                            style={{
                                inset: 0,
                                background: 'linear-gradient(135deg, rgba(255,107,43,0.05), rgba(26,111,212,0.05))',
                            }}
                        />
                        <div className="relative z-10">
                            <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
                                Ready to Skip the Queue?
                            </h2>
                            <p className="mb-8" style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 2rem' }}>
                                Join thousands of citizens who've already switched to smart appointment booking. It's free, fast, and completely paperless.
                            </p>
                            <div className="flex items-center justify-center flex-wrap" style={{ gap: '1rem' }}>
                                <Link to="/register">
                                    <Button size="lg" icon={ArrowRight} className="btn-magnetic">
                                        Create Free Account
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button size="lg" variant="secondary">
                                        Sign In Instead
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer className="relative z-10" style={{ padding: '4rem 0 2rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div className="container-main">
                    {/* Footer Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '2.5rem', marginBottom: '3rem' }}>
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
                                <div
                                    className="w-8 h-8 flex items-center justify-center"
                                    style={{
                                        borderRadius: 'var(--radius-md)',
                                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))',
                                    }}
                                >
                                    <Zap size={14} className="text-white" />
                                </div>
                                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>AadhaarQMS</span>
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-tertiary)', maxWidth: '260px' }}>
                                A modern queue management system built for India's Aadhaar service infrastructure. Simplifying citizen services, one appointment at a time.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Quick Links</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {[
                                    { label: 'Book Appointment', to: '/register' },
                                    { label: 'Sign In', to: '/login' },
                                    { label: 'Find a Center', to: '/register' },
                                    { label: 'Track Token', to: '/login' },
                                ].map((link) => (
                                    <Link key={link.label} to={link.to} className="text-sm transition-colors" style={{ color: 'var(--text-tertiary)' }}>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Services */}
                        <div>
                            <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Services</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {['New Aadhaar Enrollment', 'Address Update', 'Biometric Update', 'Mobile/Email Update', 'Name Correction'].map((s) => (
                                    <span key={s} className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{s}</span>
                                ))}
                            </div>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Contact</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                    <Mail size={14} style={{ color: 'var(--color-accent)' }} />
                                    support@aadhaarqms.in
                                </div>
                                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                    <Phone size={14} style={{ color: 'var(--color-accent)' }} />
                                    1947 (Toll Free)
                                </div>
                                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                    <Globe size={14} style={{ color: 'var(--color-accent)' }} />
                                    www.aadhaarqms.in
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between" style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', gap: '1rem' }}>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            © {new Date().getFullYear()} AadhaarQMS. Built for Digital India. All rights reserved.
                        </p>
                        <div className="flex items-center" style={{ gap: '1.25rem' }}>
                            {['Privacy Policy', 'Terms of Service', 'Accessibility'].map((item) => (
                                <span key={item} className="text-xs cursor-pointer transition-colors" style={{ color: 'var(--text-tertiary)' }}>
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
