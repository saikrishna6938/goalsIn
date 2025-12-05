import { Request, Response } from "express";
import { getMongoDb } from "../config/mongo";
import type { Users } from "../types/jotbox";

const parseEntityFilter = (entities: string | undefined, entityId: number): boolean => {
  if (!entities) return false;
  const tokens = entities.split(",").map((value) => Number(value.trim())).filter(Number.isFinite);
  return tokens.includes(entityId);
};

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

class UserRolesManagerController {
  private async users() {
    const db = await getMongoDb();
    return db.collection<Users>("Users");
  }

  getUsersByEntityId = async (req: Request, res: Response) => {
    try {
      const entityId = toNumber(req.params.entityId);
      if (entityId === null) {
        return res.status(400).json({ success: false, message: "entityId is required" });
      }
      const userCollection = await this.users();
      const docs = await userCollection.find({}, { projection: { _id: 0 } }).toArray();
      const filtered = docs.filter((doc) => parseEntityFilter(doc.entities, entityId));
      return res.json({ success: true, data: filtered });
    } catch (error) {
      console.error("getUsersByEntityId error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  getusersforjob = async (req: Request, res: Response) => {
    try {
      const entityId = toNumber(req.params.entityId);
      const userType = toNumber(req.params.userType);
      if (entityId === null || userType === null) {
        return res.status(400).json({ success: false, message: "entityId and userType are required" });
      }
      const userCollection = await this.users();
      const docs = await userCollection.find({ userType }, { projection: { _id: 0 } }).toArray();
      const filtered = docs.filter((doc) => parseEntityFilter(doc.entities, entityId));
      return res.json({ success: true, data: filtered });
    } catch (error) {
      console.error("getusersforjob error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  deleteSuperUserRoles = async (req: Request, res: Response) => {
    try {
      const roleIds: Array<number> = Array.isArray(req.body?.roleIds) ? req.body.roleIds.map((id: any) => Number(id)) : [];
      if (!roleIds.length) {
        return res.status(400).json({ success: false, message: "roleIds are required" });
      }
      const db = await getMongoDb();
      const collection = db.collection("SuperUserRoles");
      const result = await collection.deleteMany({ superUserRoleId: { $in: roleIds } });
      return res.json({ success: true, deletedCount: result.deletedCount });
    } catch (error) {
      console.error("deleteSuperUserRoles error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}

export const userRolesManagerController = new UserRolesManagerController();
