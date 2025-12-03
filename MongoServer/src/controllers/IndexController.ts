import { Request, Response } from "express";
import { getMongoDb } from "../config/mongo";
import type { DocumentTagObject, Subscriptions, UploadFiles } from "../types/jotbox";
import type { Sort, Document } from "mongodb";

const normalizeString = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.trim().length) {
    return value.trim();
  }
  return undefined;
};

const nextNumericId = async <T extends Record<string, any>>(collectionName: string, idField: keyof T, fallback = 1): Promise<number> => {
  const db = await getMongoDb();
  const projection = { [idField as string]: 1 } as Document;
  const sort = { [idField as string]: -1 } as Sort;
  const doc = (await db.collection<T>(collectionName).find().project(projection).sort(sort).limit(1).next()) as Record<string, any> | null;
  const value = doc ? Number(doc[idField as string]) : undefined;
  return Number.isFinite(value) ? (value as number) + 1 : fallback;
};

class IndexController {
  index = (_req: Request, res: Response) => {
    res.json({ success: true, message: "MongoServer index" });
  };

  test = (_req: Request, res: Response) => {
    res.json({ success: true, message: "Test endpoint" });
  };

  action_subscribe = async (req: Request, res: Response) => {
    try {
      const name = normalizeString(req.body?.name) ?? "Anonymous";
      const email = normalizeString(req.body?.email);
      if (!email) {
        return res.status(400).json({ success: false, message: "email is required" });
      }
      const db = await getMongoDb();
      const collection = db.collection<Subscriptions>("Subscriptions");
      const existing = await collection.findOne({ Email: email });
      if (existing) {
        return res.json({ success: true, message: "Already subscribed" });
      }
      const nextId = await nextNumericId<Subscriptions>("Subscriptions", "Id");
      await collection.insertOne({ Id: nextId, Name: name, Email: email, CreatedDate: new Date() } as Subscriptions);
      return res.json({ success: true, message: "Subscribed successfully" });
    } catch (error) {
      console.error("action_subscribe error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  action_contactus = async (req: Request, res: Response) => {
    try {
      const { name, email, message, phone } = req.body || {};
      if (!name || !email || !message || !phone) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }
      const db = await getMongoDb();
      await db.collection("WebsiteContacts").insertOne({ name, email, message, phone, createdAt: new Date() });
      return res.json({ success: true, message: "Your enquiry has been received" });
    } catch (error) {
      console.error("action_contactus error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  action_enroll = async (req: Request, res: Response) => {
    try {
      const { name, email, message, location, phone } = req.body || {};
      if (!name || !email || !message || !phone) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }
      const db = await getMongoDb();
      await db.collection("WebsiteEnrollments").insertOne({ name, email, message, location, phone, createdAt: new Date() });
      return res.json({ success: true, message: "Enrollment request recorded" });
    } catch (error) {
      console.error("action_enroll error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  action_submitFormWithFile = async (req: Request, res: Response) => {
    try {
      const { name, email, message, location, phone } = req.body || {};
      if (!name || !email || !message || !phone) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }
      const file = req.file;
      if (!file) {
        return res.status(400).json({ success: false, message: "File is required" });
      }
      const db = await getMongoDb();
      const uploads = db.collection<UploadFiles>("UploadFiles");
      const uploadId = await nextNumericId<UploadFiles>("UploadFiles", "uploadId");
      await uploads.insertOne({
        uploadId,
        uploadName: file.originalname,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        fileData: file.buffer.toString("base64"),
        uploadedDate: new Date(),
      } as UploadFiles);
      await db.collection("WebsiteResumes").insertOne({
        uploadId,
        name,
        email,
        message,
        location,
        phone,
        createdAt: new Date(),
      });
      return res.json({ success: true, message: "Resume submitted successfully", uploadId });
    } catch (error) {
      console.error("action_submitFormWithFile error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  getDocumentTagById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const numericId = Number(id);
      if (!Number.isFinite(numericId)) {
        return res.status(400).json({ success: false, message: "Invalid id" });
      }
      const db = await getMongoDb();
      const record = await db
        .collection<DocumentTagObject>("DocumentTagObject")
        .findOne({ documentTagObjectId: numericId });
      if (!record) {
        return res.status(404).json({ success: false, message: "Document tag not found" });
      }
      let parsed: unknown = record.documentTagObject;
      if (typeof parsed === "string") {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          parsed = record.documentTagObject;
        }
      }
      return res.json({
        success: true,
        data: {
          documentTagObjectId: record.documentTagObjectId,
          name: record.name,
          description: record.description,
          created: record.created,
          updated: record.updated,
          documentTagObject: parsed,
        },
      });
    } catch (error) {
      console.error("getDocumentTagById error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}

export const indexController = new IndexController();
