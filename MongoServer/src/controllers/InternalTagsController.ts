import { Request, Response } from "express";
import { getMongoDb } from "../config/mongo";
import type { DataTables } from "../types/jotbox";

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const sanitizeTableName = (value: string): string => value.replace(/[^a-zA-Z0-9_]/g, "");

class InternalTagsController {
  private async dataTables() {
    const db = await getMongoDb();
    return db.collection<DataTables>("DataTables");
  }

  private async tableCollection(tableName: string) {
    const db = await getMongoDb();
    return db.collection(`datatable_${sanitizeTableName(tableName)}`);
  }

  private async resolveTable(tableId: number) {
    const dataTables = await this.dataTables();
    return dataTables.findOne({ tableId }, { projection: { tableName: 1 } });
  }

  updateRecord = async (req: Request, res: Response) => {
    try {
      const tableId = toNumber(req.params.tableId);
      const recordId = toNumber(req.params.id);
      const body = req.body;
      if (tableId === null || recordId === null || typeof body !== "object" || !body) {
        return res.status(400).json({ success: false, message: "Invalid parameters" });
      }
      const table = await this.resolveTable(tableId);
      if (!table?.tableName) {
        return res.status(404).json({ success: false, message: "Table not found" });
      }
      const collection = await this.tableCollection(table.tableName);
      const result = await collection.updateOne({ Id: recordId }, { $set: body });
      if (!result.matchedCount) {
        return res.status(404).json({ success: false, message: "Record not found" });
      }
      return res.json({ success: true, message: "Record updated successfully" });
    } catch (error) {
      console.error("updateRecord error", error);
      return res.status(500).json({ success: false, message: "Failed to update record" });
    }
  };

  createRecord = async (req: Request, res: Response) => {
    try {
      const tableId = toNumber(req.params.tableId);
      const body = req.body;
      if (tableId === null || typeof body !== "object" || !body) {
        return res.status(400).json({ success: false, message: "Invalid parameters" });
      }
      const table = await this.resolveTable(tableId);
      if (!table?.tableName) {
        return res.status(404).json({ success: false, message: "Table not found" });
      }
      const collection = await this.tableCollection(table.tableName);
      if (typeof body.Id !== "number") {
        const maxDoc = await collection.find({}, { projection: { Id: 1 } }).sort({ Id: -1 }).limit(1).next();
        body.Id = ((maxDoc?.Id as number | undefined) ?? 0) + 1;
      }
      await collection.insertOne(body);
      return res.json({ success: true, message: "Record created successfully", id: body.Id });
    } catch (error) {
      console.error("createRecord error", error);
      return res.status(500).json({ success: false, message: "Failed to create record" });
    }
  };
}

export const internalTagsController = new InternalTagsController();
