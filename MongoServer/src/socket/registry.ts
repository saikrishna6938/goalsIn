export interface RegisteredSocket {
  socketId: string;
  userId: number;
  registeredAt: Date;
  lastSeen: Date;
  meta?: Record<string, unknown>;
}

const registry = new Map<string, RegisteredSocket>();

export const registerSocket = (socketId: string, userId: number, meta?: Record<string, unknown>) => {
  const normalizedId = String(socketId);
  const now = new Date();
  const existing = registry.get(normalizedId);
  const entry: RegisteredSocket = {
    socketId: normalizedId,
    userId,
    registeredAt: existing?.registeredAt ?? now,
    lastSeen: now,
    meta: meta ?? existing?.meta,
  };
  registry.set(normalizedId, entry);
  return entry;
};

export const unregisterSocket = (socketId: string) => {
  return registry.delete(String(socketId));
};

export const getOnlineUsers = () => {
  return Array.from(registry.values()).map((entry) => ({
    socketId: entry.socketId,
    userId: entry.userId,
    registeredAt: entry.registeredAt,
    lastSeen: entry.lastSeen,
    meta: entry.meta,
  }));
};
