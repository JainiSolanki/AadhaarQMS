const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { ROLES } = require("../utils/constants");

let io = null;

// Map: operatorId → Set<socketId> (operator may have multiple tabs)
const operatorSockets = new Map();

/**
 * Initialize Socket.IO on the HTTP server.
 */
function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
        },
    });

    // Authenticate on connection using JWT
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("Authentication required"));

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded; // { id, email, role, centerId }
            next();
        } catch {
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        const { id: userId, role } = socket.user;

        // Only track operator connections
        if (role === ROLES.OPERATOR) {
            if (!operatorSockets.has(userId)) {
                operatorSockets.set(userId, new Set());
            }
            operatorSockets.get(userId).add(socket.id);
            console.log(`🔌 Operator connected: ${userId} (${operatorSockets.get(userId).size} tab(s))`);

            // Join a room named after the operator for easy targeting
            socket.join(`operator:${userId}`);

            // Join center room so notifyCenter reaches all operators in this center
            if (socket.user.centerId) {
                socket.join(`center:${socket.user.centerId}`);
            }
        }

        socket.on("disconnect", () => {
            if (role === ROLES.OPERATOR) {
                const sockets = operatorSockets.get(userId);
                if (sockets) {
                    sockets.delete(socket.id);
                    if (sockets.size === 0) {
                        operatorSockets.delete(userId);
                        console.log(`🔌 Operator disconnected: ${userId}`);
                    }
                }
            }
        });
    });

    console.log("⚡ Socket.IO initialized");
    return io;
}

/**
 * Send an event to a specific operator (all their tabs/windows).
 */
function notifyOperator(operatorId, event, data) {
    if (!io) return;
    io.to(`operator:${operatorId}`).emit(event, data);
}

/**
 * Send an event to all operators in a center.
 */
function notifyCenter(centerId, event, data) {
    if (!io) return;
    // Emit to the center-specific room
    io.to(`center:${centerId}`).emit(event, { ...data, centerId });
}

function getIO() {
    return io;
}

module.exports = { initSocket, notifyOperator, notifyCenter, getIO };
