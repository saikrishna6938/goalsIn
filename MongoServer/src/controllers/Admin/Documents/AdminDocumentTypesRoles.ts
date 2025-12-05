import { Request, Response } from "express";
import { getMongoDb } from "../../../config/mongo";
import type { SuperDocumentTypeRoles, SuperRoleNames } from "../../../types/jotbox";

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const nextId = async (collection: any) => {
  const doc = await collection
    .find({}, { projection: { documentTypeRoleId: 1 } })
    .sort({ documentTypeRoleId: -1 })
    .limit(1)
    .next();
  return ((doc?.documentTypeRoleId as number | undefined) ?? 0) + 1;
};

export class AdminDocumentTypesRolesController {
  private async rolesCollection() {
    const db = await getMongoDb();
    return db.collection<SuperDocumentTypeRoles>("SuperDocumentTypeRoles");
  }

  private async roleNamesCollection() {
    const db = await getMongoDb();
    return db.collection<SuperRoleNames>("SuperRoleNames");
  }

  getDocumentTypeRoles = async (req: Request, res: Response) => {
    try {
      const documentTypeId = toNumber(req.params?.documentTypeId);
      if (documentTypeId === null) {
        return res.status(400).json({ message: "documentTypeId is required", status: false });
      }
      const roles = await this.rolesCollection();
      const docs = await roles.find({ documentTypeId }, { projection: { _id: 0 } }).toArray();
      const roleNames = await this.roleNamesCollection();
      const names = await roleNames
        .find({}, { projection: { roleNameId: 1, roleName: 1, _id: 0 } })
        .toArray();
      const rows = docs.map((doc) => ({
        ...doc,
        roleName: names.find((name) => name.roleNameId === doc.roleNameId)?.roleName,
      }));
      return res.status(200).json({ rows, status: true });
    } catch (error) {
      console.error("getDocumentTypeRoles error", error);
      return res.status(500).json({ message: "Error fetching DocumentTypeRoles", error, status: false });
    }
  };

  addDocumentTypeRoles = async (req: Request, res: Response) => {
    try {
      const roles = Array.isArray(req.body) ? req.body : [];
      if (!roles.length) {
        return res.status(400).json({ message: "Invalid input: must be a non-empty array", status: false });
      }
      const collection = await this.rolesCollection();
      const docs: SuperDocumentTypeRoles[] = [];
      for (const role of roles) {
        const documentTypeId = toNumber(role.documentTypeId);
        const roleNameId = toNumber(role.roleNameId);
        if (documentTypeId === null || roleNameId === null) continue;
        docs.push({
          documentTypeRoleId: await nextId(collection),
          documentTypeId,
          documentSecurity: typeof role.documentSecurity === "string" ? role.documentSecurity : "1",
          roleNameId,
        } as SuperDocumentTypeRoles);
      }
      if (!docs.length) {
        return res.status(400).json({ message: "No valid roles provided", status: false });
      }
      await collection.insertMany(docs);
      return res.status(201).json({
        message: "Roles added successfully",
        affectedRows: docs.length,
        status: true,
      });
    } catch (error) {
      console.error("addDocumentTypeRoles error", error);
      return res.status(500).json({ message: "Error adding roles", error, status: false });
    }
  };

  deleteDocumentTypeRoles = async (req: Request, res: Response) => {
    try {
      const roleIds: number[] = Array.isArray(req.body?.roleIds)
        ? req.body.roleIds.map((val: any) => Number(val)).filter(Number.isFinite)
        : [];
      const documentTypeId = toNumber(req.body?.documentTypeId);
      if (!roleIds.length || documentTypeId === null) {
        return res
          .status(400)
          .json({ message: "Invalid input: Provide roleIds and documentTypeId", status: false });
      }
      const collection = await this.rolesCollection();
      const result = await collection.deleteMany({
        roleNameId: { $in: roleIds },
        documentTypeId,
      });
      return res.status(200).json({
        message: "Roles deleted successfully",
        affectedRows: result.deletedCount ?? 0,
        status: true,
      });
    } catch (error) {
      console.error("deleteDocumentTypeRoles error", error);
      return res.status(500).json({ message: "Error deleting roles", error, status: false });
    }
  };
}
