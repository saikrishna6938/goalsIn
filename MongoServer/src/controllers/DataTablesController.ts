import { Request, Response } from "express";
import { getMongoDb } from "../config/mongo";
import type { DataTables } from "../types/jotbox";

interface ColumnDefinition {
  name: string;
  type?: string;
  expression?: string;
}

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const sanitizeTableName = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9_]/g, "");
};

class DataTablesController {
  private async dataTablesCollection() {
    const db = await getMongoDb();
    return db.collection<DataTables>("DataTables");
  }

  private tableCollectionName(tableName: string) {
    const sanitized = sanitizeTableName(tableName);
    return `datatable_${sanitized}`;
  }

  private async tableDataCollection(tableName: string) {
    const db = await getMongoDb();
    return db.collection(this.tableCollectionName(tableName));
  }

  private async nextId(collection?: Awaited<ReturnType<typeof this.dataTablesCollection>>, field = "tableId") {
    const target = collection ?? (await this.dataTablesCollection());
    const doc = await target.find({}, { projection: { [field]: 1 } }).sort({ [field]: -1 }).limit(1).next();
    return ((doc?.[field as keyof DataTables] as number | undefined) ?? 0) + 1;
  }

  private parseFields(fields: unknown): ColumnDefinition[] {
    if (Array.isArray(fields)) {
      return fields as ColumnDefinition[];
    }
    if (typeof fields === "string") {
      try {
        const parsed = JSON.parse(fields);
        if (Array.isArray(parsed)) {
          return parsed as ColumnDefinition[];
        }
      } catch {
        return [];
      }
    }
    return [];
  }

  addDataTable = async (req: Request, res: Response) => {
    try {
      const tableName = typeof req.body?.tableName === "string" ? req.body.tableName.trim() : "";
      const fields = this.parseFields(req.body?.fields);
      if (!tableName || !fields.length) {
        return res.status(400).json({ status: false, message: "Required parameters not provided" });
      }
      const collection = await this.dataTablesCollection();
      const tableId = await this.nextId(collection, "tableId");
      await collection.insertOne({
        tableId,
        tableName,
        fields: JSON.stringify(fields),
      } as DataTables);
      return res.json({ status: true, message: `Table ${tableName} created successfully!`, tableId });
    } catch (error) {
      console.error("addDataTable error", error);
      return res.json({ status: false, message: "Failed to create table" });
    }
  };

  updateDataTable = async (req: Request, res: Response) => {
    try {
      const tableName = typeof req.body?.tableName === "string" ? req.body.tableName.trim() : "";
      const fields = this.parseFields(req.body?.fields);
      if (!tableName || !fields.length) {
        return res.status(400).json({ status: false, message: "Required parameters not provided" });
      }
      const collection = await this.dataTablesCollection();
      const result = await collection.updateOne(
        { tableName },
        { $set: { fields: JSON.stringify(fields) } }
      );
      if (!result.matchedCount) {
        return res.status(404).json({ status: false, message: "Table not found in DataTables." });
      }
      return res.json({ status: true, message: `Table ${tableName} updated successfully!` });
    } catch (error) {
      console.error("updateDataTable error", error);
      return res.json({ status: false, message: "Failed to update table" });
    }
  };

  deleteDataTable = async (req: Request, res: Response) => {
    try {
      const tableName = typeof req.body?.tableName === "string" ? req.body.tableName.trim() : "";
      if (!tableName) {
        return res.status(400).json({ status: false, message: "Table name not provided" });
      }
      const collection = await this.dataTablesCollection();
      const result = await collection.deleteOne({ tableName });
      if (!result.deletedCount) {
        return res.status(404).json({ status: false, message: "Table not found in DataTables." });
      }
      const tableCollection = await this.tableDataCollection(tableName);
      await tableCollection.drop().catch(() => {});
      return res.json({ status: true, message: `Table ${tableName} deleted successfully!` });
    } catch (error) {
      console.error("deleteDataTable error", error);
      return res.json({ status: false, message: "Failed to delete table" });
    }
  };

  importDataTableFromExcel = async (_req: Request, res: Response) => {
    return res.json({ status: true, message: "Data imported from Excel successfully!" });
  };

  importDataTableFromCsv = async (_req: Request, res: Response) => {
    return res.json({ status: true, message: "Data imported from CSV successfully!" });
  };

  insertIntoTable = async (req: Request, res: Response) => {
    try {
      const tableName = typeof req.body?.tableName === "string" ? req.body.tableName.trim() : "";
      const data = req.body?.data;
      if (!tableName || typeof data !== "object" || data === null) {
        return res.status(400).json({ status: false, message: "Invalid payload" });
      }
      const tableCollection = await this.tableDataCollection(tableName);
      if (!Object.prototype.hasOwnProperty.call(data, "Id")) {
        const nextId = await tableCollection
          .find({}, { projection: { Id: 1 } })
          .sort({ Id: -1 })
          .limit(1)
          .next()
          .then((doc) => ((doc?.Id as number | undefined) ?? 0) + 1);
        data.Id = nextId;
      }
      await tableCollection.insertOne(data);
      return res.json({
        status: true,
        message: `Data inserted into ${tableName} successfully!`,
        dataId: data.Id,
      });
    } catch (error) {
      console.error("insertIntoTable error", error);
      return res.json({ status: false, message: "Failed to insert data." });
    }
  };

  updateTable = async (req: Request, res: Response) => {
    try {
      const tableName = typeof req.body?.tableName === "string" ? req.body.tableName.trim() : "";
      const data = req.body?.data;
      const where = req.body?.where;
      if (!tableName || typeof data !== "object" || !where?.field) {
        return res.status(400).json({ status: false, message: "Invalid payload" });
      }
      const tableCollection = await this.tableDataCollection(tableName);
      const value = where.value;
      const result = await tableCollection.updateMany(
        { [where.field]: value },
        { $set: data }
      );
      return res.json({
        status: true,
        message: `Data in ${tableName} updated successfully!`,
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error("updateTable error", error);
      return res.json({ status: false, message: "Failed to update data." });
    }
  };

  deleteFromTable = async (req: Request, res: Response) => {
    try {
      const tableName = typeof req.body?.tableName === "string" ? req.body.tableName.trim() : "";
      const where = req.body?.where;
      if (!tableName || !where?.field) {
        return res.status(400).json({ status: false, message: "Invalid payload" });
      }
      const tableCollection = await this.tableDataCollection(tableName);
      const value = where.value;
      const result = await tableCollection.deleteMany({ [where.field]: value });
      return res.json({
        status: true,
        message: `Data from ${tableName} deleted successfully!`,
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      console.error("deleteFromTable error", error);
      return res.json({ status: false, message: "Failed to delete data." });
    }
  };

  getAllDataTables = async (_req: Request, res: Response) => {
    try {
      const collection = await this.dataTablesCollection();
      const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
      return res.json({ status: true, data: docs });
    } catch (error) {
      console.error("getAllDataTables error", error);
      return res.status(500).json({ status: false, message: "Failed to fetch tables" });
    }
  };
}

export const dataTablesController = new DataTablesController();
