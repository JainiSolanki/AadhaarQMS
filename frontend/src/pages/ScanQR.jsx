import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, CheckCircle2, AlertCircle, RotateCw, Camera, Monitor, Keyboard, Sun, Moon } from 'lucide-react';
import { appointmentsAPI } from '@services/api';
import useThemeStore from '@store/themeStore';

const RESET_DELAY = 22000;

const THEMES = {
    dark: {
        bg: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 30%, #0d1b2a 70%, #0f0f23 100%)',
        text: '#e2e8f0',
        textMuted: '#94a3b8',
        textDim: '#64748b',
        textDimmer: '#475569',
        card: 'rgba(42, 42, 82, 0.6)',
        cardBorder: 'rgba(99,102,241,0.2)',
        successBorder: 'rgba(16,185,129,0.3)',
        errorBorder: 'rgba(239,68,68,0.3)',
        inputBg: 'rgba(255,255,255,0.06)',
        inputBorder: 'rgba(255,255,255,0.12)',
        orb1: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        orb2: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)',
        btnSecondaryBg: 'rgba(255,255,255,0.08)',
        btnSecondaryBorder: 'rgba(255,255,255,0.1)',
        btnSecondaryColor: '#94a3b8',
        divider: 'rgba(255,255,255,0.1)',
        infoBg: 'rgba(255,255,255,0.04)',
        counterBg: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
        counterBorder: 'rgba(99,102,241,0.3)',
        toggleBg: 'rgba(255,255,255,0.08)',
        toggleBorder: 'rgba(255,255,255,0.15)',
        toggleColor: '#e2e8f0',
        cardShadow: 'none',
        headingGradient: 'linear-gradient(135deg, #a5b4fc, #818cf8)',
        qrIconBg: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
        scanBtnBg: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    },
    light: {
        bg: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 25%, #ddd6fe 50%, #ede9fe 75%, #eef2ff 100%)',
        text: '#1e1b4b',
        textMuted: '#4338ca',
        textDim: '#6366f1',
        textDimmer: '#818cf8',
        card: 'rgba(255,255,255,0.75)',
        cardBorder: 'rgba(99,102,241,0.22)',
        successBorder: 'rgba(16,185,129,0.35)',
        errorBorder: 'rgba(239,68,68,0.35)',
        inputBg: 'rgba(255,255,255,0.7)',
        inputBorder: 'rgba(99,102,241,0.2)',
        orb1: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
        orb2: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
        btnSecondaryBg: 'rgba(99,102,241,0.08)',
        btnSecondaryBorder: 'rgba(99,102,241,0.2)',
        btnSecondaryColor: '#4338ca',
        divider: 'rgba(99,102,241,0.15)',
        infoBg: 'rgba(99,102,241,0.06)',
        counterBg: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))',
        counterBorder: 'rgba(99,102,241,0.25)',
        toggleBg: 'rgba(255,255,255,0.7)',
        toggleBorder: 'rgba(99,102,241,0.2)',
        toggleColor: '#4338ca',
        cardShadow: '0 8px 32px rgba(99,102,241,0.1), 0 2px 8px rgba(0,0,0,0.05)',
        headingGradient: 'linear-gradient(135deg, #6366f1, #7c3aed)',
        qrIconBg: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))',
        scanBtnBg: 'linear-gradient(135deg, #6366f1, #7c3aed)',
    },
};

