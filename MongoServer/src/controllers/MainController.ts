import { Request, Response } from "express";
import { getMongoDb } from "../config/mongo";
import type { Users } from "../types/jotbox";

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

class MainController {
  getUser = async (req: Request, res: Response) => {
    try {
      const { userId: rawUserId } = req.body || {};
      const userId = toNumber(rawUserId);
      if (userId === null) {
        return res.status(400).json({ success: false, message: "userId is required" });
      }
      const db = await getMongoDb();
      const user = await db.collection<Users>("Users").findOne({ userId }, { projection: { _id: 0 } });
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      return res.json({ success: true, data: user });
    } catch (error) {
      console.error("getUser error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}

export const mainController = new MainController();
