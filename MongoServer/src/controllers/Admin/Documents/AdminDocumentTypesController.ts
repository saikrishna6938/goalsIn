import { Request, Response } from "express";
import { getMongoDb } from "../../../config/mongo";
import type { DocumentType, DocumentGroup, DocumentGroupType } from "../../../types/jotbox";

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

const nextId = async <T extends Record<string, any>>(collection: any, field: keyof T) => {
  const doc = await collection.find({}, { projection: { [field]: 1 } }).sort({ [field]: -1 }).limit(1).next();
  return ((doc?.[field] as number | undefined) ?? 0) + 1;
};

export class AdminDocumentTypesController {
  private async documentTypes() {
    const db = await getMongoDb();
    return db.collection<DocumentType>("DocumentType");
  }

  private async documentGroups() {
    const db = await getMongoDb();
    return db.collection<DocumentGroup>("DocumentGroup");
  }

  private async documentGroupTypes() {
    const db = await getMongoDb();
    return db.collection<DocumentGroupType>("DocumentGroupType");
  }

  addDocumentType = async (req: Request, res: Response) => {
    try {
      const collection = await this.documentTypes();
      const documentTypeId = await nextId<DocumentType>(collection, "documentTypeId");
      const doc: DocumentType = {
        documentTypeId,
        documentTypeName: normalizeString(req.body?.documentTypeName),
        documentTypeDescription: normalizeString(req.body?.documentTypeDescription),
        documentTypeObjectId: toNumber(req.body?.documentTypeObjectId) ?? undefined,
        tableName: normalizeString(req.body?.tableName),
        documentGroupId: toNumber(req.body?.documentGroupId) ?? 0,
        documentTypeRoles: normalizeString(req.body?.documentTypeRoles) ?? "",
        documentTypeTableId: toNumber(req.body?.documentTypeTableId) ?? 0,
        enabled: toNumber(req.body?.enabled) ?? 1,
      } as DocumentType;
      await collection.insertOne(doc);
      return res.status(201).json({ message: "DocumentType added successfully", documentTypeId, status: true });
    } catch (error) {
      console.error("addDocumentType error", error);
      return res.status(500).json({ message: "Error adding DocumentType", error, status: false });
    }
  };

  editDocumentType = async (req: Request, res: Response) => {
    try {
      const documentTypeId = toNumber(req.params?.documentTypeId);
      if (documentTypeId === null) {
        return res.status(400).json({ message: "documentTypeId is required", status: false });
      }
      const updates: Partial<DocumentType> = {};
      Object.entries(req.body ?? {}).forEach(([key, value]) => {
        if (value === undefined) return;
        (updates as any)[key] = value;
      });
      if (!Object.keys(updates).length) {
        return res.status(400).json({ message: "No fields provided for update", status: false });
      }
      const collection = await this.documentTypes();
      const result = await collection.updateOne({ documentTypeId }, { $set: updates });
      if (!result.matchedCount) {
        return res.status(404).json({ message: "DocumentType not found", status: false });
      }
      return res.status(200).json({ message: "DocumentType updated successfully", status: true });
    } catch (error) {
      console.error("editDocumentType error", error);
      return res.status(500).json({ message: "Error updating DocumentType", error, status: false });
    }
  };

  deleteDocumentType = async (req: Request, res: Response) => {
    try {
      const documentTypeId = toNumber(req.params?.documentTypeId);
      if (documentTypeId === null) {
        return res.status(400).json({ message: "documentTypeId is required", status: false });
      }
      const collection = await this.documentTypes();
      const result = await collection.deleteOne({ documentTypeId });
      if (!result.deletedCount) {
        return res.status(404).json({ message: "DocumentType not found", status: false });
      }
      return res.status(200).json({ message: "DocumentType deleted successfully", status: true });
    } catch (error) {
      console.error("deleteDocumentType error", error);
      return res.status(500).json({ message: "Error deleting DocumentType", error, status: false });
    }
  };

  getAllDocumentTypes = async (_req: Request, res: Response) => {
    try {
      const collection = await this.documentTypes();
      const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
      return res.status(200).json(docs);
    } catch (error) {
      console.error("getAllDocumentTypes error", error);
      return res.status(500).json({ message: "Error fetching DocumentTypes", error });
    }
  };

