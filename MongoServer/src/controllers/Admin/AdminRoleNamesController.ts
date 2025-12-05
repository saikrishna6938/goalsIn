import { Request, Response } from "express";
import { getMongoDb } from "../../config/mongo";
import type { SuperRoleNames } from "../../types/jotbox";

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

class AdminRoleNamesController {
  private async collection() {
    const db = await getMongoDb();
    return db.collection<SuperRoleNames>("SuperRoleNames");
  }

  private async nextId() {
    const collection = await this.collection();
    const doc = await collection.find({}, { projection: { roleNameId: 1 } }).sort({ roleNameId: -1 }).limit(1).next();
    return ((doc?.roleNameId as number | undefined) ?? 0) + 1;
  }

  getSuperRoleNames = async (_req: Request, res: Response) => {
    try {
      const collection = await this.collection();
      const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
      return res.json({ success: true, data: docs });
    } catch (error) {
      console.error("getSuperRoleNames error", error);
      return res.status(500).json({ success: false, message: "An error occurred while fetching role names" });
    }
  };

  insertSuperRoleName = async (req: Request, res: Response) => {
    try {
      const roleTypeId = toNumber(req.body?.roleTypeId);
      const roleName = typeof req.body?.roleName === "string" ? req.body.roleName.trim() : "";
      if (roleTypeId === null || !roleName) {
        return res.status(400).json({ success: false, message: "roleTypeId and roleName are required" });
      }
      const collection = await this.collection();
      await collection.insertOne({
        roleNameId: await this.nextId(),
        roleTypeId,
        roleName,
        roleNameDescription: typeof req.body?.roleNameDescription === "string" ? req.body.roleNameDescription : "",
      } as SuperRoleNames);
      return res.status(201).json({ success: true, message: "Role name inserted successfully" });
    } catch (error) {
      console.error("insertSuperRoleName error", error);
      return res.status(500).json({ success: false, message: "An error occurred while inserting role name" });
    }
  };

  updateSuperRoleName = async (req: Request, res: Response) => {
    try {
      const roleNameId = toNumber(req.body?.roleNameId);
      if (roleNameId === null) {
        return res.status(400).json({ success: false, message: "roleNameId is required" });
      }
      const updates: Partial<SuperRoleNames> = {};
      const roleTypeId = toNumber(req.body?.roleTypeId);
      if (roleTypeId !== null) updates.roleTypeId = roleTypeId;
      if (typeof req.body?.roleName === "string") updates.roleName = req.body.roleName;
      if (typeof req.body?.roleNameDescription === "string") updates.roleNameDescription = req.body.roleNameDescription;
      if (!Object.keys(updates).length) {
        return res.status(400).json({ success: false, message: "No fields to update" });
      }
      const collection = await this.collection();
      const result = await collection.updateOne({ roleNameId }, { $set: updates });
      if (!result.matchedCount) {
        return res.status(404).json({ success: false, message: "Role name not found" });
      }
      return res.json({ success: true, message: "Role name updated successfully" });
    } catch (error) {
      console.error("updateSuperRoleName error", error);
      return res.status(500).json({ success: false, message: "An error occurred while updating role name" });
    }
  };

  deleteSuperRoleName = async (req: Request, res: Response) => {
    try {
      const roleNameId = toNumber(req.params?.roleNameId);
      if (roleNameId === null) {
        return res.status(400).json({ success: false, message: "roleNameId is required" });
      }
      const collection = await this.collection();
      const result = await collection.deleteOne({ roleNameId });
      if (!result.deletedCount) {
        return res.status(404).json({ success: false, message: "Role name not found" });
      }
      return res.json({ success: true, message: "Role name deleted successfully" });
    } catch (error) {
      console.error("deleteSuperRoleName error", error);
      return res.status(500).json({ success: false, message: "An error occurred while deleting role name" });
    }
  };
}

export const adminRoleNamesController = new AdminRoleNamesController();
