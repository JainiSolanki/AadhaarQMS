import { format, parseISO, isValid } from 'date-fns';

/**
 * Format ISO date string to readable format
 */
export const formatDate = (dateStr, fmt = 'dd MMM yyyy') => {
    if (!dateStr) return '—';
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return isValid(date) ? format(date, fmt) : '—';
};

/**
 * Format date to YYYY-MM-DD for API
 */
export const toAPIDate = (date) => {
    return format(date, 'yyyy-MM-dd');
};

/**
 * Format time slot nicely
 */
export const formatTimeSlot = (slot) => {
    if (!slot) return '—';
    const [start, end] = slot.split(' - ');
    const fmt = (t) => {
        const [h, m] = t.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${m} ${ampm}`;
    };
    return `${fmt(start)} — ${fmt(end)}`;
};

/**
 * Get CSS class for appointment status badge
 */
export const getStatusClass = (status) => {
    const map = {
        'Pending': 'status-pending',
        'Checked In': 'status-checked-in',
        'In Progress': 'status-in-progress',
        'Completed': 'status-completed',
        'Cancelled': 'status-cancelled',
        'No Show': 'status-no-show',
    };
    return map[status] || 'status-pending';
};

/**
 * Truncate text
 */
export const truncate = (str, len = 50) => {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '…' : str;
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

/**
 * Validate Indian phone number
 */
export const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

/**
 * Validate email
 */
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Get greeting based on time of day
 */
export const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

/**
 * Classname merger utility
 */
export const cn = (...classes) => classes.filter(Boolean).join(' ');
