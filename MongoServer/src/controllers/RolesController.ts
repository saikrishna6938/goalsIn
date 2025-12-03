import { Request, Response } from "express";
import type { Collection } from "mongodb";
import { getMongoDb } from "../config/mongo";
import type { Roles, RoleTypes } from "../types/jotbox";

type RoleDocument = Roles & { documentTypeId?: number };
type RoleTypeDocument = RoleTypes & { documentTypeId?: number };

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const normalizeString = (value: any): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }
  return undefined;
};

class RolesController {
  private async rolesCollection(): Promise<Collection<RoleDocument>> {
    const db = await getMongoDb();
    return db.collection<RoleDocument>("Roles");
  }

  private async roleTypesCollection(): Promise<Collection<RoleTypeDocument>> {
    const db = await getMongoDb();
    return db.collection<RoleTypeDocument>("RoleTypes");
  }

  private async nextRoleId(): Promise<number> {
    const coll = await this.rolesCollection();
    const doc = await coll.find().project({ roleId: 1 }).sort({ roleId: -1 }).limit(1).next();
    return (doc?.roleId ?? 0) + 1;
  }

  private async nextRoleTypeId(): Promise<number> {
    const coll = await this.roleTypesCollection();
    const doc = await coll.find().project({ roleTypeId: 1 }).sort({ roleTypeId: -1 }).limit(1).next();
    return (doc?.roleTypeId ?? 0) + 1;
  }

  addRole = async (req: Request, res: Response) => {
    try {
      const payload = req.body || {};
      const roleTypeId = toNumber(payload.roleTypeId);
      const roleName = normalizeString(payload.roleName);
      const roleDescription = normalizeString(payload.roleDescription);
      if (roleTypeId === null || !roleName || !roleDescription) {
        return res.status(400).json({ success: false, message: "Missing required role fields" });
      }
      const roleId = toNumber(payload.roleId) ?? (await this.nextRoleId());
      const doc: RoleDocument = {
        roleId,
        roleTypeId,
        roleName,
        roleDescription,
        entities: normalizeString(payload.entities),
        roles: normalizeString(payload.roles) ?? "1",
        documentTypeId: toNumber(payload.documentTypeId) ?? undefined,
      };
      const coll = await this.rolesCollection();
      const existing = await coll.findOne({ roleId });
      if (existing) {
        return res.status(409).json({ success: false, message: "Role with this ID already exists" });
      }
      await coll.insertOne(doc);
      return res.json({ success: true, message: "Role added successfully", roleId });
    } catch (error) {
      console.error("addRole error", error);
      return res.status(500).json({ success: false, message: "Failed to add role" });
    }
  };

  getRoles = async (_req: Request, res: Response) => {
    try {
      const coll = await this.rolesCollection();
      const data = await coll.find({}, { projection: { _id: 0 } }).toArray();
      return res.json({ success: true, message: "Success", data });
    } catch (error) {
      console.error("getRoles error", error);
      return res.status(500).json({ success: false, message: "Failed to get roles" });
    }
  };

  getRolesById = async (req: Request, res: Response) => {
    try {
      const roleId = toNumber(req.params.roleId);
      if (roleId === null) {
        return res.status(400).json({ success: false, message: "Invalid roleId" });
      }
      const coll = await this.rolesCollection();
      const doc = await coll.findOne({ roleId }, { projection: { _id: 0 } });
      if (!doc) {
        return res.json({ success: true, message: "Success", data: {} });
      }
      return res.json({ success: true, message: "Success", data: doc });
    } catch (error) {
      console.error("getRolesById error", error);
      return res.status(500).json({ success: false, message: "Failed to get role" });
    }
  };

  updateRole = async (req: Request, res: Response) => {
    try {
      const roleId = toNumber(req.params.roleId);
      if (roleId === null) {
        return res.status(400).json({ success: false, message: "Invalid roleId" });
      }
      const payload = req.body || {};
      const updates: Partial<RoleDocument> = {};
      const roleTypeId = toNumber(payload.roleTypeId);
      const roleName = normalizeString(payload.roleName);
      const roleDescription = normalizeString(payload.roleDescription);
      const entities = normalizeString(payload.entities);
      const rolesField = normalizeString(payload.roles);
      const documentTypeId = toNumber(payload.documentTypeId);
      if (roleTypeId !== null) updates.roleTypeId = roleTypeId;
      if (roleName) updates.roleName = roleName;
      if (roleDescription) updates.roleDescription = roleDescription;
      if (entities !== undefined) updates.entities = entities;
      if (rolesField) updates.roles = rolesField;
      if (documentTypeId !== null) updates.documentTypeId = documentTypeId;
      if (!Object.keys(updates).length) {
        return res.status(400).json({ success: false, message: "No valid fields provided for update" });
      }
      const coll = await this.rolesCollection();
      const result = await coll.updateOne({ roleId }, { $set: updates });
      if (!result.matchedCount) {
        return res.status(404).json({ success: false, message: "Role not found" });
      }
      return res.json({ success: true, message: "Role updated successfully" });
    } catch (error) {
      console.error("updateRole error", error);
      return res.status(500).json({ success: false, message: "Failed to update role" });
    }
  };

