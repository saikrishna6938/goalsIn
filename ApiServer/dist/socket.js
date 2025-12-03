"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToSocketIds = exports.isUserOnline = exports.getOnlineUsers = exports.getUserSockets = exports.unbindSocket = exports.bindSocketToUser = exports.getIo = exports.notifyUsers = exports.userRoom = exports.setIo = void 0;
let io;
const setIo = (server) => {
    io = server;
};
exports.setIo = setIo;
const userRoom = (userId) => `user:${userId}`;
exports.userRoom = userRoom;
const notifyUsers = (userIds, event, payload) => {
    if (!io || !(userIds === null || userIds === void 0 ? void 0 : userIds.length))
        return;
    for (const uid of userIds) {
        io.to((0, exports.userRoom)(uid)).emit(event, payload);
    }
};
exports.notifyUsers = notifyUsers;
const getIo = () => io;
exports.getIo = getIo;
// In-memory user <-> socket registry for debugging/targeted introspection
const userSockets = new Map();
const socketUser = new Map();
function bindSocketToUser(socket, userId) {
    try {
        socket.join((0, exports.userRoom)(userId));
    }
    catch (_a) { }
    // track mapping
    socketUser.set(socket.id, userId);
    if (!userSockets.has(userId))
        userSockets.set(userId, new Set());
    userSockets.get(userId).add(socket.id);
}
exports.bindSocketToUser = bindSocketToUser;
function unbindSocket(socket) {
    const userId = socketUser.get(socket.id);
    if (userId !== undefined) {
        const set = userSockets.get(userId);
        if (set) {
            set.delete(socket.id);
            if (set.size === 0)
                userSockets.delete(userId);
        }
        socketUser.delete(socket.id);
    }
}
exports.unbindSocket = unbindSocket;
function getUserSockets(userId) {
    return Array.from(userSockets.get(userId) || []);
}
exports.getUserSockets = getUserSockets;
function getOnlineUsers() {
    const arr = [];
    for (const [uid, set] of userSockets.entries()) {
        arr.push({ userId: uid, count: set.size });
    }
    return arr;
}
exports.getOnlineUsers = getOnlineUsers;
function isUserOnline(userId) {
    var _a;
    return (((_a = userSockets.get(userId)) === null || _a === void 0 ? void 0 : _a.size) || 0) > 0;
}
exports.isUserOnline = isUserOnline;
// Emit directly to specific socket IDs (bypasses rooms), best-effort
function emitToSocketIds(socketIds, event, payload) {
    if (!io || !(socketIds === null || socketIds === void 0 ? void 0 : socketIds.length))
        return;
    for (const sid of socketIds) {
        const sock = io.sockets.sockets.get(String(sid));
        if (sock)
            sock.emit(event, payload);
    }
}
exports.emitToSocketIds = emitToSocketIds;
//# sourceMappingURL=socket.js.map