import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import multer from "multer";
import keys from "../keys";
import fs from "fs/promises";
import path from "path";

class UploadController {
  async uploadFile(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const { uploadName, fileData, fileName, fileSize, type } = req.body;
      await connection.execute(
        "INSERT INTO UploadFiles(uploadName,fileData,fileName,fileType,fileSize) VALUES (?,?,?,?,?)",
        [uploadName, fileData, fileName, type, fileSize]
      );
      res.json({
        success: true,
        message: "File uploaded successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while uploading the file.");
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  /**
   * Express handler – uses arrow function to keep `this` bound.
   */
  updateToIndexDocument = async (req: Request, res: Response) => {
    try {
      const { uploadId, filePath } = req.body ?? {};

      // Basic validation
      const id = Number(uploadId);
      if (!Number.isFinite(id) || id <= 0) {
        res.status(400).json({ success: false, message: "Invalid uploadId" });
        return;
      }
      if (typeof filePath !== "string" || filePath.trim().length === 0) {
        res.status(400).json({ success: false, message: "Invalid filePath" });
        return;
      }

      const result = await this.updateFileDataAndCleanupIntray(id, filePath);

      res.status(200).json({
        success: true,
        message: "File indexed and intray cleaned",
        uploadId: id,
        filePath,
        writtenBytes: result.writtenBytes ?? 0,
      });
    } catch (error: any) {
      console.error("updateToIndexDocument error:", error);
      res.status(500).json({
        success: false,
        message: "Error indexing file",
        error: String(error?.message ?? error),
      });
    }
  };

  /**
   * Core operation – arrow function keeps `this` context if we expand later.
   * Transactional + file-system aware.
   */
  private updateFileDataAndCleanupIntray = async (
    uploadId: number,
    filePath: string
  ): Promise<{ success: boolean; writtenBytes?: number }> => {
    const conn = await mysql.createConnection(keys.database);
    let wroteFile = false;

    try {
      await conn.beginTransaction();

      // Lock the UploadFiles row to avoid races
      const [rows] = await conn.execute<Array<any>>(
        "SELECT fileData FROM UploadFiles WHERE uploadId = ? FOR UPDATE",
        [uploadId]
      );

      if (!rows || rows.length === 0) {
        throw new Error(`UploadFiles row not found for uploadId=${uploadId}`);
      }

      const fileData = (rows[0] as any).fileData;

      // Ensure target directory exists, then persist fileData to JSON
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });

      const jsonPayload = { fileData };
      const jsonStr = JSON.stringify(jsonPayload, null, 2);
      await fs.writeFile(filePath, jsonStr, "utf-8");
      wroteFile = true;

      // Update UploadFiles.fileData to pointer { path: filePath }
      const pointer = JSON.stringify({ path: filePath });
      await conn.execute<mysql.ResultSetHeader>(
        "UPDATE UploadFiles SET fileData = ? WHERE uploadId = ?",
        [pointer, uploadId]
      );

      // Remove any matching intray rows by uploadId
      await conn.execute<mysql.ResultSetHeader>(
        "DELETE FROM UserIntray WHERE uploadId = ?",
        [uploadId]
      );

      await conn.commit();

      return {
        success: true,
        writtenBytes: Buffer.byteLength(jsonStr, "utf-8"),
      };
    } catch (err) {
      try {
        await conn.rollback();
      } catch {}
      if (wroteFile) {
        try {
          await fs.unlink(filePath);
        } catch {}
      }
      throw err;
    } finally {
      await conn.end();
    }
  };

  async uploadUserIntray(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const {
        uploadName = null,
        fileData = null,
        fileName = null,
        fileSize = null,
        type = null,
        userId = null,
        documentType = null,
        path: intrayPath = null,
      } = req.body;

      // Insert into UploadFiles and get the new uploadId
      const [result] = await connection.execute(
        "INSERT INTO UploadFiles (uploadName, fileData, fileName, fileType, fileSize) VALUES (?, ?, ?, ?, ?)",
        [uploadName, fileData, fileName, type, fileSize]
      );

      // @ts-ignore
      const uploadId = result.insertId;

      // Insert into UserIntray
      await connection.execute(
        "INSERT INTO UserIntray (uploadId, userID, intrayPath, documentType) VALUES (?, ?, ?, ?)",
        [uploadId, userId, intrayPath, documentType]
      );

      res.json({
        success: true,
        message: "File uploaded and details added to UserIntray successfully",
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send(
          "An error occurred while uploading the file and saving to UserIntray."
        );
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  async getFile(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const { uploadName } = req.body;
      const [result] = await connection.execute(
        "SELECT fileName,fileType,uploadName,uploadedDate,fileSize,uploadId FROM UploadFiles WHERE uploadName = ?",
        [uploadName]
      );
      // @ts-ignore
      if (result[0]) {
        // @ts-ignore
        res.json({ status: true, message: "Success", data: result[0] });
      } else {
        res.json({ status: false, message: "File not found", data: null });
      }
    } catch (error) {
      console.log(error);
      res.json({ status: false, message: "Failed to get object" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  async getFileData(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const { uploadId } = req.body;
      const [rows] = await connection.execute(
        "SELECT * FROM UploadFiles WHERE uploadId = ?",
        [uploadId]
      );
      await connection.end();

      // @ts-ignore
      if (!rows || rows.length === 0) {
        res.json({ status: false, message: "File not found", data: null });
        return;
      }

      // @ts-ignore
      const row = rows[0];
      let fileData = row.fileData;

      try {
        const parsed = JSON.parse(fileData);
        if (parsed && parsed.path) {
          // It's a pointer → read file from disk
          const fileJson = await fs.readFile(parsed.path, "utf-8");
          const fileObj = JSON.parse(fileJson);
          fileData = fileObj.fileData ?? fileObj; // fallback if structure changes
        }
      } catch {
        // Not JSON → keep fileData as-is
      }

      // Overwrite the DB row's fileData with resolved data
      row.fileData = fileData;

      res.json({ status: true, message: "Success", data: row });
    } catch (error) {
      console.error(error);
      res.json({ status: false, message: "Failed to get object" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
}

export const uploadController: UploadController = new UploadController();
