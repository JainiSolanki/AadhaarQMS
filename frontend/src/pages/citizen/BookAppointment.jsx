import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Clock, FileText, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@components/layout/DashboardLayout';
import PageHeader from '@components/shared/PageHeader';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Card from '@components/ui/Card';
import { PageLoader } from '@components/ui/Loader';
import { centersAPI, servicesAPI, queueAPI, appointmentsAPI } from '@services/api';
import { formatTimeSlot, toAPIDate } from '@utils/helpers';
import { INDIAN_STATES } from '@utils/constants';

const STEPS = ['Center', 'Service', 'Date & Slot', 'Confirm'];

const BookAppointment = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [states, setStates] = useState([]);
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [centers, setCenters] = useState([]);
    const [services, setServices] = useState([]);
    const [slots, setSlots] = useState([]);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [name, setName] = useState('');
    const [aadhaarNumber, setAadhaarNumber] = useState('');

    useEffect(() => { loadCities(); loadServices(); }, []);

    const loadCities = async () => { try { const res = await centersAPI.getCities(); setStates(res.data || []); } catch { /* ignore */ } };
    const loadServices = async () => { try { const res = await servicesAPI.getAll(); setServices(res.data || []); } catch { /* ignore */ } };

    const loadCenters = async (state, city) => {
        setLoading(true);
        try { const params = {}; if (state) params.state = state; if (city) params.city = city; const res = await centersAPI.getAll(params); setCenters(res.data || []); }
        catch { toast.error('Failed to load centers'); } finally { setLoading(false); }
    };

    const loadSlots = async (centerId, date) => {
        setLoading(true);
        try { const res = await queueAPI.getAvailability(centerId, date); setSlots(res.slots || []); }
        catch { toast.error('Failed to load availability'); } finally { setLoading(false); }
    };

    const handleStateChange = (state) => { setSelectedState(state); setSelectedCity(''); setSelectedCenter(null); if (state) loadCenters(state); };
    const handleCityChange = (city) => { setSelectedCity(city); if (city) loadCenters(selectedState, city); };
    const handleDateChange = (date) => { setSelectedDate(date); setSelectedSlot(''); if (selectedCenter && date) loadSlots(selectedCenter.centerId, date); };

    const handleBook = async () => {
        if (!name.trim()) { toast.error('Please enter your name'); return; }
        setSubmitting(true);
        try {
            const data = { centerId: selectedCenter.centerId, serviceId: selectedService.serviceId, date: selectedDate, timeSlot: selectedSlot, name: name.trim() };
            if (aadhaarNumber.trim()) data.aadhaarNumber = aadhaarNumber.trim();
            const res = await appointmentsAPI.book(data);
            toast.success('Appointment booked!');
            navigate(`/citizen/appointments/${res.data.appointmentId}`);
        } catch (err) { toast.error(err.message || 'Booking failed'); } finally { setSubmitting(false); }
    };

    const canNext = () => {
        if (step === 0) return !!selectedCenter;
        if (step === 1) return !!selectedService;
        if (step === 2) return !!selectedDate && !!selectedSlot;
        return true;
    };

    const today = toAPIDate(new Date());
    const maxDate = toAPIDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    const cities = states.find((s) => s.state === selectedState)?.cities || [];

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <PageHeader title="Book Appointment" description="Follow the steps to book your Aadhaar service appointment." />

                {/* Progress Stepper */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '2rem',
                        overflowX: 'auto',
                        padding: '1rem 1.5rem',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-xl)',
                    }}
                >
                    {STEPS.map((s, i) => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                            <div
                                style={{
                                    width: '2rem',
                                    height: '2rem',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    transition: 'all 0.2s',
                                    ...(i < step
                                        ? { background: 'var(--color-success)', color: '#fff' }
                                        : i === step
                                            ? { background: 'var(--color-accent)', color: '#fff' }
                                            : { background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }),
                                }}
                            >
                                {i < step ? <CheckCircle2 size={16} /> : i + 1}
                            </div>
                            <span
                                style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: i === step ? 'var(--text-primary)' : 'var(--text-tertiary)',
                                }}
                            >
                                {s}
                            </span>
                            {i < STEPS.length - 1 && (
                                <ChevronRight size={14} style={{ color: 'var(--text-tertiary)', margin: '0 0.25rem' }} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div
                    style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-2xl)',
                        padding: '2rem',
                        minHeight: '20rem',
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>

                            {/* Step 0: Select Center */}
                            {step === 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>State</label>
                                            <select value={selectedState} onChange={(e) => handleStateChange(e.target.value)}>
                                                <option value="">Select State</option>
                                                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>City</label>
                                            <select value={selectedCity} onChange={(e) => handleCityChange(e.target.value)} disabled={!selectedState}>
                                                <option value="">All Cities</option>
                                                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {loading ? (
                                        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                            <div className="animate-spin" style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '3px solid var(--color-accent)', borderTopColor: 'transparent', margin: '0 auto' }} />
                                        </div>
                                    ) : centers.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-tertiary)' }}>
                                            <MapPin size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                                            <p style={{ fontSize: '0.875rem' }}>Select a state to see available centers.</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                                            {centers.map((center) => (
                                                <div
                                                    key={center.centerId}
                                                    onClick={() => setSelectedCenter(center)}
                                                    className="cursor-pointer transition-all"
                                                    style={{
                                                        padding: '1.25rem',
                                                        borderRadius: 'var(--radius-xl)',
                                                        ...(selectedCenter?.centerId === center.centerId
                                                            ? { border: '2px solid var(--color-accent)', background: 'rgba(255,107,43,0.05)', boxShadow: 'var(--shadow-glow)' }
                                                            : { border: '1px solid var(--border-default)', background: 'var(--bg-elevated)' }),
                                                    }}
                                                >
                                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>{center.name}</h3>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{center.address}, {center.city}</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{center.state} - {center.pincode}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 1: Select Service */}
                            {step === 1 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                                    {services.map((svc) => (
                                        <div
                                            key={svc.serviceId}
                                            onClick={() => setSelectedService(svc)}
                                            className="cursor-pointer transition-all"
                                            style={{
                                                padding: '1.25rem',
                                                borderRadius: 'var(--radius-xl)',
                                                ...(selectedService?.serviceId === svc.serviceId
                                                    ? { border: '2px solid var(--color-accent)', background: 'rgba(255,107,43,0.05)', boxShadow: 'var(--shadow-glow)' }
                                                    : { border: '1px solid var(--border-default)', background: 'var(--bg-elevated)' }),
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                                                <div
                                                    className="shrink-0"
                                                    style={{
                                                        width: '2.5rem',
                                                        height: '2.5rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: 'var(--radius-md)',
                                                        background: 'rgba(255,107,43,0.1)',
                                                        marginTop: '0.125rem',
                                                    }}
                                                >
                                                    <FileText size={16} style={{ color: 'var(--color-accent)' }} />
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{svc.name}</h3>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.5, marginBottom: '0.35rem' }}>{svc.description}</p>
                                                    <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Duration: {svc.duration} min</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Step 2: Select Date & Slot */}
                            {step === 2 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ maxWidth: '18rem' }}>
                                        <Input label="Select Date" type="date" icon={Calendar} value={selectedDate} min={today} max={maxDate} onChange={(e) => handleDateChange(e.target.value)} />
                                    </div>
                                    {selectedDate && (
                                        loading ? (
                                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                                <div className="animate-spin" style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '3px solid var(--color-accent)', borderTopColor: 'transparent', margin: '0 auto' }} />
                                            </div>
                                        ) : (
                                            <div>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Available Slots</p>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                                                    {slots.map((slot) => {
                                                        const available = !slot.isFull;
                                                        const remaining = (slot.capacity || 4) - (slot.booked || 0);
                                                        return (
                                                            <div
                                                                key={slot.timeSlot}
                                                                onClick={() => available && setSelectedSlot(slot.timeSlot)}
                                                                className="transition-all"
                                                                style={{
                                                                    padding: '1rem',
                                                                    textAlign: 'center',
                                                                    borderRadius: 'var(--radius-lg)',
                                                                    ...(!available
                                                                        ? { opacity: 0.4, cursor: 'not-allowed', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }
                                                                        : selectedSlot === slot.timeSlot
                                                                            ? { border: '2px solid var(--color-accent)', background: 'rgba(255,107,43,0.05)', boxShadow: 'var(--shadow-glow)', cursor: 'pointer' }
                                                                            : { border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', cursor: 'pointer' }),
                                                                }}
                                                            >
                                                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{formatTimeSlot(slot.timeSlot)}</p>
                                                                <p style={{ fontSize: '0.75rem', marginTop: '0.35rem', color: available ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                                                    {available ? `${remaining} left` : 'Full'}
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}

                            {/* Step 3: Confirm */}
                            {step === 3 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Booking Summary</h3>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.75rem',
                                                padding: '1.25rem',
                                                background: 'var(--bg-elevated)',
                                                borderRadius: 'var(--radius-xl)',
                                                border: '1px solid var(--border-subtle)',
                                            }}
                                        >
                                            {[
                                                ['Center', selectedCenter?.name],
                                                ['Service', selectedService?.name],
                                                ['Date', selectedDate],
                                                ['Time', formatTimeSlot(selectedSlot)],
                                            ].map(([label, value]) => (
                                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                                    <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                                        <Input label="Your Name *" type="text" placeholder="Full name as per Aadhaar" value={name} onChange={(e) => setName(e.target.value)} />
                                        <Input label="Aadhaar Number (Optional)" type="text" placeholder="12-digit Aadhaar number" value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value)} maxLength={12} />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '1.5rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid var(--border-subtle)',
                    }}
                >
                    <Button variant="secondary" icon={ChevronLeft} onClick={() => setStep(step - 1)} disabled={step === 0}>Back</Button>
                    {step < STEPS.length - 1 ? (
                        <Button icon={ChevronRight} onClick={() => setStep(step + 1)} disabled={!canNext()}>Continue</Button>
                    ) : (
                        <Button loading={submitting} onClick={handleBook} disabled={!name.trim()}>Confirm Booking</Button>
                    )}
                </div>
            </motion.div>
        </DashboardLayout>
    );
};

export default BookAppointment;
