import { Router } from "express";
import keys from "../keys";
import { getIo } from "../socket";
import * as jwt from "jsonwebtoken";
import type { Socket } from "socket.io";
import { bindSocketToUser, getOnlineUsers } from "../socket";

class SocketRoutesClass {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    // Register an existing socket.id to a user after login
    this.router.post(`${keys.basePath}socket/register`, async (req, res) => {
      try {
        const { socketId, token, userId } = req.body || {};
        if (!socketId) {
          return res.status(400).json({ success: false, message: "socketId is required" });
        }
        const io = getIo();
        if (!io) return res.status(500).json({ success: false, message: "Socket server not ready" });
        const socket: Socket | undefined = io.sockets.sockets.get(String(socketId));
        if (!socket) return res.status(404).json({ success: false, message: "Socket not found" });

        let uid = userId as string | number | undefined;
        if (!uid && token) {
          try {
            const decoded: any = jwt.decode(String(token));
            uid = decoded?.userId || decoded?.sub;
          } catch {}
        }
        if (!uid) {
          return res.status(400).json({ success: false, message: "userId or token required" });
        }

        bindSocketToUser(socket, uid);
        (socket as any).data = (socket as any).data || {};
        (socket as any).data.userId = uid;
        // Persist socketId to Users
        try {
          const mysql = await import("mysql2/promise");
          const conn = await mysql.createConnection(keys.database as any);
          await conn.execute(`UPDATE Users SET socketId = ? WHERE userId = ?`, [String(socketId), uid]);
          await conn.end();
        } catch {}
        return res.json({ success: true, message: "Socket registered", socketId, userId: uid });
      } catch (e: any) {
        return res.status(500).json({ success: false, message: e?.message || "Error" });
      }
    });

    // Inspect currently online users (debug only)
    this.router.get(`${keys.basePath}socket/online`, (req, res) => {
      try {
        return res.json({ success: true, data: getOnlineUsers() });
      } catch (e: any) {
        return res.status(500).json({ success: false, message: e?.message || "Error" });
      }
    });
  }
}

const SocketRoutes = new SocketRoutesClass();
export default SocketRoutes.router;