const ScanQR = () => {
    const [phase, setPhase] = useState('idle'); // idle | scanning | success | error
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [manualQr, setManualQr] = useState('');
    const scannerRef = useRef(null);
    const timerRef = useRef(null);
    const processingRef = useRef(false);
    const { theme, toggleTheme } = useThemeStore();
    const t = THEMES[theme] || THEMES.dark;

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopScanner();
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    // Start scanner AFTER the DOM element renders (via useEffect)
    useEffect(() => {
        if (phase === 'scanning') {
            let cancelled = false;
            const waitAndInit = async () => {
                // Poll for the container to appear in the DOM
                for (let i = 0; i < 20; i++) {
                    if (cancelled) return;
                    const el = document.getElementById('qr-reader');
                    if (el && el.offsetHeight > 0) {
                        initScanner();
                        return;
                    }
                    await new Promise(r => setTimeout(r, 150));
                }
                if (!cancelled) {
                    setPhase('error');
                    setErrorMsg('Scanner container failed to load. Please try again.');
                }
            };
            waitAndInit();
            return () => { cancelled = true; };
        }
    }, [phase]);

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                const state = scannerRef.current.getState();
                // State 2 = SCANNING, State 3 = PAUSED
                if (state === 2 || state === 3) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
            } catch (e) {
                console.log('Scanner cleanup:', e.message);
            }
            scannerRef.current = null;
        }
    };

    const initScanner = async () => {
        const container = document.getElementById('qr-reader');
        if (!container) {
            console.error('QR reader container not found');
            setPhase('error');
            setErrorMsg('Scanner container not ready. Please try again.');
            return;
        }

        try {
            // Dynamically import to avoid SSR issues
            const { Html5Qrcode } = await import('html5-qrcode');
            const scanner = new Html5Qrcode('qr-reader');
            scannerRef.current = scanner;

            // Try to get any available camera
            let cameraConfig;
            try {
                const cameras = await Html5Qrcode.getCameras();
                if (cameras && cameras.length > 0) {
                    // Prefer back camera if available, else use first camera
                    const backCam = cameras.find(c =>
                        c.label.toLowerCase().includes('back') ||
                        c.label.toLowerCase().includes('rear') ||
                        c.label.toLowerCase().includes('environment')
                    );
                    cameraConfig = backCam ? backCam.id : cameras[0].id;
                } else {
                    // Fallback to facingMode
                    cameraConfig = { facingMode: 'user' };
                }
            } catch {
                // If getCameras fails, try facingMode user (front camera / webcam)
                cameraConfig = { facingMode: 'user' };
            }

            await scanner.start(
                cameraConfig,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                async (decodedText) => {
                    // Prevent multiple concurrent check-ins
                    if (processingRef.current) return;
                    processingRef.current = true;

                    await stopScanner();
                    await handleCheckIn(decodedText);
                    processingRef.current = false;
                },
                () => { } // ignore continuous scan errors
            );
        } catch (err) {
            console.error('Scanner init error:', err);
            setPhase('error');

            // Provide helpful error message based on error type
            if (err.toString().includes('NotAllowedError') || err.toString().includes('Permission')) {
                setErrorMsg('Camera permission denied. Please allow camera access in your browser settings and try again.');
            } else if (err.toString().includes('NotFoundError') || err.toString().includes('no camera')) {
                setErrorMsg('No camera found on this device. Please connect a webcam and try again.');
            } else if (err.toString().includes('NotReadableError')) {
                setErrorMsg('Camera is in use by another application. Please close other apps and try again.');
            } else {
                setErrorMsg(`Camera error: ${err.message || err.toString()}. Try using the manual entry option.`);
            }
        }
    };

    const startScanning = () => {
        processingRef.current = false;
        setResult(null);
        setErrorMsg('');
        setPhase('scanning'); // useEffect will handle scanner init after render
    };

    const handleCheckIn = async (qrText) => {
        try {
            const res = await appointmentsAPI.checkIn(qrText);
            setResult(res.data);
            setPhase('success');

            timerRef.current = setTimeout(() => {
                resetToIdle();
            }, RESET_DELAY);
        } catch (err) {
            setPhase('error');
            setErrorMsg(err.message || 'Check-in failed. Please try again.');

            timerRef.current = setTimeout(() => {
                resetToIdle();
            }, 8000);
        }
    };

    const handleManualCheckIn = () => {
        if (manualQr.trim()) {
            handleCheckIn(manualQr.trim());
        }
    };

    const resetToIdle = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        stopScanner();
        processingRef.current = false;
        setPhase('idle');
        setResult(null);
        setErrorMsg('');
        setManualQr('');
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: t.bg,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            color: t.text,
            padding: '2rem',
            overflow: 'hidden',
            position: 'relative',
            transition: 'background 0.4s ease, color 0.3s ease',
        }}>
            {/* Theme Toggle */}
            <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                    position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10,
                    width: 44, height: 44, borderRadius: 12,
                    background: t.toggleBg, backdropFilter: 'blur(12px)',
                    border: `1px solid ${t.toggleBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: t.toggleColor,
                    transition: 'all 0.3s ease',
                }}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
            {/* Animated background orbs */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{
                    position: 'absolute', width: 500, height: 500, borderRadius: '50%',
                    background: t.orb1,
                    top: '-15%', right: '-10%', animation: 'float 8s ease-in-out infinite',
                    transition: 'background 0.4s ease',
                }} />
                <div style={{
                    position: 'absolute', width: 400, height: 400, borderRadius: '50%',
                    background: t.orb2,
                    bottom: '-10%', left: '-8%', animation: 'float 10s ease-in-out infinite reverse',
                    transition: 'background 0.4s ease',
                }} />
            </div>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative', zIndex: 1 }}
            >
                <p style={{ color: t.textMuted, fontSize: '1.5rem', fontWeight: 700 }}>
                    Scan your appointment QR code to check in
                </p>
            </motion.div>

            {/* Main Content */}
            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480 }}>
                <AnimatePresence>
                    {/* IDLE STATE */}
                    {phase === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{
                                background: t.card,
                                backdropFilter: 'blur(20px)',
                                borderRadius: 24,
                                border: `1px solid ${t.cardBorder}`,
                                padding: '3rem 2rem',
                                textAlign: 'center',
                                boxShadow: t.cardShadow,
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <motion.div
                                animate={{ scale: [1, 1.08, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                style={{
                                    width: 100, height: 100, borderRadius: 28,
                                    background: t.scanBtnBg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 1.5rem',
                                    boxShadow: '0 12px 40px rgba(99,102,241,0.4)',
                                }}
                            >
                                <QrCode size={44} color="#fff" />
                            </motion.div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                                Ready to Scan
                            </h2>
                            <p style={{ color: t.textMuted, fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                                Click the button below to activate your webcam and scan the appointment QR code
                            </p>
                            <button
                                onClick={startScanning}
                                style={{
                                    background: t.scanBtnBg,
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 14,
                                    padding: '1rem 2.5rem',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.5)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.35)'; }}
                            >
                                <Camera size={20} /> Start Webcam Scanner
                            </button>

                            {/* Manual Entry Divider */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                margin: '1.75rem 0 1rem',
                            }}>
                                <div style={{ flex: 1, height: 1, background: t.divider }} />
                                <span style={{ color: t.textDim, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>OR ENTER MANUALLY</span>
                                <div style={{ flex: 1, height: 1, background: t.divider }} />
                            </div>

                            {/* Manual QR Entry */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Paste QR code text here..."
                                    value={manualQr}
                                    onChange={(e) => setManualQr(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && manualQr.trim()) handleManualCheckIn();
                                    }}
                                    style={{
                                        flex: 1,
                                        background: t.inputBg,
                                        border: `1px solid ${t.inputBorder}`,
                                        color: t.text,
                                        borderRadius: 10,
                                        padding: '0.7rem 1rem',
                                        fontSize: '0.8rem',
                                        outline: 'none',
                                        transition: 'all 0.3s ease',
                                    }}
                                />
                                <button
                                    onClick={handleManualCheckIn}
                                    disabled={!manualQr.trim()}
                                    style={{
                                        background: manualQr.trim() ? 'linear-gradient(135deg, #10b981, #059669)' : t.inputBg,
                                        color: manualQr.trim() ? '#fff' : t.textDim,
                                        border: 'none',
                                        borderRadius: 10,
                                        padding: '0.7rem 1rem',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        cursor: manualQr.trim() ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        transition: 'all 0.2s',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <Keyboard size={14} /> Check In
                                </button>
                            </div>
                            <p style={{ color: t.textDimmer, fontSize: '0.65rem', marginTop: '0.4rem' }}>
                                Format: AQMS:appointmentId:tokenNumber:date
                            </p>
                        </motion.div>
                    )}

                    {/* SCANNING STATE */}
                    {phase === 'scanning' && (
                        <motion.div
                            key="scanning"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{
                                background: t.card,
                                backdropFilter: 'blur(20px)',
                                borderRadius: 24,
                                border: `1px solid ${t.cardBorder}`,
                                padding: '2rem',
                                textAlign: 'center',
                                boxShadow: t.cardShadow,
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <p style={{ color: '#a5b4fc', fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem' }}>
                                📸 Camera Active — Point at QR Code
                            </p>
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '0.75rem',
                            }}>
                                <div style={{
                                    width: 12, height: 12, borderRadius: '50%',
                                    background: '#10b981',
                                    boxShadow: '0 0 12px rgba(16,185,129,0.6)',
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                    marginRight: '0.5rem',
                                }} />
                                <span style={{ color: t.textMuted, fontSize: '0.8rem' }}>Scanning...</span>
                            </div>
                            {/* This is where the camera feed renders */}
                            <div
                                id="qr-reader"
                                style={{
                                    width: '100%',
                                    maxWidth: 400,
                                    margin: '0 auto',
                                    borderRadius: 16,
                                    overflow: 'hidden',
                                    border: '2px solid rgba(99,102,241,0.3)',
                                    background: '#000',
                                    minHeight: 300,
                                }}
                            />
                            <button
                                onClick={resetToIdle}
                                style={{
                                    marginTop: '1.25rem',
                                    background: t.btnSecondaryBg,
                                    color: t.btnSecondaryColor,
                                    border: `1px solid ${t.btnSecondaryBorder}`,
                                    borderRadius: 10,
                                    padding: '0.75rem 1.5rem',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                Cancel
                            </button>
                        </motion.div>
                    )}

                    {/* SUCCESS STATE */}
                    {phase === 'success' && result && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 20 }}
                            style={{
                                background: t.card,
                                backdropFilter: 'blur(20px)',
                                borderRadius: 24,
                                border: `1px solid ${t.successBorder}`,
                                padding: '2.5rem 2rem',
                                textAlign: 'center',
                                boxShadow: t.cardShadow,
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.1 }}
                                style={{
                                    width: 80, height: 80, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 1.25rem',
                                    boxShadow: '0 12px 40px rgba(16,185,129,0.4)',
                                }}
                            >
                                <CheckCircle2 size={40} color="#fff" />
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginBottom: '0.25rem' }}
                            >
                                Check-In Successful!
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                style={{ color: t.textMuted, fontSize: '0.85rem', marginBottom: '1.5rem' }}
                            >
                                Welcome, {result.citizenName}
                            </motion.p>

                            {/* Counter Number — BIG */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4, type: 'spring' }}
                                style={{
                                    background: t.counterBg,
                                    border: `1px solid ${t.counterBorder}`,
                                    borderRadius: 20,
                                    padding: '1.5rem',
                                    marginBottom: '1rem',
                                    transition: 'background 0.3s ease, border-color 0.3s ease',
                                }}
                            >
                                <p style={{ color: '#a5b4fc', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                                    Please proceed to
                                </p>
                                <p style={{
                                    fontSize: '3rem', fontWeight: 900,
                                    background: 'linear-gradient(135deg, #a5b4fc, #6366f1)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    lineHeight: 1.1,
                                }}>
                                    {result.counterNumber}
                                </p>
                            </motion.div>

                            {/* Info grid */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '0.75rem',
                                    marginBottom: '1.5rem',
                                }}
                            >
                                {[
                                    { label: 'Token', value: result.tokenNumber },
                                    { label: 'Operator', value: result.operatorName },
                                    { label: 'Time Slot', value: result.timeSlot },
                                    { label: 'Status', value: 'Checked In ✓' },
                                ].map((item) => (
                                    <div key={item.label} style={{
                                        background: t.infoBg,
                                        borderRadius: 12,
                                        padding: '0.75rem',
                                        transition: 'background 0.3s ease',
                                    }}>
                                        <p style={{ color: t.textDim, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                                        <p style={{ color: t.text, fontSize: '0.9rem', fontWeight: 700, marginTop: '0.25rem' }}>{item.value}</p>
                                    </div>
                                ))}
                            </motion.div>

                            {/* Auto-reset countdown */}
                            <CountdownBar duration={RESET_DELAY} />

                            <button
                                onClick={resetToIdle}
                                style={{
                                    marginTop: '1rem',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 12,
                                    padding: '0.875rem 2rem',
                                    fontSize: '0.875rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                <RotateCw size={16} /> Scan Next
                            </button>
                        </motion.div>
                    )}

                    {/* ERROR STATE */}
                    {phase === 'error' && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{
                                background: t.card,
                                backdropFilter: 'blur(20px)',
                                borderRadius: 24,
                                border: `1px solid ${t.errorBorder}`,
                                padding: '2.5rem 2rem',
                                textAlign: 'center',
                                boxShadow: t.cardShadow,
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <div style={{
                                width: 80, height: 80, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1.25rem',
                                boxShadow: '0 12px 40px rgba(239,68,68,0.3)',
                            }}>
                                <AlertCircle size={40} color="#fff" />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.75rem' }}>
                                Check-In Failed
                            </h2>
                            <p style={{ color: t.textMuted, fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                                {errorMsg}
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button
                                    onClick={startScanning}
                                    style={{
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 12,
                                        padding: '0.875rem 2rem',
                                        fontSize: '0.875rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                    }}
                                >
                                    <Camera size={16} /> Try Camera Again
                                </button>
                                <button
                                    onClick={resetToIdle}
                                    style={{
                                        background: t.btnSecondaryBg,
                                        color: t.btnSecondaryColor,
                                        border: `1px solid ${t.btnSecondaryBorder}`,
                                        borderRadius: 12,
                                        padding: '0.875rem 2rem',
                                        fontSize: '0.875rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                    }}
                                >
                                    <Keyboard size={16} /> Use Manual Entry
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                style={{ marginTop: '2rem', color: t.textDimmer, fontSize: '0.75rem', position: 'relative', zIndex: 1 }}
            >
                Aadhaar Queue Management System • Self Check-In Kiosk
            </motion.p>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                #qr-reader video {
                    border-radius: 12px !important;
                    object-fit: cover !important;
                }
                #qr-reader {
                    border: none !important;
                }
                #qr-reader img[alt="Info icon"] {
                    display: none !important;
                }
                #qr-reader__dashboard_section_csr button {
                    display: none !important;
                }
                #qr-reader__status_span {
                    display: none !important;
                }
                #qr-reader__header_message {
                    display: none !important;
                }
                #qr-reader__dashboard_section {
                    display: none !important;
                }
                #qr-reader__scan_region > img {
                    display: none !important;
                }
            `}</style>
        </div>
    );
};

// Countdown progress bar component
const CountdownBar = ({ duration }) => {
    return (
        <div style={{ width: '100%', height: 4, borderRadius: 10, background: 'rgba(99,102,241,0.12)', overflow: 'hidden' }}>
            <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                style={{ height: '100%', borderRadius: 10, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
            />
        </div>
    );
};

export default ScanQR;
