import { Request, Response } from "express";
import { getMongoDb } from "../../../config/mongo";
import type { SubProfileSettings } from "../../../types/jotbox";

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

type AllowedField = keyof Pick<SubProfileSettings, "SettingId" | "subProfileId" | "dataTypeId" | "value">;

export class AdminSubProfileSettingsController {
  private async collection() {
    const db = await getMongoDb();
    return db.collection<SubProfileSettings>("SubProfileSettings");
  }

  private async nextId(collection?: Awaited<ReturnType<typeof this.collection>>) {
    const target = collection ?? (await this.collection());
    const doc = await target
      .find({}, { projection: { profileSettingsId: 1 } })
      .sort({ profileSettingsId: -1 })
      .limit(1)
      .next();
    return ((doc?.profileSettingsId as number | undefined) ?? 0) + 1;
  }

  private readNumericField(field: AllowedField, source: any) {
    const value = toNumber(source?.[field]);
    return value;
  }

  addSubProfileSetting = async (req: Request, res: Response) => {
    try {
      const payload = req.body || {};
      const SettingId = this.readNumericField("SettingId", payload);
      const subProfileId = this.readNumericField("subProfileId", payload);
      const dataTypeId = this.readNumericField("dataTypeId", payload);
      const value = this.readNumericField("value", payload);
      if ([SettingId, subProfileId, dataTypeId, value].some((val) => val === null)) {
        return res.status(400).json({
          message: "SettingId, subProfileId, dataTypeId, and value are required",
          status: false,
        });
      }
      const collection = await this.collection();
      const profileSettingsId = await this.nextId(collection);
      await collection.insertOne({
        profileSettingsId,
        SettingId: SettingId!,
        subProfileId: subProfileId!,
        dataTypeId: dataTypeId!,
        value: value!,
      });
      return res.status(201).json({
        message: "SubProfileSetting created successfully",
        id: profileSettingsId,
        status: true,
      });
    } catch (error) {
      console.error("addSubProfileSetting error", error);
      return res.status(500).json({ message: "Error creating SubProfileSetting", error, status: false });
    }
  };

  editSubProfileSetting = async (req: Request, res: Response) => {
    try {
      const profileSettingsId = toNumber(req.params?.profileSettingsId);
      if (profileSettingsId === null) {
        return res.status(400).json({ message: "Invalid profileSettingsId", status: false });
      }
      const payload = req.body || {};
      const updates: Partial<SubProfileSettings> = {};
      (["SettingId", "subProfileId", "dataTypeId", "value"] as AllowedField[]).forEach((field) => {
        if (payload[field] !== undefined) {
          const parsed = this.readNumericField(field, payload);
          if (parsed === null) {
            throw new Error(`${field} must be a number`);
          }
          (updates as any)[field] = parsed;
        }
      });
      if (!Object.keys(updates).length) {
        return res.status(400).json({ message: "No valid fields to update", status: false });
      }
      const collection = await this.collection();
      const result = await collection.updateOne({ profileSettingsId }, { $set: updates });
      if (!result.matchedCount) {
        return res.status(404).json({ message: "SubProfileSetting not found", status: false });
      }
      return res.status(200).json({ message: "SubProfileSetting updated successfully", status: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error updating SubProfileSetting";
      if (message.endsWith("must be a number")) {
        return res.status(400).json({ message, status: false });
      }
      console.error("editSubProfileSetting error", error);
      return res.status(500).json({ message: "Error updating SubProfileSetting", error, status: false });
    }
  };

  deleteSubProfileSetting = async (req: Request, res: Response) => {
    try {
      const profileSettingsId = toNumber(req.params?.profileSettingsId);
      if (profileSettingsId === null) {
        return res.status(400).json({ message: "Invalid profileSettingsId", status: false });
      }
      const collection = await this.collection();
      const result = await collection.deleteOne({ profileSettingsId });
      if (!result.deletedCount) {
        return res.status(404).json({ message: "SubProfileSetting not found", status: false });
      }
      return res.status(200).json({ message: "SubProfileSetting deleted successfully", status: true });
    } catch (error) {
      console.error("deleteSubProfileSetting error", error);
      return res.status(500).json({ message: "Error deleting SubProfileSetting", error, status: false });
    }
  };

  getAllSubProfileSettings = async (_req: Request, res: Response) => {
    try {
      const collection = await this.collection();
      const rows = await collection.find({}, { projection: { _id: 0 } }).sort({ profileSettingsId: 1 }).toArray();
      return res.status(200).json(rows);
    } catch (error) {
      console.error("getAllSubProfileSettings error", error);
      return res.status(500).json({ message: "Error fetching SubProfileSettings", error, status: false });
    }
  };

  getSingleSubProfileSetting = async (req: Request, res: Response) => {
    try {
      const profileSettingsId = toNumber(req.params?.profileSettingsId);
      if (profileSettingsId === null) {
        return res.status(400).json({ message: "Invalid profileSettingsId", status: false });
      }
      const collection = await this.collection();
      const row = await collection.findOne({ profileSettingsId }, { projection: { _id: 0 } });
      if (!row) {
        return res.status(404).json({ message: "SubProfileSetting not found", status: false });
      }
      return res.status(200).json(row);
    } catch (error) {
      console.error("getSingleSubProfileSetting error", error);
      return res.status(500).json({ message: "Error fetching SubProfileSetting", error, status: false });
    }
  };
}
