import { Request, Response } from "express";
import type { Collection } from "mongodb";
import { getMongoDb } from "../config/mongo";
import type {
  DocumentType,
  DocumentTypeObject,
  Tasks,
  UserDocumentsPermission,
  Users,
} from "../types/jotbox";

type DocumentTypeDoc = DocumentType & { documentTypeObject?: unknown };

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

const parseCsvNumbers = (value: string | undefined): number[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((num) => Number.isFinite(num));
};

const parseBoolean = (value: any, fallback = false): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
  }
  return fallback;
};

const parseDocumentTypeObject = (value: unknown): unknown => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

class DocumentTypeController {
  private async documentTypes(): Promise<Collection<DocumentTypeDoc>> {
    const db = await getMongoDb();
    return db.collection<DocumentTypeDoc>("DocumentType");
  }

  private async documentTypeObjects(): Promise<Collection<DocumentTypeObject>> {
    const db = await getMongoDb();
    return db.collection<DocumentTypeObject>("DocumentTypeObject");
  }

  private async userDocumentsPermission(): Promise<Collection<UserDocumentsPermission>> {
    const db = await getMongoDb();
    return db.collection<UserDocumentsPermission>("UserDocumentsPermission");
  }

  private async tasks(): Promise<Collection<Tasks>> {
    const db = await getMongoDb();
    return db.collection<Tasks>("Tasks");
  }

  private async users(): Promise<Collection<Users>> {
    const db = await getMongoDb();
    return db.collection<Users>("Users");
  }

  private async nextId(collection: Collection<any>, field: string): Promise<number> {
    const doc = await collection.find().project({ [field]: 1 }).sort({ [field]: -1 }).limit(1).next();
    return (doc?.[field] ?? 0) + 1;
  }

  addDocumentType = async (req: Request, res: Response) => {
    try {
      const payload = req.body || {};
      const documentTypeName = normalizeString(payload.documentTypeName);
      if (!documentTypeName) {
        return res.status(400).json({ status: false, message: "documentTypeName is required" });
      }
      const collection = await this.documentTypes();
      const documentTypeId = toNumber(payload.documentTypeId) ?? (await this.nextId(collection, "documentTypeId"));
      const doc: Partial<DocumentTypeDoc> = {
        documentTypeId,
        documentTypeName,
        documentTypeDescription: normalizeString(payload.documentTypeDescription),
        documentTypeObjectId: toNumber(payload.documentTypeObjectId) ?? undefined,
        tableName: normalizeString(payload.tableName),
        documentGroupId: toNumber(payload.documentGroupId) ?? 0,
        documentTagObjectId: toNumber(payload.documentTagObjectId) ?? undefined,
        documentTypeRoles: normalizeString(payload.documentTypeRoles) ?? "",
        documentTypeTableId: toNumber(payload.documentTypeTableId) ?? 0,
        enabled: toNumber(payload.enabled) ?? 1,
      };
      await collection.insertOne(doc as DocumentTypeDoc);
      return res.json({ status: true, message: "Added Successfully", documentTypeId });
    } catch (error) {
      console.error("addDocumentType error", error);
      return res.status(500).json({ status: false, message: "Failed" });
    }
  };

  updateDocumentType = async (req: Request, res: Response) => {
    try {
      const documentTypeId = toNumber(req.params.documentTypeId);
      if (documentTypeId === null) {
        return res.status(400).json({ status: false, message: "Invalid documentTypeId" });
      }
      const payload = req.body || {};
      const updates: Partial<DocumentTypeDoc> = {};
      const fields: Array<[keyof DocumentTypeDoc, any]> = [
        ["documentTypeName", normalizeString(payload.documentTypeName)],
        ["documentTypeDescription", normalizeString(payload.documentTypeDescription)],
        ["documentTypeObjectId", toNumber(payload.documentTypeObjectId)],
        ["tableName", normalizeString(payload.tableName)],
        ["documentGroupId", toNumber(payload.documentGroupId)],
        ["documentTagObjectId", toNumber(payload.documentTagObjectId)],
        ["documentTypeRoles", normalizeString(payload.documentTypeRoles)],
        ["documentTypeTableId", toNumber(payload.documentTypeTableId)],
        ["enabled", toNumber(payload.enabled)],
      ];
      for (const [field, value] of fields) {
        if (value !== undefined && value !== null) {
          (updates as any)[field] = value;
        }
      }
      if (!Object.keys(updates).length) {
        return res.status(400).json({ status: false, message: "No valid fields provided" });
      }
      const collection = await this.documentTypes();
      const result = await collection.updateOne({ documentTypeId }, { $set: updates });
      if (!result.matchedCount) {
        return res.status(404).json({ status: false, message: "Document type not found" });
      }
      return res.json({ status: true, message: "Updated Successfully" });
    } catch (error) {
      console.error("updateDocumentType error", error);
      return res.status(500).json({ status: false, message: "Failed" });
    }
  };

