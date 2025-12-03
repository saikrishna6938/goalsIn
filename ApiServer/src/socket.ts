import type { Server, Socket } from "socket.io";

let io: Server | undefined;

export const setIo = (server: Server) => {
  io = server;
};

export const userRoom = (userId: string | number) => `user:${userId}`;

export const notifyUsers = (
  userIds: Array<string | number>,
  event: string,
  payload: any
) => {
  if (!io || !userIds?.length) return;
  for (const uid of userIds) {
    io.to(userRoom(uid)).emit(event, payload);
  }
};

export const getIo = () => io;

// In-memory user <-> socket registry for debugging/targeted introspection
const userSockets = new Map<string | number, Set<string>>();
const socketUser = new Map<string, string | number>();

export function bindSocketToUser(socket: Socket, userId: string | number) {
  try {
    socket.join(userRoom(userId));
  } catch {}
  // track mapping
  socketUser.set(socket.id, userId);
  if (!userSockets.has(userId)) userSockets.set(userId, new Set());
  userSockets.get(userId)!.add(socket.id);
}

export function unbindSocket(socket: Socket) {
  const userId = socketUser.get(socket.id);
  if (userId !== undefined) {
    const set = userSockets.get(userId);
    if (set) {
      set.delete(socket.id);
      if (set.size === 0) userSockets.delete(userId);
    }
    socketUser.delete(socket.id);
  }
}

export function getUserSockets(userId: string | number): string[] {
  return Array.from(userSockets.get(userId) || []);
}

export function getOnlineUsers(): Array<{ userId: string | number; count: number }> {
  const arr: Array<{ userId: string | number; count: number }> = [];
  for (const [uid, set] of userSockets.entries()) {
    arr.push({ userId: uid, count: set.size });
  }
  return arr;
}

export function isUserOnline(userId: string | number): boolean {
  return (userSockets.get(userId)?.size || 0) > 0;
}

// Emit directly to specific socket IDs (bypasses rooms), best-effort
export function emitToSocketIds(
  socketIds: string[],
  event: string,
  payload: any
) {
  if (!io || !socketIds?.length) return;
  for (const sid of socketIds) {
    const sock = io.sockets.sockets.get(String(sid));
    if (sock) sock.emit(event, payload);
  }
}
