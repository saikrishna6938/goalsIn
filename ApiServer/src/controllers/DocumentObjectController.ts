import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../keys";
import fs from "fs/promises";

class DocumentObjectController {
  /**
   * Returns the stored document object for a given taskId.
   * Flow:
   * 1) Find latest DocumentTagAnswers row by taskId to get uploadId
   * 2) Read UploadFiles.fileData for that uploadId
   * 3) If fileData is a pointer JSON with { path }, read the JSON file and unwrap { fileData }
   * 4) Return the resolved document object
   */
  async getByTaskId(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const { taskId } = req.body ?? {};
      const id = Number(taskId);
      if (!Number.isFinite(id) || id <= 0) {
        res.status(400).json({ success: false, message: "Invalid taskId" });
        return;
      }

      connection = await mysql.createConnection(keys.database);

      // 1) Get the most recent DocumentTagAnswers row for this taskId (to access uploadId)
      const [ansRows] = await connection.execute<Array<any>>(
        `SELECT uploadId, documentTagAnswersId
         FROM DocumentTagAnswers
         WHERE taskId = ?
         ORDER BY documentTagAnswersId DESC
         LIMIT 1`,
        [id]
      );

      if (!ansRows || ansRows.length === 0) {
        res.status(404).json({
          success: false,
          message: "No document answers found for taskId",
        });
        return;
      }

      const uploadId = Number(ansRows[0].uploadId);
      if (!Number.isFinite(uploadId) || uploadId <= 0) {
        res.status(404).json({
          success: false,
          message: "No uploadId linked to taskId",
        });
        return;
      }

      // 2) Fetch UploadFiles row
      const [fileRows] = await connection.execute<Array<any>>(
        `SELECT uploadId, fileName, fileType, fileSize, uploadedDate, fileData
         FROM UploadFiles WHERE uploadId = ?`,
        [uploadId]
      );

      if (!fileRows || fileRows.length === 0) {
        res.status(404).json({ success: false, message: "Upload not found" });
        return;
      }

      const upload = fileRows[0];
      let documentObject: any = upload.fileData;

      // 3) If fileData is a pointer JSON → read the JSON file on disk and unwrap
      const deepParse = (val: any, maxDepth = 3): any => {
        let out = val;
        for (let i = 0; i < maxDepth; i++) {
          if (typeof out === "string") {
            try {
              out = JSON.parse(out);
            } catch {
              break;
            }
          } else {
            break;
          }
        }
        return out;
      };

      const parsedPointer = deepParse(upload.fileData, 3);
      if (parsedPointer && typeof parsedPointer === "object" && (parsedPointer as any).path) {
        try {
          const filePath: string = (parsedPointer as any).path;
          const jsonStr = await fs.readFile(filePath, "utf-8");
          const onDisk = deepParse(jsonStr, 2);
          documentObject = (onDisk && typeof onDisk === "object" && (onDisk as any).fileData)
            ? (onDisk as any).fileData
            : onDisk;
        } catch (e) {
          // If file read fails, fall back to the pointer itself
          documentObject = parsedPointer;
        }
      }

      res.json({
        status: true,
        message: "Success",
        data: documentObject,
        meta: { uploadId },
      });
    } catch (error: any) {
      console.error("getByTaskId error:", error);
      res.status(500).json({
        status: false,
        message: "Failed to get document object",
        error: String(error?.message ?? error),
      });
    } finally {
      if (connection) {
        try { await connection.end(); } catch {}
      }
    }
  }
}

export const documentObjectController = new DocumentObjectController();
