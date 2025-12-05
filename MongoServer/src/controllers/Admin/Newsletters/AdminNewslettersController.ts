import { Request, Response } from "express";
import { getMongoDb } from "../../../config/mongo";
import type { Newsletters, NewsletterType } from "../../../types/jotbox";

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const nextId = async (collection: any, field: string) => {
  const doc = await collection.find({}, { projection: { [field]: 1 } }).sort({ [field]: -1 }).limit(1).next();
  return ((doc?.[field] as number | undefined) ?? 0) + 1;
};

export class AdminNewslettersController {
  private async newsletters() {
    const db = await getMongoDb();
    return db.collection<Newsletters>("Newsletters");
  }

  private async newsletterTypes() {
    const db = await getMongoDb();
    return db.collection<NewsletterType>("NewsletterType");
  }

  // Newsletters
  getNewsletters = async (_req: Request, res: Response) => {
    try {
      const collection = await this.newsletters();
      const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
      return res.status(200).json({ rows: docs, status: true });
    } catch (error) {
      console.error("getNewsletters error", error);
      return res.status(500).json({ message: "Error fetching newsletters", error, status: false });
    }
  };

  addNewsletters = async (req: Request, res: Response) => {
    try {
      const payload: any[] = Array.isArray(req.body) ? req.body : [];
      if (!payload.length) {
        return res.status(400).json({ message: "Invalid input: must be a non-empty array" });
      }
      const collection = await this.newsletters();
      const docs: Newsletters[] = [];
      for (const item of payload) {
        docs.push({
          newsletterId: await nextId(collection, "newsletterId"),
          newsletterTypeId: toNumber(item.newsletterTypeId) ?? 0,
          newsletterName: item.newsletterName ?? "",
          newsletterDescription: item.newsletterDescription ?? "",
        } as Newsletters);
      }
      const result = await collection.insertMany(docs);
      return res.status(201).json({
        message: "Newsletters added successfully",
        affectedRows: result.insertedCount,
        status: true,
      });
    } catch (error) {
      console.error("addNewsletters error", error);
      return res.status(500).json({ message: "Error adding newsletters", error, status: false });
    }
  };

  updateNewsletter = async (req: Request, res: Response) => {
    try {
      const newsletterId = toNumber(req.body?.newsletterId);
      if (newsletterId === null) {
        return res.status(400).json({ message: "newsletterId is required for update" });
      }
      const updates: Partial<Newsletters> = {};
      if (typeof req.body?.newsletterName === "string") updates.newsletterName = req.body.newsletterName;
      if (typeof req.body?.newsletterDescription === "string")
        updates.newsletterDescription = req.body.newsletterDescription;
      const newsletterTypeId = toNumber(req.body?.newsletterTypeId);
      if (newsletterTypeId !== null) updates.newsletterTypeId = newsletterTypeId;
      const collection = await this.newsletters();
      const result = await collection.updateOne({ newsletterId }, { $set: updates });
      return res.status(200).json({
        message: "Newsletter updated successfully",
        affectedRows: result.modifiedCount,
        status: true,
      });
    } catch (error) {
      console.error("updateNewsletter error", error);
      return res.status(500).json({ message: "Error updating newsletter", error, status: false });
    }
  };

  deleteNewsletters = async (req: Request, res: Response) => {
    try {
      const ids: number[] = Array.isArray(req.body?.newsletterIds)
        ? req.body.newsletterIds.map((id: any) => Number(id)).filter(Number.isFinite)
        : [];
      if (!ids.length) {
        return res.status(400).json({ message: "Invalid input: Provide newsletterIds" });
      }
      const collection = await this.newsletters();
      const result = await collection.deleteMany({ newsletterId: { $in: ids } });
      return res.status(200).json({
        message: "Newsletters deleted successfully",
        affectedRows: result.deletedCount ?? 0,
        status: true,
      });
    } catch (error) {
      console.error("deleteNewsletters error", error);
      return res.status(500).json({ message: "Error deleting newsletters", error, status: false });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const newsletterId = toNumber(req.params?.newslettersId);
      if (newsletterId === null) {
        return res.status(400).json({ message: "newsletterId is required" });
      }
      const collection = await this.newsletters();
      const doc = await collection.findOne({ newsletterId }, { projection: { _id: 0 } });
      if (!doc) {
        return res.status(404).json({ message: "Newsletter not found", status: false });
      }
      return res.status(200).json({ rows: [doc], status: true });
    } catch (error) {
      console.error("getById error", error);
      return res.status(500).json({ message: "Error fetching newsletter", error, status: false });
    }
  };

  // Newsletter types
  getNewsletterTypes = async (_req: Request, res: Response) => {
    try {
      const collection = await this.newsletterTypes();
      const rows = await collection.find({}, { projection: { _id: 0 } }).toArray();
      return res.status(200).json({ rows, status: true });
    } catch (error) {
      console.error("getNewsletterTypes error", error);
      return res.status(500).json({ message: "Error fetching newsletter types", error, status: false });
    }
  };

  addNewsletterTypes = async (req: Request, res: Response) => {
    try {
      const types: any[] = Array.isArray(req.body) ? req.body : [];
      if (!types.length) {
        return res.status(400).json({ message: "Invalid input: must be a non-empty array" });
      }
      const collection = await this.newsletterTypes();
      const docs: NewsletterType[] = [];
      for (const type of types) {
        docs.push({
          typeId: await nextId(collection, "typeId"),
          typeName: type.typeName ?? "",
          typeDescription: type.typeDescription ?? "",
        } as NewsletterType);
      }
      const result = await collection.insertMany(docs);
      return res.status(201).json({
        message: "Newsletter types added successfully",
        affectedRows: result.insertedCount,
        status: true,
      });
    } catch (error) {
      console.error("addNewsletterTypes error", error);
      return res.status(500).json({ message: "Error adding newsletter types", error, status: false });
    }
  };

  updateNewsletterType = async (req: Request, res: Response) => {
    try {
      const typeId = toNumber(req.body?.typeId);
      if (typeId === null) {
        return res.status(400).json({ message: "typeId is required for update" });
      }
      const updates: Partial<NewsletterType> = {};
      if (typeof req.body?.typeName === "string") updates.typeName = req.body.typeName;
      if (typeof req.body?.typeDescription === "string") updates.typeDescription = req.body.typeDescription;
      const collection = await this.newsletterTypes();
      const result = await collection.updateOne({ typeId }, { $set: updates });
      return res.status(200).json({
        message: "Newsletter type updated successfully",
        affectedRows: result.modifiedCount,
        status: true,
      });
    } catch (error) {
      console.error("updateNewsletterType error", error);
      return res.status(500).json({ message: "Error updating newsletter type", error, status: false });
    }
  };

  deleteNewsletterTypes = async (req: Request, res: Response) => {
    try {
      const typeIds: number[] = Array.isArray(req.body?.typeIds)
        ? req.body.typeIds.map((id: any) => Number(id)).filter(Number.isFinite)
        : [];
      if (!typeIds.length) {
        return res.status(400).json({ message: "Invalid input: Provide typeIds" });
      }
      const collection = await this.newsletterTypes();
      const result = await collection.deleteMany({ typeId: { $in: typeIds } });
      return res.status(200).json({
        message: "Newsletter types deleted successfully",
        affectedRows: result.deletedCount ?? 0,
        status: true,
      });
    } catch (error) {
      console.error("deleteNewsletterTypes error", error);
      return res.status(500).json({ message: "Error deleting newsletter types", error, status: false });
    }
  };
}
