import { Request, Response } from "express";
import { getMongoDb } from "../config/mongo";
import type { History, Users, HistoryTypes } from "../types/jotbox";

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

class HistoryController {
  private async collection() {
    const db = await getMongoDb();
    return db.collection<History>("History");
  }

  private async nextId() {
    const collection = await this.collection();
    const doc = await collection.find({}, { projection: { historyId: 1 } }).sort({ historyId: -1 }).limit(1).next();
    return ((doc?.historyId as number | undefined) ?? 0) + 1;
  }

  addHistory = async (req: Request, res: Response) => {
    try {
      const historyTypeId = toNumber(req.body?.historyTypeId);
      const historyUserId = toNumber(req.body?.historyUserId);
      const historyTaskId = toNumber(req.body?.historyTaskId);
      if (historyTypeId === null || historyUserId === null || historyTaskId === null) {
        return res.status(400).json({ message: "Required fields are missing." });
      }
      const collection = await this.collection();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const exists = await collection.findOne({
        historyTypeId,
        historyUserId,
        historyTaskId,
        historyCreatedDate: { $gte: today },
      });
      if (exists) {
        return res.json({
          status: true,
          message: "History already exists for today!",
          data: exists,
        });
      }
      await collection.insertOne({
        historyId: await this.nextId(),
        historyTypeId,
        historyUserId,
        historyCreatedDate: new Date() as any,
        historyTaskId,
      } as History);
      return res.json({ status: true, message: "History added successfully!" });
    } catch (error) {
      console.error("addHistory error", error);
      return res.status(500).json({ status: false, message: "Internal server error." });
    }
  };

  getHistoryByTaskId = async (req: Request, res: Response) => {
    try {
      const taskId = toNumber(req.params?.taskId);
      if (taskId === null) {
        return res.status(400).json({ message: "TaskId is required." });
      }
      const db = await getMongoDb();
      const pipeline = [
        { $match: { historyTaskId: taskId } },
        {
          $lookup: {
            from: "HistoryTypes",
            localField: "historyTypeId",
            foreignField: "historyTypeId",
            as: "historyType",
          },
        },
        { $unwind: { path: "$historyType", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "Users",
            localField: "historyUserId",
            foreignField: "userId",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            historyId: 1,
            historyUserId: 1,
            historyCreatedDate: 1,
            historyTaskId: 1,
            historyTypeName: "$historyType.historyTypeName",
            userFirstName: "$user.userFirstName",
            userLastName: "$user.userLastName",
          },
        },
      ];
      const docs = await db.collection("History").aggregate(pipeline).toArray();
      return res.json({
        status: true,
        message: "History retrieved successfully!",
        data: docs,
      });
    } catch (error) {
      console.error("getHistoryByTaskId error", error);
      return res.status(500).json({ status: false, message: "Internal server error." });
    }
  };
}

export const historyController = new HistoryController();
