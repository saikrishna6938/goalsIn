import { Request, Response } from "express";
import { getMongoDb } from "../../config/mongo";
import type { SuperRoleTypes } from "../../types/jotbox";

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

class AdminRolesManagerController {
  private async collection() {
    const db = await getMongoDb();
    return db.collection<SuperRoleTypes>("SuperRoleTypes");
  }

  private async nextId() {
    const collection = await this.collection();
    const doc = await collection.find({}, { projection: { roleTypeId: 1 } }).sort({ roleTypeId: -1 }).limit(1).next();
    return ((doc?.roleTypeId as number | undefined) ?? 0) + 1;
  }

  getSuperRoleTypes = async (_req: Request, res: Response) => {
    try {
      const collection = await this.collection();
      const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
      return res.json({ success: true, data: docs });
    } catch (error) {
      console.error("getSuperRoleTypes error", error);
      return res.status(500).json({ success: false, message: "An error occurred while fetching role types" });
    }
  };

  insertSuperRoleType = async (req: Request, res: Response) => {
    try {
      const roleTypeName = typeof req.body?.roleTypeName === "string" ? req.body.roleTypeName.trim() : "";
      if (!roleTypeName) {
        return res.status(400).json({ success: false, message: "roleTypeName is required" });
      }
      const collection = await this.collection();
      const roleTypeId = await this.nextId();
      await collection.insertOne({
        roleTypeId,
        roleTypeName,
        roleTypeDescription: typeof req.body?.roleTypeDescription === "string" ? req.body.roleTypeDescription : "",
        updatedDate: new Date() as any,
      } as SuperRoleTypes);
      return res.status(201).json({ success: true, message: "Role type inserted successfully" });
    } catch (error) {
      console.error("insertSuperRoleType error", error);
      return res.status(500).json({ success: false, message: "An error occurred while inserting role type" });
    }
  };

  updateSuperRoleType = async (req: Request, res: Response) => {
    try {
      const roleTypeId = toNumber(req.body?.roleTypeId);
      if (roleTypeId === null) {
        return res.status(400).json({ success: false, message: "roleTypeId is required" });
      }
      const updates: Partial<SuperRoleTypes> = {};
      if (typeof req.body?.roleTypeName === "string") updates.roleTypeName = req.body.roleTypeName;
      if (typeof req.body?.roleTypeDescription === "string") updates.roleTypeDescription = req.body.roleTypeDescription;
      if (!Object.keys(updates).length) {
        return res.status(400).json({ success: false, message: "No fields to update" });
      }
      updates.updatedDate = new Date() as any;
      const collection = await this.collection();
      const result = await collection.updateOne({ roleTypeId }, { $set: updates });
      if (!result.matchedCount) {
        return res.status(404).json({ success: false, message: "Role type not found" });
      }
      return res.json({ success: true, message: "Role type updated successfully" });
    } catch (error) {
      console.error("updateSuperRoleType error", error);
      return res.status(500).json({ success: false, message: "An error occurred while updating role type" });
    }
  };

  deleteSuperRoleType = async (req: Request, res: Response) => {
    try {
      const roleTypeId = toNumber(req.params?.roleTypeId);
      if (roleTypeId === null) {
        return res.status(400).json({ success: false, message: "roleTypeId is required" });
      }
      const collection = await this.collection();
      const result = await collection.deleteOne({ roleTypeId });
      if (!result.deletedCount) {
        return res.status(404).json({ success: false, message: "Role type not found" });
      }
      return res.json({ success: true, message: "Role type deleted successfully" });
    } catch (error) {
      console.error("deleteSuperRoleType error", error);
      return res.status(500).json({ success: false, message: "An error occurred while deleting role type" });
    }
  };
}

export const adminRolesController = new AdminRolesManagerController();