  deleteDocumentType = async (req: Request, res: Response) => {
    try {
      const documentTypeId = toNumber(req.params.documentTypeId);
      if (documentTypeId === null) {
        return res.status(400).json({ status: false, message: "Invalid documentTypeId" });
      }
      const collection = await this.documentTypes();
      const result = await collection.deleteOne({ documentTypeId });
      if (!result.deletedCount) {
        return res.status(404).json({ status: false, message: "Document type not found" });
      }
      return res.json({ status: true, message: "Deleted Successfully" });
    } catch (error) {
      console.error("deleteDocumentType error", error);
      return res.status(500).json({ status: false, message: "Failed" });
    }
  };

  getDocumentType = async (req: Request, res: Response) => {
    try {
      const documentTypeId = toNumber(req.params.documentTypeId);
      if (documentTypeId === null) {
        return res.status(400).json({ status: false, message: "Invalid documentTypeId" });
      }
      const collection = await this.documentTypes();
      const doc = await collection.findOne({ documentTypeId }, { projection: { _id: 0 } });
      if (!doc) {
        return res.status(404).json({ status: false, message: "Document type not found", data: [] });
      }
      return res.json({ status: true, message: "Success", data: doc });
    } catch (error) {
      console.error("getDocumentType error", error);
      return res.status(500).json({ status: false, message: "Failed", data: [] });
    }
  };

  getDocumentTypesByUserType = async (req: Request, res: Response) => {
    try {
      const userType = toNumber(req.params.userTypeId);
      if (userType === null) {
        return res.status(400).json({ status: false, message: "Invalid userType" });
      }
      const permissionsCollection = await this.userDocumentsPermission();
      const permissions = await permissionsCollection
        .find({ userType }, { projection: { _id: 0, documentTypeId: 1 } })
        .toArray();
      if (!permissions.length) {
        return res.json({ status: true, message: "success", data: [] });
      }
      const ids = permissions.map((doc) => doc.documentTypeId);
      const collection = await this.documentTypes();
      const docs = await collection.find({ documentTypeId: { $in: ids } }, { projection: { _id: 0 } }).toArray();
      return res.json({ status: true, message: "success", data: docs });
    } catch (error) {
      console.error("getDocumentTypesByUserType error", error);
      return res.status(500).json({ status: false, message: "failed" });
    }
  };

  addDocumentTypeObject = async (req: Request, res: Response) => {
    try {
      const payload = req.body || {};
      if (payload.documentTypeObject === undefined) {
        return res.status(400).json({ status: false, message: "documentTypeObject is required" });
      }
      const collection = await this.documentTypeObjects();
      const documentTypeObjectId =
        toNumber(payload.documentTypeObjectId) ?? (await this.nextId(collection, "documentTypeObjectId"));
      const doc: DocumentTypeObject = {
        documentTypeObjectId,
        name: normalizeString(payload.name) ?? "",
        description: normalizeString(payload.description) ?? "",
        documentTypeObject:
          typeof payload.documentTypeObject === "string"
            ? payload.documentTypeObject
            : JSON.stringify(payload.documentTypeObject),
        created: payload.created,
        updated: payload.updated,
      };
      await collection.insertOne(doc);
      return res.json({ status: true, message: "Added Successfully", documentTypeObjectId });
    } catch (error) {
      console.error("addDocumentTypeObject error", error);
      return res.status(500).json({ status: false, message: "Failed to Add DocumentTypeObject" });
    }
  };

  updateDocumentTypeObject = async (req: Request, res: Response) => {
    try {
      const documentTypeObjectId = toNumber(req.params.documentTypeObjectId);
      if (documentTypeObjectId === null) {
        return res.status(400).json({ status: false, message: "Invalid documentTypeObjectId" });
      }
      const payload = req.body || {};
      if (payload.documentTypeObject === undefined) {
        return res.status(400).json({ status: false, message: "documentTypeObject is required" });
      }
      const collection = await this.documentTypeObjects();
      const updates: Partial<DocumentTypeObject> = {
        documentTypeObject:
          typeof payload.documentTypeObject === "string"
            ? payload.documentTypeObject
            : JSON.stringify(payload.documentTypeObject),
      };
      const result = await collection.updateOne({ documentTypeObjectId }, { $set: updates });
      if (!result.matchedCount) {
        return res.status(404).json({ status: false, message: "DocumentTypeObject not found" });
      }
      return res.json({ status: true, message: "Updated Successfully" });
    } catch (error) {
      console.error("updateDocumentTypeObject error", error);
      return res.status(500).json({ status: false, message: "Failed to update" });
    }
  };

