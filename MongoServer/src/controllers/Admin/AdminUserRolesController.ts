import { Request, Response } from "express";
import { getMongoDb } from "../../config/mongo";
import type { SuperUserRoles } from "../../types/jotbox";

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

class AdminUserRolesController {
  private async collection() {
    const db = await getMongoDb();
    return db.collection<SuperUserRoles>("SuperUserRoles");
  }

  private async nextId() {
    const collection = await this.collection();
    const doc = await collection.find({}, { projection: { superUserRoleId: 1 } }).sort({ superUserRoleId: -1 }).limit(1).next();
    return ((doc?.superUserRoleId as number | undefined) ?? 0) + 1;
  }

  getSuperUserRoles = async (_req: Request, res: Response) => {
    try {
      const collection = await this.collection();
      const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
      return res.json({ success: true, data: docs });
    } catch (error) {
      console.error("getSuperUserRoles error", error);
      return res.status(500).json({ success: false, message: "An error occurred while fetching user roles" });
    }
  };

  insertSuperUserRole = async (req: Request, res: Response) => {
    try {
      const userId = toNumber(req.body?.userId);
      const userRoleNameId = toNumber(req.body?.userRoleNameId);
      if (userId === null || userRoleNameId === null) {
        return res.status(400).json({ success: false, message: "userId and userRoleNameId are required" });
      }
      const collection = await this.collection();
      await collection.insertOne({
        superUserRoleId: await this.nextId(),
        userId,
        userRoleNameId,
        updatedDate: new Date() as any,
      } as SuperUserRoles);
      return res.status(201).json({ success: true, message: "User role inserted successfully" });
    } catch (error) {
      console.error("insertSuperUserRole error", error);
      return res.status(500).json({ success: false, message: "An error occurred while inserting user role" });
    }
  };

  updateSuperUserRole = async (req: Request, res: Response) => {
    try {
      const superUserRoleId = toNumber(req.body?.superUserRoleId);
      if (superUserRoleId === null) {
        return res.status(400).json({ success: false, message: "superUserRoleId is required" });
      }
      const updates: Partial<SuperUserRoles> = {};
      const userId = toNumber(req.body?.userId);
      const userRoleNameId = toNumber(req.body?.userRoleNameId);
      if (userId !== null) updates.userId = userId;
      if (userRoleNameId !== null) updates.userRoleNameId = userRoleNameId;
      if (!Object.keys(updates).length) {
        return res.status(400).json({ success: false, message: "No fields to update" });
      }
      updates.updatedDate = new Date() as any;
      const collection = await this.collection();
      const result = await collection.updateOne({ superUserRoleId }, { $set: updates });
      if (!result.matchedCount) {
        return res.status(404).json({ success: false, message: "User role not found" });
      }
      return res.json({ success: true, message: "User role updated successfully" });
    } catch (error) {
      console.error("updateSuperUserRole error", error);
      return res.status(500).json({ success: false, message: "An error occurred while updating user role" });
    }
  };

  insertMultipleSuperUserRoles = async (req: Request, res: Response) => {
    try {
      const roles: Array<{ userId?: number; userRoleNameId?: number }> = Array.isArray(req.body?.roles)
        ? req.body.roles
        : [];
      if (!roles.length) {
        return res.status(400).json({ success: false, message: "roles array is required" });
      }
      const collection = await this.collection();
      const docs: SuperUserRoles[] = [];
      for (const role of roles) {
        const userId = toNumber(role.userId);
        const userRoleNameId = toNumber(role.userRoleNameId);
        if (userId === null || userRoleNameId === null) continue;
        docs.push({
          superUserRoleId: await this.nextId(),
          userId,
          userRoleNameId,
          updatedDate: new Date() as any,
        } as SuperUserRoles);
      }
      if (!docs.length) {
        return res.status(400).json({ success: false, message: "No valid roles provided" });
      }
      await collection.insertMany(docs);
      return res.status(201).json({ success: true, message: "User roles inserted successfully" });
    } catch (error) {
      console.error("insertMultipleSuperUserRoles error", error);
      return res.status(500).json({ success: false, message: "An error occurred while inserting user roles" });
    }
  };

  updateMultipleSuperUserRoles = async (req: Request, res: Response) => {
    try {
      const updates: Array<{ superUserRoleId?: number; userRoleNameId?: number }> = Array.isArray(req.body?.roles)
        ? req.body.roles
        : [];
      if (!updates.length) {
        return res.status(400).json({ success: false, message: "roles array is required" });
      }
      const collection = await this.collection();
      for (const item of updates) {
        const superUserRoleId = toNumber(item.superUserRoleId);
        const userRoleNameId = toNumber(item.userRoleNameId);
        if (superUserRoleId === null || userRoleNameId === null) continue;
        await collection.updateOne(
          { superUserRoleId },
          { $set: { userRoleNameId, updatedDate: new Date() as any } }
        );
      }
      return res.json({ success: true, message: "User roles updated successfully" });
    } catch (error) {
      console.error("updateMultipleSuperUserRoles error", error);
      return res.status(500).json({ success: false, message: "An error occurred while updating user roles" });
    }
  };

  getSuperUserRolesByUserId = async (req: Request, res: Response) => {
    try {
      const userId = toNumber(req.params?.userId);
      if (userId === null) {
        return res.status(400).json({ success: false, message: "userId is required" });
      }
      const collection = await this.collection();
      const docs = await collection.find({ userId }, { projection: { _id: 0 } }).toArray();
      return res.json({ success: true, data: docs });
    } catch (error) {
      console.error("getSuperUserRolesByUserId error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}

export const adminUserRolesController = new AdminUserRolesController();