  getSingleDocumentType = async (req: Request, res: Response) => {
    try {
      const documentTypeId = toNumber(req.params?.documentTypeId);
      if (documentTypeId === null) {
        return res.status(400).json({ message: "documentTypeId is required", status: false });
      }
      const collection = await this.documentTypes();
      const doc = await collection.findOne({ documentTypeId }, { projection: { _id: 0 } });
      if (!doc) {
        return res.status(404).json({ message: "DocumentType not found", status: true });
      }
      return res.status(200).json(doc);
    } catch (error) {
      console.error("getSingleDocumentType error", error);
      return res.status(500).json({ message: "Error fetching DocumentType", error, status: false });
    }
  };

  addDocumentGroup = async (req: Request, res: Response) => {
    try {
      const collection = await this.documentGroups();
      const documentGroupId = await nextId<DocumentGroup>(collection, "documentGroupId");
      const doc: DocumentGroup = {
        documentGroupId,
        documentGroupName: normalizeString(req.body?.documentGroupName),
        documentGroupDescription: normalizeString(req.body?.documentGroupDescription),
        dataTableId: toNumber(req.body?.dataTableId) ?? 0,
        groupTypeId: toNumber(req.body?.groupTypeId) ?? 1,
      };
      await collection.insertOne(doc);
      return res.status(201).json({ message: "DocumentGroup added successfully", status: true, documentGroupId });
    } catch (error) {
      console.error("addDocumentGroup error", error);
      return res.status(500).json({ message: "Error adding DocumentGroup", error, status: false });
    }
  };

  editDocumentGroup = async (req: Request, res: Response) => {
    try {
      const documentGroupId = toNumber(req.params?.documentGroupId);
      if (documentGroupId === null) {
        return res.status(400).json({ message: "documentGroupId is required" });
      }
      const updates: Partial<DocumentGroup> = {};
      Object.entries(req.body ?? {}).forEach(([key, value]) => {
        if (value === undefined) return;
        (updates as any)[key] = value;
      });
      if (!Object.keys(updates).length) {
        return res.status(400).json({ message: "No fields provided for update" });
      }
      const collection = await this.documentGroups();
      const result = await collection.updateOne({ documentGroupId }, { $set: updates });
      if (!result.matchedCount) {
        return res.status(404).json({ message: "DocumentGroup not found" });
      }
      return res.status(200).json({ message: "DocumentGroup updated successfully" });
    } catch (error) {
      console.error("editDocumentGroup error", error);
      return res.status(500).json({ message: "Error updating DocumentGroup", error });
    }
  };

  deleteDocumentGroup = async (req: Request, res: Response) => {
    try {
      const documentGroupId = toNumber(req.params?.documentGroupId);
      if (documentGroupId === null) {
        return res.status(400).json({ message: "documentGroupId is required" });
      }
      const collection = await this.documentGroups();
      const result = await collection.deleteOne({ documentGroupId });
      if (!result.deletedCount) {
        return res.status(404).json({ message: "DocumentGroup not found" });
      }
      return res.status(200).json({ message: "DocumentGroup deleted successfully" });
    } catch (error) {
      console.error("deleteDocumentGroup error", error);
      return res.status(500).json({ message: "Error deleting DocumentGroup", error });
    }
  };

  getAllDocumentGroups = async (_req: Request, res: Response) => {
    try {
      const collection = await this.documentGroups();
      const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
      return res.status(200).json(docs);
    } catch (error) {
      console.error("getAllDocumentGroups error", error);
      return res.status(500).json({ message: "Error fetching DocumentGroups", error });
    }
  };

  getSingleDocumentGroup = async (req: Request, res: Response) => {
    try {
      const documentGroupId = toNumber(req.params?.documentGroupId);
      if (documentGroupId === null) {
        return res.status(400).json({ message: "documentGroupId is required" });
      }
      const collection = await this.documentGroups();
      const doc = await collection.findOne({ documentGroupId }, { projection: { _id: 0 } });
      if (!doc) {
        return res.status(404).json({ message: "DocumentGroup not found" });
      }
      return res.status(200).json(doc);
    } catch (error) {
      console.error("getSingleDocumentGroup error", error);
      return res.status(500).json({ message: "Error fetching DocumentGroup", error });
    }
  };

  getDocumentGroupTypes = async (_req: Request, res: Response) => {
    try {
      const collection = await this.documentGroupTypes();
      const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
      return res.status(200).json(docs);
    } catch (error) {
      console.error("getDocumentGroupTypes error", error);
      return res.status(500).json({ message: "Error fetching DocumentGroupTypes", error });
    }
  };
}
