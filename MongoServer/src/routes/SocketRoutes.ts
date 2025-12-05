import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { withBasePath } from "../utils/routeHelpers";
import { registerSocket, getOnlineUsers } from "../socket/registry";
import { getMongoDb } from "../config/mongo";
import type { Users } from "../types/jotbox";

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const normalizeSocketId = (value: any): string => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (value !== undefined && value !== null) return String(value);
  return "";
};

class SocketRoutesClass {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private async usersCollection() {
    const db = await getMongoDb();
    return db.collection<Users>("Users");
  }

  private config() {
    const base = withBasePath("socket");
    this.router.post(`${base}/register`, (req, res) => this.registerSocket(req, res));
    this.router.get(`${base}/online`, (_req, res) => {
      try {
        return res.json({ success: true, data: getOnlineUsers() });
      } catch (error: any) {
        return res.status(500).json({ success: false, message: error?.message ?? "Error" });
      }
    });
  }

  private async registerSocket(req: Request, res: Response) {
    try {
      const socketId = normalizeSocketId(req.body?.socketId ?? req.body?.socketID);
      if (!socketId) {
        return res.status(400).json({ success: false, message: "socketId is required" });
      }
      const token = req.body?.token;
      let userId = toNumber(req.body?.userId);
      if (userId === null && token) {
        try {
          const decoded: any = jwt.decode(String(token));
          userId = toNumber(decoded?.userId ?? decoded?.sub);
        } catch {}
      }
      if (userId === null) {
        return res.status(400).json({ success: false, message: "userId or token required" });
      }

      const usersCollection = await this.usersCollection();
      const updateResult = await usersCollection.updateOne(
        { userId },
        { $set: { socketId: (socketId as unknown as number) } }
      );
      if (!updateResult.matchedCount) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const entry = registerSocket(socketId, userId, { via: "api-register" });
      return res.json({ success: true, message: "Socket registered", data: entry });
    } catch (error: any) {
      console.error("registerSocket error", error);
      return res.status(500).json({ success: false, message: error?.message ?? "Error" });
    }
  }
}

const SocketRoutes = new SocketRoutesClass();
export default SocketRoutes.router;
