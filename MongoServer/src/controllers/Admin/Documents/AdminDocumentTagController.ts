import { Request, Response } from "express";
import { getMongoDb } from "../../../config/mongo";
import type { DocumentTagObject } from "../../../types/jotbox";

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
    .find({}, { projection: { documentTagObjectId: 1 } })
    .sort({ documentTagObjectId: -1 })
    .limit(1)
    .next();
  return ((doc?.documentTagObjectId as number | undefined) ?? 0) + 1;
};

export class AdminDocumentTagController {
  private async collection() {
    const db = await getMongoDb();
    return db.collection<DocumentTagObject>("DocumentTagObject");
  }

  createDocumentTag = async (req: Request, res: Response) => {
    try {
      const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
      const documentTagObject = req.body?.documentTagObject;
      if (!name || documentTagObject === undefined) {
        return res.status(400).json({ success: false, message: "Required fields: name, documentTagObject" });
      }
      const collection = await this.collection();
      const documentTagObjectId = await nextId(collection);
      await collection.insertOne({
        documentTagObjectId,
        name,
        description: req.body?.description ?? null,
        documentTagObject:
          typeof documentTagObject === "string" ? documentTagObject : JSON.stringify(documentTagObject),
        created: new Date() as any,
        updated: new Date() as any,
      } as DocumentTagObject);
      return res.status(201).json({
        success: true,
        message: "Document tag created successfully.",
        insertId: documentTagObjectId,
      });
    } catch (error) {
      console.error("createDocumentTag error", error);
      return res.status(500).json({ success: false, message: "Failed to create document tag." });
    }
  };

  getAllDocumentTags = async (_req: Request, res: Response) => {
    try {
      const collection = await this.collection();
      const rows = await collection.find({}, { projection: { _id: 0 } }).toArray();
      return res.json({ success: true, data: rows });
    } catch (error) {
      console.error("getAllDocumentTags error", error);
      return res.status(500).json({ success: false, message: "Failed to fetch document tags." });
    }
  };

  updateDocumentTag = async (req: Request, res: Response) => {
    try {
      const id = toNumber(req.params?.id);
      const { name, description, documentTagObject } = req.body;
      if (id === null || !name || documentTagObject === undefined) {
        return res.status(400).json({ success: false, message: "Required fields: id, name, documentTagObject" });
      }
      const collection = await this.collection();
      const result = await collection.updateOne(
        { documentTagObjectId: id },
        {
          $set: {
            name,
            description: description ?? null,
            documentTagObject:
              typeof documentTagObject === "string" ? documentTagObject : JSON.stringify(documentTagObject),
            updated: new Date() as any,
          },
        }
      );
      if (!result.matchedCount) {
        return res.status(404).json({ success: false, message: "Document tag not found." });
      }
      return res.json({ success: true, message: "Document tag updated successfully." });
    } catch (error) {
      console.error("updateDocumentTag error", error);
      return res.status(500).json({ success: false, message: "Failed to update document tag." });
    }
  };

  deleteDocumentTag = async (req: Request, res: Response) => {
    try {
      const id = toNumber(req.params?.id);
      if (id === null) {
        return res.status(400).json({ success: false, message: "Missing required parameter: id" });
      }
      const collection = await this.collection();
      const result = await collection.deleteOne({ documentTagObjectId: id });
      if (!result.deletedCount) {
        return res.status(404).json({ success: false, message: "Document tag not found." });
      }
      return res.json({ success: true, message: "Document tag deleted successfully." });
    } catch (error) {
      console.error("deleteDocumentTag error", error);
      return res.status(500).json({ success: false, message: "Failed to delete document tag." });
    }
  };

  getDocumentTagById = async (req: Request, res: Response) => {
    try {
      const id = toNumber(req.params?.id);
      if (id === null) {
        return res.status(400).json({ success: false, message: "Missing required parameter: id" });
      }
      const collection = await this.collection();
      const doc = await collection.findOne({ documentTagObjectId: id }, { projection: { _id: 0 } });
      if (!doc) {
        return res.status(404).json({ success: false, message: "Document tag not found." });
      }
      return res.json({
        success: true,
        data: {
          ...doc,
          documentTagObject:
            typeof doc.documentTagObject === "string" ? JSON.parse(doc.documentTagObject as any) : doc.documentTagObject,
        },
      });
    } catch (error) {
      console.error("getDocumentTagById error", error);
      return res.status(500).json({ success: false, message: "Failed to fetch document tag by ID." });
    }
  };
}

export const adminDocumentTagController = new AdminDocumentTagController();
