import { Request, Response } from "express";
import { getMongoDb } from "../../../config/mongo";
import type { OptionsData, StructureOptionValues } from "../../../types/jotbox";

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

export class AdminOptionsController {
  private async optionsCollection() {
    const db = await getMongoDb();
    return db.collection<OptionsData>("OptionsData");
  }

  private async structureOptionsCollection() {
    const db = await getMongoDb();
    return db.collection<StructureOptionValues>("StructureOptionValues");
  }

  createOption = async (req: Request, res: Response) => {
    try {
      const optionName = typeof req.body?.optionName === "string" ? req.body.optionName : "";
      if (!optionName) {
        return res.status(400).json({ success: false, message: "optionName is required" });
      }
      const options = req.body?.options;
      const collection = await this.optionsCollection();
      const optionId = await nextId(collection, "optionId");
      await collection.insertOne({
        optionId,
        optionName,
        options: typeof options === "string" ? options : JSON.stringify(options ?? {}),
      } as OptionsData);
      return res.status(201).json({ success: true, optionId });
    } catch (error) {
      console.error("createOption error", error);
      return res.status(500).json({ success: false, message: "Failed to create option" });
    }
  };

  getOptions = async (_req: Request, res: Response) => {
    try {
      const collection = await this.optionsCollection();
      const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
      return res.json({ success: true, data: docs });
    } catch (error) {
      console.error("getOptions error", error);
      return res.status(500).json({ success: false, message: "Failed to fetch options" });
    }
  };

  deleteOption = async (req: Request, res: Response) => {
    try {
      const optionId = toNumber(req.params?.optionId);
      if (optionId === null) {
        return res.status(400).json({ success: false, message: "optionId is required" });
      }
      const collection = await this.optionsCollection();
      const result = await collection.deleteOne({ optionId });
      return res.json({ success: true, deletedCount: result.deletedCount ?? 0 });
    } catch (error) {
      console.error("deleteOption error", error);
      return res.status(500).json({ success: false, message: "Failed to delete option" });
    }
  };

  updateOption = async (req: Request, res: Response) => {
    try {
      const optionId = toNumber(req.params?.optionId);
      if (optionId === null) {
        return res.status(400).json({ success: false, message: "optionId is required" });
      }
      const updates: Partial<OptionsData> = {};
      if (typeof req.body?.optionName === "string") updates.optionName = req.body.optionName;
      if (req.body?.options !== undefined) {
        updates.options = typeof req.body.options === "string" ? req.body.options : JSON.stringify(req.body.options);
      }
      const collection = await this.optionsCollection();
      const result = await collection.updateOne({ optionId }, { $set: updates });
      return res.json({ success: true, modifiedCount: result.modifiedCount ?? 0 });
    } catch (error) {
      console.error("updateOption error", error);
      return res.status(500).json({ success: false, message: "Failed to update option" });
    }
  };

  getOptionDataByLabelName = async (req: Request, res: Response) => {
    try {
      const optionName = req.params?.optionName;
      if (!optionName) {
        return res.status(400).json({ success: false, message: "optionName is required" });
      }
      const collection = await this.optionsCollection();
      const doc = await collection.findOne({ optionName }, { projection: { _id: 0 } });
      if (!doc) {
        return res.status(404).json({ success: false, message: "Option not found" });
      }
      return res.json({ success: true, data: doc });
    } catch (error) {
      console.error("getOptionDataByLabelName error", error);
      return res.status(500).json({ success: false, message: "Failed to fetch option" });
    }
  };

  getOptionsByID = async (req: Request, res: Response) => {
    try {
      const optionId = toNumber(req.params?.optionId);
      if (optionId === null) {
        return res.status(400).json({ success: false, message: "optionId is required" });
      }
      const collection = await this.optionsCollection();
      const doc = await collection.findOne({ optionId }, { projection: { _id: 0 } });
      if (!doc) {
        return res.status(404).json({ success: false, message: "Option not found" });
      }
      return res.json({ success: true, data: doc });
    } catch (error) {
      console.error("getOptionsByID error", error);
      return res.status(500).json({ success: false, message: "Failed to fetch option" });
    }
  };