  deleteRole = async (req: Request, res: Response) => {
    try {
      const roleId = toNumber(req.params.roleId);
      if (roleId === null) {
        return res.status(400).json({ success: false, message: "Invalid roleId" });
      }
      const coll = await this.rolesCollection();
      const result = await coll.deleteOne({ roleId });
      if (!result.deletedCount) {
        return res.status(404).json({ success: false, message: "Role not found" });
      }
      return res.json({ success: true, message: "Role deleted successfully" });
    } catch (error) {
      console.error("deleteRole error", error);
      return res.status(500).json({ success: false, message: "Failed to delete role" });
    }
  };

  addRoleType = async (req: Request, res: Response) => {
    try {
      const payload = req.body || {};
      const roleTypeName = normalizeString(payload.roleTypeName);
      const roleTypeDescription = normalizeString(payload.roleTypeDescription);
      if (!roleTypeName || !roleTypeDescription) {
        return res.status(400).json({ success: false, message: "Missing required role type fields" });
      }
      const roleTypeId = toNumber(payload.roleTypeId) ?? (await this.nextRoleTypeId());
      const doc: RoleTypeDocument = {
        roleTypeId,
        roleTypeName,
        roleTypeDescription,
        documentTypeId: toNumber(payload.documentTypeId) ?? undefined,
      };
      const coll = await this.roleTypesCollection();
      const existing = await coll.findOne({ roleTypeId });
      if (existing) {
        return res.status(409).json({ success: false, message: "Role type with this ID already exists" });
      }
      await coll.insertOne(doc);
      return res.json({ success: true, message: "Role type added successfully", roleTypeId });
    } catch (error) {
      console.error("addRoleType error", error);
      return res.status(500).json({ success: false, message: "Failed to add role type" });
    }
  };

  getRoleTypes = async (_req: Request, res: Response) => {
    try {
      const coll = await this.roleTypesCollection();
      const data = await coll.find({}, { projection: { _id: 0 } }).toArray();
      return res.json({ success: true, message: "Success", data });
    } catch (error) {
      console.error("getRoleTypes error", error);
      return res.status(500).json({ success: false, message: "Failed to get role types" });
    }
  };

  updateRoleType = async (req: Request, res: Response) => {
    try {
      const roleTypeId = toNumber(req.params.roleTypeId);
      if (roleTypeId === null) {
        return res.status(400).json({ success: false, message: "Invalid roleTypeId" });
      }
      const payload = req.body || {};
      const updates: Partial<RoleTypeDocument> = {};
      const roleTypeName = normalizeString(payload.roleTypeName);
      const roleTypeDescription = normalizeString(payload.roleTypeDescription);
      const documentTypeId = toNumber(payload.documentTypeId);
      if (roleTypeName) updates.roleTypeName = roleTypeName;
      if (roleTypeDescription) updates.roleTypeDescription = roleTypeDescription;
      if (documentTypeId !== null) updates.documentTypeId = documentTypeId;
      if (!Object.keys(updates).length) {
        return res.status(400).json({ success: false, message: "No valid fields provided for update" });
      }
      const coll = await this.roleTypesCollection();
      const result = await coll.updateOne({ roleTypeId }, { $set: updates });
      if (!result.matchedCount) {
        return res.status(404).json({ success: false, message: "Role type not found" });
      }
      return res.json({ success: true, message: "Role type updated successfully" });
    } catch (error) {
      console.error("updateRoleType error", error);
      return res.status(500).json({ success: false, message: "Failed to update role type" });
    }
  };

  deleteRoleType = async (req: Request, res: Response) => {
    try {
      const roleTypeId = toNumber(req.params.roleTypeId);
      if (roleTypeId === null) {
        return res.status(400).json({ success: false, message: "Invalid roleTypeId" });
      }
      const coll = await this.roleTypesCollection();
      const result = await coll.deleteOne({ roleTypeId });
      if (!result.deletedCount) {
        return res.status(404).json({ success: false, message: "Role type not found" });
      }
      return res.json({ success: true, message: "Role type deleted successfully" });
    } catch (error) {
      console.error("deleteRoleType error", error);
      return res.status(500).json({ success: false, message: "Failed to delete role type" });
    }
  };
}

export const rolesController = new RolesController();
