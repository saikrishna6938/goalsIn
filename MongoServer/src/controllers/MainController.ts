import { Request, Response } from "express";
import { getMongoDb } from "../config/mongo";
import type { Users } from "../types/jotbox";
import { globalController } from "./GlobalController";

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const toBoolean = (value: any): boolean | null => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
  }
  return null;
};

const toDateValue = (value: any): Date | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
};

class MainController {
  private updatableFields: (keyof Users)[] = [
    "userName",
    "userEmail",
    "userPassword",
    "userFirstName",
    "userLastName",
    "userImage",
    "userAddress",
    "userServerEmail",
    "userPhoneOne",
    "userPhoneTwo",
    "userLastLogin",
    "userCreated",
    "userEnabled",
    "userLocked",
    "userType",
    "roles",
    "entities",
    "socketId",
    "lastNotesSeen",
  ];

  private numericFields = new Set<keyof Users>(["userType", "socketId"]);
  private booleanFields = new Set<keyof Users>(["userEnabled", "userLocked"]);
  private dateFields = new Set<keyof Users>(["userLastLogin", "userCreated", "lastNotesSeen"]);

  private coerceValue(field: keyof Users, value: any) {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (this.numericFields.has(field)) {
      const numeric = toNumber(value);
      if (numeric === null) {
        throw new Error(`${String(field)} must be a number`);
      }
      return numeric;
    }
    if (this.booleanFields.has(field)) {
      const boolVal = toBoolean(value);
      if (boolVal === null) {
        throw new Error(`${String(field)} must be a boolean value`);
      }
      return boolVal;
    }
    if (this.dateFields.has(field)) {
      const dateVal = toDateValue(value);
      if (dateVal === null) {
        throw new Error(`${String(field)} must be a valid date`);
      }
      return dateVal;
    }
    return value;
  }

  private extractUpdates(payload: Record<string, any>): Partial<Users> {
    const updates: Partial<Users> = {};
    for (const field of this.updatableFields) {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        const coerced = this.coerceValue(field, payload[field]);
        if (coerced !== undefined) {
          (updates as any)[field] = coerced;
        }
      }
    }
    return updates;
  }

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

  updateUser = async (req: Request, res: Response) => {
    try {
      const userId = toNumber(req.body?.userId);
      if (userId === null) {
        return res.status(400).json({ success: false, message: "userId is required" });
      }
      let updates: Partial<Users>;
      try {
        updates = this.extractUpdates(req.body ?? {});
      } catch (error) {
        return res.status(400).json({ success: false, message: (error as Error).message });
      }
      if (!Object.keys(updates).length) {
        return res.status(400).json({ success: false, message: "No valid fields to update" });
      }
      const db = await getMongoDb();
      const usersCollection = db.collection<Users>("Users");
      const result = await usersCollection.updateOne({ userId }, { $set: updates });
      if (!result.matchedCount) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      if (req.body?.userType === 2) {
        await globalController.assignDefaultRoleToUser(userId);
      }
      return res.json({
        success: true,
        message: "User details updated successfully",
        modifiedCount: result.modifiedCount ?? 0,
      });
    } catch (error) {
      console.error("updateUser error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}

export const mainController = new MainController();
