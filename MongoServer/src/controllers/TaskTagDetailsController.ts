import { Request, Response } from "express";
import { getMongoDb } from "../config/mongo";
import type { TaskTagDetails, DataTables } from "../types/jotbox";

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const parseJson = <T>(payload: string | undefined): T | null => {
  if (!payload) return null;
  try {
    return JSON.parse(payload) as T;
  } catch {
    return null;
  }
};

class TaskTagDetailsController {
  private async taskTagDetails() {
    const db = await getMongoDb();
    return db.collection<TaskTagDetails>("TaskTagDetails");
  }

  private async dataTables() {
    const db = await getMongoDb();
    return db.collection<DataTables>("DataTables");
  }

  private tableCollectionName(tableName: string) {
    return `datatable_${tableName.replace(/[^a-zA-Z0-9_]/g, "")}`;
  }

  getTaskTagDetails = async (req: Request, res: Response) => {
    try {
      const taskTagTableId = toNumber(req.params?.taskTagTableId);
      const taskTagId = toNumber(req.params?.taskTagId);
      if (taskTagTableId === null || taskTagId === null) {
        return res.status(400).json({ status: false, message: "Invalid parameters" });
      }
      const [detailsCollection, tablesCollection] = await Promise.all([
        this.taskTagDetails(),
        this.dataTables(),
      ]);
      const details = await detailsCollection.findOne(
        { taskTagTableId },
        { projection: { _id: 0 } }
      );
      const tableMeta = await tablesCollection.findOne(
        { tableId: taskTagTableId },
        { projection: { tableName: 1 } }
      );
      if (!details || !tableMeta) {
        return res.json({ status: true, message: "No data found", data: {} });
      }
      const db = await getMongoDb();
      const tableCollection = db.collection(this.tableCollectionName(tableMeta.tableName));
      const tableData = await tableCollection.findOne({ Id: taskTagId }, { projection: { _id: 0 } });
      const payload = {
        ...details,
        taskTagDetailsData: parseJson(details.taskTagDetailsData),
        tableName: tableMeta.tableName,
        tableData: tableData ?? {},
      };
      return res.json({ status: true, message: "Success", data: payload });
    } catch (error) {
      console.error("getTaskTagDetails error", error);
      return res.status(500).json({ status: false, message: "An unexpected error occurred" });
    }
  };

  getSearchTagDetails = async (req: Request, res: Response) => {
    try {
      const taskTagTableId = toNumber(req.params?.taskTagTableId);
      if (taskTagTableId === null) {
        return res.status(400).json({ status: false, message: "Invalid parameters" });
      }
      const collection = await this.taskTagDetails();
      const doc = await collection.findOne(
        { taskTagTableId },
        { projection: { taskTagDetailsData: 1, _id: 0 } }
      );
      if (!doc) {
        return res.json({ status: true, message: "No data found", data: {} });
      }
      return res.json({
        status: true,
        message: "Success",
        data: parseJson(doc.taskTagDetailsData) ?? {},
      });
    } catch (error) {
      console.error("getSearchTagDetails error", error);
      return res.status(500).json({ status: false, message: "An unexpected error occurred" });
    }
  };
}

export const taskTagDetailController = new TaskTagDetailsController();