  getOptionsDataByValueLabel = async (_req: Request, res: Response) => {
    try {
      const collection = await this.optionsCollection();
      const docs = await collection.find({}, { projection: { optionId: 1, optionName: 1 } }).toArray();
      return res.json({ success: true, data: docs });
    } catch (error) {
      console.error("getOptionsDataByValueLabel error", error);
      return res.status(500).json({ success: false, message: "Failed to fetch options" });
    }
  };

  getValueLabelsByEntityId = async (_req: Request, res: Response) => {
    return res.json({ success: true, data: [] });
  };

  createStructureOptionValue = async (req: Request, res: Response) => {
    try {
      const collection = await this.structureOptionsCollection();
      const doc: StructureOptionValues = {
        id: await nextId(collection, "id"),
        entityId: toNumber(req.body?.entityId) ?? 0,
        optionId: toNumber(req.body?.optionId) ?? 0,
        selectedOptionId: toNumber(req.body?.selectedOptionId) ?? 0,
        valueLabel: req.body?.valueLabel ?? "",
        notes: req.body?.notes,
      } as StructureOptionValues;
      await collection.insertOne(doc);
      return res.status(201).json({ success: true, id: doc.id });
    } catch (error) {
      console.error("createStructureOptionValue error", error);
      return res.status(500).json({ success: false, message: "Failed to create structure option value" });
    }
  };

  updateStructureOptionValue = async (req: Request, res: Response) => {
    try {
      const id = toNumber(req.params?.id);
      if (id === null) {
        return res.status(400).json({ success: false, message: "id is required" });
      }
      const collection = await this.structureOptionsCollection();
      const updates: Partial<StructureOptionValues> = {};
      ["entityId", "optionId", "selectedOptionId"].forEach((field) => {
        const value = toNumber((req.body ?? {})[field]);
        if (value !== null) (updates as any)[field] = value;
      });
      if (typeof req.body?.valueLabel === "string") updates.valueLabel = req.body.valueLabel;
      if (typeof req.body?.notes === "string") updates.notes = req.body.notes;
      const result = await collection.updateOne({ id }, { $set: updates });
      return res.json({ success: true, modifiedCount: result.modifiedCount ?? 0 });
    } catch (error) {
      console.error("updateStructureOptionValue error", error);
      return res.status(500).json({ success: false, message: "Failed to update structure option value" });
    }
  };

  deleteStructureOptionValue = async (req: Request, res: Response) => {
    try {
      const id = toNumber(req.params?.id);
      if (id === null) {
        return res.status(400).json({ success: false, message: "id is required" });
      }
      const collection = await this.structureOptionsCollection();
      const result = await collection.deleteOne({ id });
      return res.json({ success: true, deletedCount: result.deletedCount ?? 0 });
    } catch (error) {
      console.error("deleteStructureOptionValue error", error);
      return res.status(500).json({ success: false, message: "Failed to delete structure option value" });
    }
  };

  getAllStructureOptionValues = async (_req: Request, res: Response) => {
    try {
      const collection = await this.structureOptionsCollection();
      const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
      return res.json({ success: true, data: docs });
    } catch (error) {
      console.error("getAllStructureOptionValues error", error);
      return res.status(500).json({ success: false, message: "Failed to fetch structure option values" });
    }
  };

  getStructureOptionValueById = async (req: Request, res: Response) => {
    try {
      const id = toNumber(req.params?.id);
      if (id === null) {
        return res.status(400).json({ success: false, message: "id is required" });
      }
      const collection = await this.structureOptionsCollection();
      const doc = await collection.findOne({ id }, { projection: { _id: 0 } });
      if (!doc) {
        return res.status(404).json({ success: false, message: "Structure option value not found" });
      }
      return res.json({ success: true, data: doc });
    } catch (error) {
      console.error("getStructureOptionValueById error", error);
      return res.status(500).json({ success: false, message: "Failed to fetch structure option value" });
    }
  };
}

export const adminOptionsController = new AdminOptionsController();
