import { Request, Response } from "express";
import { getMongoDb } from "../../../config/mongo";
import type { ControlCenters } from "../../../types/jotbox";

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const nextId = async (collection: any) => {
  const doc = await collection.find({}, { projection: { controlCenterId: 1 } }).sort({ controlCenterId: -1 }).limit(1).next();
  return ((doc?.controlCenterId as number | undefined) ?? 0) + 1;
};

export class ControlCenterController {
  private async collection() {
    const db = await getMongoDb();
    return db.collection<ControlCenters>("ControlCenters");
  }

  create = async (req: Request, res: Response) => {
    try {
      const collection = await this.collection();
      const controlCenterId = await nextId(collection);
      const doc: ControlCenters = {
        controlCenterId,
        name: req.body?.name ?? `Control Center ${controlCenterId}`,
        description: req.body?.description,
        jsonObject:
          typeof req.body?.jsonObject === "string" ? req.body.jsonObject : JSON.stringify(req.body?.jsonObject ?? {}),
        created: new Date() as any,
        updated: new Date() as any,
      };
      await collection.insertOne(doc);
      return res.status(201).json({ message: "Control center created", controlCenterId });
    } catch (error) {
      console.error("create control center error", error);
      return res.status(500).json({ message: "Failed to create control center" });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const controlCenterId = toNumber(req.body?.controlCenterId);
      if (controlCenterId === null) {
        return res.status(400).json({ message: "controlCenterId is required" });
      }
      const updates: Partial<ControlCenters> = {};
      if (typeof req.body?.name === "string") updates.name = req.body.name;
      if (typeof req.body?.description === "string") updates.description = req.body.description;
      if (req.body?.jsonObject !== undefined) {
        updates.jsonObject =
          typeof req.body.jsonObject === "string" ? req.body.jsonObject : JSON.stringify(req.body.jsonObject);
      }
      updates.updated = new Date() as any;
      const collection = await this.collection();
      const result = await collection.updateOne({ controlCenterId }, { $set: updates });
      if (!result.matchedCount) {
        return res.status(404).json({ message: "Control center not found" });
      }
      return res.json({ message: "Control center updated" });
    } catch (error) {
      console.error("update control center error", error);
      return res.status(500).json({ message: "Failed to update control center" });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const controlCenterId = toNumber(req.body?.controlCenterId);
      if (controlCenterId === null) {
        return res.status(400).json({ message: "controlCenterId is required" });
      }
      const collection = await this.collection();
      const result = await collection.deleteOne({ controlCenterId });
      if (!result.deletedCount) {
        return res.status(404).json({ message: "Control center not found" });
      }
      return res.json({ message: "Control center deleted" });
    } catch (error) {
      console.error("delete control center error", error);
      return res.status(500).json({ message: "Failed to delete control center" });
    }
  };

  getAll = async (_req: Request, res: Response) => {
    try {
      const collection = await this.collection();
      const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
      return res.json(docs);
    } catch (error) {
      console.error("getAll control centers error", error);
      return res.status(500).json({ message: "Failed to fetch control centers" });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const controlCenterId = toNumber(req.params?.controlCenterId);
      if (controlCenterId === null) {
        return res.status(400).json({ message: "controlCenterId is required" });
      }
      const collection = await this.collection();
      const doc = await collection.findOne({ controlCenterId }, { projection: { _id: 0 } });
      if (!doc) {
        return res.status(404).json({ message: "Control center not found" });
      }
      return res.json(doc);
    } catch (error) {
      console.error("getById control center error", error);
      return res.status(500).json({ message: "Failed to fetch control center" });
    }
  };
}
