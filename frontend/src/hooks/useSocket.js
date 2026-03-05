import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '@store/authStore';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket = null;
let refCount = 0;

/**
 * Get or create a shared Socket.IO connection (singleton).
 * Only connects once even if multiple components use this hook.
 */
function getSocket(token) {
    if (!socket || socket.disconnected) {
        socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
        });

        socket.on('connect', () => {
            console.log('⚡ Socket connected:', socket.id);
        });

        socket.on('connect_error', (err) => {
            console.warn('⚡ Socket connection error:', err.message);
        });

        socket.on('disconnect', (reason) => {
            console.log('⚡ Socket disconnected:', reason);
        });
    }
    return socket;
}

/**
 * Hook to listen for a specific socket event.
 * 
 * @param {string} event - Socket event name (e.g. "queue:updated")
 * @param {Function} callback - Called when the event fires
 * 
 * Usage:
 *   useSocket("queue:updated", () => fetchQueue());
 */
export default function useSocket(event, callback) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    const token = useAuthStore((s) => s.token);

    useEffect(() => {
        if (!token) return;

        const s = getSocket(token);
        refCount++;

        const handler = (data) => {
            callbackRef.current(data);
        };

        s.on(event, handler);

        return () => {
            s.off(event, handler);
            refCount--;

            // Disconnect when no components are using the socket
            if (refCount <= 0) {
                refCount = 0;
                s.disconnect();
                socket = null;
            }
        };
    }, [event, token]);
}
