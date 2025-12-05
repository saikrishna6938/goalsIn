import { Request, Response } from "express";
import { getMongoDb } from "../../../config/mongo";
import type { DocumentTypeObject } from "../../../types/jotbox";

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
    .find({}, { projection: { documentTypeObjectId: 1 } })
    .sort({ documentTypeObjectId: -1 })
    .limit(1)
    .next();
  return ((doc?.documentTypeObjectId as number | undefined) ?? 0) + 1;
};

export class FormController {
  private async collection() {
    const db = await getMongoDb();
    return db.collection<DocumentTypeObject>("DocumentTypeObject");
  }

  create = async (req: Request, res: Response) => {
    try {
      const collection = await this.collection();
      const documentTypeObjectId = await nextId(collection);
      const doc: DocumentTypeObject = {
        documentTypeObjectId,
        name: req.body?.name ?? `Form ${documentTypeObjectId}`,
        description: req.body?.description ?? "",
        documentTypeObject:
          typeof req.body?.documentTypeObject === "string"
            ? req.body.documentTypeObject
            : JSON.stringify(req.body?.documentTypeObject ?? {}),
        created: new Date() as any,
        updated: new Date() as any,
      };
      await collection.insertOne(doc);
      return res.status(201).json({ message: "Form created", documentTypeObjectId });
    } catch (error) {
      console.error("create form error", error);
      return res.status(500).json({ message: "Failed to create form" });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const documentTypeObjectId = toNumber(req.body?.documentTypeObjectId);
      if (documentTypeObjectId === null) {
        return res.status(400).json({ message: "documentTypeObjectId is required" });
      }
      const updates: Partial<DocumentTypeObject> = {};
      if (typeof req.body?.name === "string") updates.name = req.body.name;
      if (typeof req.body?.description === "string") updates.description = req.body.description;
      if (req.body?.documentTypeObject !== undefined) {
        updates.documentTypeObject =
          typeof req.body.documentTypeObject === "string"
            ? req.body.documentTypeObject
            : JSON.stringify(req.body.documentTypeObject);
      }
      if (!Object.keys(updates).length) {
        return res.status(400).json({ message: "No fields to update" });
      }
      updates.updated = new Date() as any;
      const collection = await this.collection();
      const result = await collection.updateOne({ documentTypeObjectId }, { $set: updates });
      if (!result.matchedCount) {
        return res.status(404).json({ message: "Form not found" });
      }
      return res.json({ message: "Form updated" });
    } catch (error) {
      console.error("update form error", error);
      return res.status(500).json({ message: "Failed to update form" });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const documentTypeObjectId = toNumber(req.params?.documentTypeObjectId);
      if (documentTypeObjectId === null) {
        return res.status(400).json({ message: "documentTypeObjectId is required" });
      }
      const collection = await this.collection();
      const result = await collection.deleteOne({ documentTypeObjectId });
      if (!result.deletedCount) {
        return res.status(404).json({ message: "Form not found" });
      }
      return res.json({ message: "Form deleted" });
    } catch (error) {
      console.error("delete form error", error);
      return res.status(500).json({ message: "Failed to delete form" });
    }
  };

  getAll = async (_req: Request, res: Response) => {
    try {
      const collection = await this.collection();
      const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
      return res.json(docs);
    } catch (error) {
      console.error("getAll forms error", error);
      return res.status(500).json({ message: "Failed to fetch forms" });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const documentTypeObjectId = toNumber(req.params?.documentTypeObjectId);
      if (documentTypeObjectId === null) {
        return res.status(400).json({ message: "documentTypeObjectId is required" });
      }
      const collection = await this.collection();
      const doc = await collection.findOne({ documentTypeObjectId }, { projection: { _id: 0 } });
      if (!doc) {
        return res.status(404).json({ message: "Form not found" });
      }
      return res.json(doc);
    } catch (error) {
      console.error("getById form error", error);
      return res.status(500).json({ message: "Failed to fetch form" });
    }
  };
}