  deleteDocumentTypeObject = async (req: Request, res: Response) => {
    try {
      const documentTypeObjectId = toNumber(req.params.documentTypeObjectId);
      if (documentTypeObjectId === null) {
        return res.status(400).json({ status: false, message: "Invalid documentTypeObjectId" });
      }
      const collection = await this.documentTypeObjects();
      const result = await collection.deleteOne({ documentTypeObjectId });
      if (!result.deletedCount) {
        return res.status(404).json({ status: false, message: "DocumentTypeObject not found" });
      }
      return res.json({ status: true, message: "Deleted Successfully" });
    } catch (error) {
      console.error("deleteDocumentTypeObject error", error);
      return res.status(500).json({ status: false, message: "Failed to delete" });
    }
  };

  getDocumentTypeObjectById = async (req: Request, res: Response) => {
    try {
      const documentTypeId = toNumber(req.params.documentTypeId);
      if (documentTypeId === null) {
        return res.status(400).json({ status: false, message: "Invalid documentTypeId" });
      }
      const documentTypes = await this.documentTypes();
      const doc = await documentTypes.findOne({ documentTypeId });
      if (!doc?.documentTypeObjectId) {
        return res.status(404).json({ status: false, message: "Document type object not found" });
      }
      const collection = await this.documentTypeObjects();
      const objectDoc = await collection.findOne(
        { documentTypeObjectId: doc.documentTypeObjectId },
        { projection: { _id: 0 } }
      );
      if (!objectDoc) {
        return res.status(404).json({ status: false, message: "DocumentTypeObject not found" });
      }
      const response = { ...objectDoc, documentTypeObject: parseDocumentTypeObject(objectDoc.documentTypeObject) };
      return res.json({ status: true, message: "success", data: [response] });
    } catch (error) {
      console.error("getDocumentTypeObjectById error", error);
      return res.status(500).json({ status: false, message: "failed" });
    }
  };

  getDocumentTypeUsers = async (req: Request, res: Response) => {
    try {
      const documentTypeId = toNumber(req.body?.documentTypeId);
      const taskId = toNumber(req.body?.taskId);
      const isAdminEntity = parseBoolean(req.body?.isAdminEntity);
      if (documentTypeId === null) {
        return res.status(400).json({ status: false, message: "documentTypeId is required" });
      }
      const documentTypes = await this.documentTypes();
      const documentType = await documentTypes.findOne(
        { documentTypeId },
        { projection: { documentTypeRoles: 1, _id: 0 } }
      );
      if (!documentType) {
        return res.status(404).json({ status: false, message: "DocumentType not found", data: [] });
      }
      const roleIds = parseCsvNumbers(documentType.documentTypeRoles);
      if (!roleIds.length) {
        return res.json({ status: true, message: "Success", data: [] });
      }
      let entitySet = new Set<number>();
      if (taskId !== null) {
        const tasks = await this.tasks();
        const task = await tasks.findOne({ taskId }, { projection: { userId: 1 } });
        if (task?.userId !== undefined) {
          const users = await this.users();
          const owner = await users.findOne({ userId: task.userId }, { projection: { entities: 1 } });
          parseCsvNumbers(owner?.entities).forEach((entity) => entitySet.add(entity));
        }
      }
      if (!entitySet.size) {
        entitySet.add(1);
      }
      if (isAdminEntity) {
        entitySet.add(1);
      }
      const allowedEntities = Array.from(entitySet);
      const usersCollection = await this.users();
      const docs = await usersCollection.find({}, { projection: { _id: 0 } }).toArray();
      const filtered = docs.filter((user) => {
        const userRoles = parseCsvNumbers(user.roles);
        const userEntities = parseCsvNumbers(user.entities);
        const hasRole = userRoles.some((roleId) => roleIds.includes(roleId));
        const hasEntity = allowedEntities.some((entityId) => userEntities.includes(entityId));
        return hasRole && hasEntity;
      });
      return res.json({ status: true, message: "Success", data: filtered });
    } catch (error) {
      console.error("getDocumentTypeUsers error", error);
      return res.status(500).json({ status: false, message: "Failed", data: [] });
    }
  };

  getDocumentTypeByRoles = async (req: Request, res: Response) => {
    try {
      const userId = toNumber(req.params.userId);
      if (userId === null) {
        return res.status(400).json({ success: false, message: "userId is required to fetch document types" });
      }
      const users = await this.users();
      const user = await users.findOne({ userId }, { projection: { roles: 1 } });
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      const userRoles = parseCsvNumbers(user.roles);
      if (!userRoles.length) {
        return res.json({ success: true, data: [] });
      }
      const documentTypes = await this.documentTypes();
      const allDocs = await documentTypes.find({}, { projection: { _id: 0 } }).toArray();
      const filtered = allDocs.filter((doc) => {
        const roles = parseCsvNumbers(doc.documentTypeRoles as unknown as string);
        return roles.some((role) => userRoles.includes(role));
      });
      return res.json({ success: true, data: filtered });
    } catch (error) {
      console.error("getDocumentTypeByRoles error", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching document types",
        error: (error as Error).message,
      });
    }
  };

  getDocumentTypeUsersLegacy = this.getDocumentTypeUsers;
}

export const documentController = new DocumentTypeController();
