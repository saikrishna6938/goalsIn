import { Request, Response } from "express";
import fs from "fs/promises";
import { getMongoDb } from "../config/mongo";
import type { DocumentTagAnswers, UploadFiles } from "../types/jotbox";

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const deepParse = (value: unknown, depth = 3): any => {
  let current = value;
  for (let i = 0; i < depth; i++) {
    if (typeof current === "string") {
      try {
        current = JSON.parse(current);
      } catch {
        return current;
      }
    } else {
      break;
    }
  }
  return current;
};

class DocumentObjectController {
  getByTaskId = async (req: Request, res: Response) => {
    let uploadDocument: any;
    try {
      const taskId = toNumber(req.body?.taskId);
      if (taskId === null || taskId <= 0) {
        return res.status(400).json({ success: false, message: "Invalid taskId" });
      }
      const db = await getMongoDb();
      const answers = await db
        .collection<DocumentTagAnswers>("DocumentTagAnswers")
        .find({ taskId })
        .sort({ documentTagAnswersId: -1 })
        .limit(1)
        .next();
      if (!answers) {
        return res.status(404).json({ success: false, message: "No document answers found for taskId" });
      }
      const uploadIdNumeric = toNumber(answers.uploadId);
      const uploads = await db
        .collection<UploadFiles>("UploadFiles")
        .findOne(
          uploadIdNumeric !== null ? { uploadId: uploadIdNumeric } : { uploadId: answers.uploadId as any },
          { projection: { _id: 0 } }
        );
      if (!uploads) {
        return res.status(404).json({ success: false, message: "Upload not found" });
      }
      let documentObject: any = uploads.fileData;
      const parsedPointer = deepParse(uploads.fileData, 3);
      if (parsedPointer && typeof parsedPointer === "object" && (parsedPointer as any).path) {
        const filePath = (parsedPointer as any).path;
        try {
          const jsonStr = await fs.readFile(filePath, "utf-8");
          const onDisk = deepParse(jsonStr, 2);
          documentObject =
            onDisk && typeof onDisk === "object" && (onDisk as any).fileData ? (onDisk as any).fileData : onDisk;
        } catch {
          documentObject = parsedPointer;
        }
      }
      uploadDocument = documentObject;
      return res.json({
        status: true,
        message: "Success",
        data: documentObject,
        meta: { uploadId: uploads.uploadId },
      });
    } catch (error) {
      console.error("getByTaskId error:", error);
      return res.status(500).json({
        status: false,
        message: "Failed to get document object",
      });
    }
  };
}

export const documentObjectController = new DocumentObjectController();
