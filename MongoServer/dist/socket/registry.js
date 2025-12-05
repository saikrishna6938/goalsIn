"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnlineUsers = exports.unregisterSocket = exports.registerSocket = void 0;
const registry = new Map();
const registerSocket = (socketId, userId, meta) => {
    const normalizedId = String(socketId);
    const now = new Date();
    const existing = registry.get(normalizedId);
    const entry = {
        socketId: normalizedId,
        userId,
        registeredAt: existing?.registeredAt ?? now,
        lastSeen: now,
        meta: meta ?? existing?.meta,
    };
    registry.set(normalizedId, entry);
    return entry;
};
exports.registerSocket = registerSocket;
const unregisterSocket = (socketId) => {
    return registry.delete(String(socketId));
};
exports.unregisterSocket = unregisterSocket;
const getOnlineUsers = () => {
    return Array.from(registry.values()).map((entry) => ({
        socketId: entry.socketId,
        userId: entry.userId,
        registeredAt: entry.registeredAt,
        lastSeen: entry.lastSeen,
        meta: entry.meta,
    }));
};
exports.getOnlineUsers = getOnlineUsers;
