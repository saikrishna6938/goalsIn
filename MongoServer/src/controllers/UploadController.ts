import { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { getMongoDb } from "../config/mongo";
import type { UploadFiles, UserIntray } from "../types/jotbox";

type UploadFileDoc = UploadFiles & { fileData?: unknown };

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const normalizeString = (value: any): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }
  return undefined;
};

class UploadController {
  private async uploadFilesCollection() {
    const db = await getMongoDb();
    return db.collection<UploadFileDoc>("UploadFiles");
  }

  private async userIntrayCollection() {
    const db = await getMongoDb();
    return db.collection<UserIntray>("UserIntray");
  }

  private async nextId(collection: { find: (filter?: any, options?: any) => any }, field: string) {
    const doc = await collection
      .find({}, { projection: { [field]: 1 } })
      .sort({ [field]: -1 })
      .limit(1)
      .next();
    return ((doc?.[field] as number | undefined) ?? 0) + 1;
  }

  uploadFile = async (req: Request, res: Response) => {
    try {
      const collection = await this.uploadFilesCollection();
      const uploadId = await this.nextId(collection, "uploadId");
      const fileSize = toNumber(req.body?.fileSize) ?? 0;
      const doc: UploadFileDoc = {
        uploadId,
        uploadName: normalizeString(req.body?.uploadName),
        fileData: req.body?.fileData,
        fileName: normalizeString(req.body?.fileName) ?? `upload-${uploadId}`,
        fileType: normalizeString(req.body?.type) ?? "application/octet-stream",
        fileSize,
        uploadedDate: new Date() as any,
      };
      await collection.insertOne(doc);
      return res.json({ success: true, message: "File uploaded successfully", uploadId });
    } catch (error) {
      console.error("uploadFile error", error);
      return res.status(500).json({ success: false, message: "An error occurred while uploading the file." });
    }
  };

  private updateFileDataAndCleanupIntray = async (uploadId: number, filePath: string) => {
    const uploadFiles = await this.uploadFilesCollection();
    const userIntray = await this.userIntrayCollection();
    let wroteFile = false;
    let jsonStr = "";

    try {
      const doc = await uploadFiles.findOne({ uploadId }, { projection: { fileData: 1 } });
      if (!doc) {
        throw new Error(`UploadFiles row not found for uploadId=${uploadId}`);
      }
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      const payload = { fileData: doc.fileData };
      jsonStr = JSON.stringify(payload, null, 2);
      await fs.writeFile(filePath, jsonStr, "utf-8");
      wroteFile = true;
      const pointer = JSON.stringify({ path: filePath });
      await uploadFiles.updateOne({ uploadId }, { $set: { fileData: pointer } });
      await userIntray.deleteMany({ uploadId });
      return { success: true, writtenBytes: Buffer.byteLength(jsonStr, "utf-8") };
    } catch (error) {
      if (wroteFile) {
        try {
          await fs.unlink(filePath);
        } catch {}
      }
      throw error;
    }
  };

  updateToIndexDocument = async (req: Request, res: Response) => {
    try {
      const uploadId = toNumber(req.body?.uploadId);
      const filePath = normalizeString(req.body?.filePath);
      if (uploadId === null || !filePath) {
        return res.status(400).json({ success: false, message: "Invalid uploadId or filePath" });
      }
      const result = await this.updateFileDataAndCleanupIntray(uploadId, filePath);
      return res.json({
        success: true,
        message: "File indexed and intray cleaned",
        uploadId,
        filePath,
        writtenBytes: result.writtenBytes ?? 0,
      });
    } catch (error) {
      console.error("updateToIndexDocument error", error);
      return res.status(500).json({ success: false, message: "Error indexing file" });
    }
  };

  uploadUserIntray = async (req: Request, res: Response) => {
    try {
      const uploadFiles = await this.uploadFilesCollection();
      const userIntray = await this.userIntrayCollection();

      const uploadId = await this.nextId(uploadFiles, "uploadId");
      const fileSize = toNumber(req.body?.fileSize) ?? 0;
      const uploadDoc: UploadFileDoc = {
        uploadId,
        uploadName: normalizeString(req.body?.uploadName),
        fileData: req.body?.fileData,
        fileName: normalizeString(req.body?.fileName) ?? `upload-${uploadId}`,
        fileType: normalizeString(req.body?.type) ?? "application/octet-stream",
        fileSize,
        uploadedDate: new Date() as any,
      };
      await uploadFiles.insertOne(uploadDoc);

      const intrayId = await this.nextId(userIntray, "id");
      const intrayDoc: UserIntray = {
        id: intrayId,
        uploadId,
        userID: toNumber(req.body?.userId) ?? 0,
        intrayPath: normalizeString(req.body?.path),
        documentType: normalizeString(req.body?.documentType),
        dateTime: new Date() as any,
      };
      await userIntray.insertOne(intrayDoc);
      return res.json({
        success: true,
        message: "File uploaded and details added to UserIntray successfully",
        uploadId,
        intrayId,
      });
    } catch (error) {
      console.error("uploadUserIntray error", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while uploading the file and saving to UserIntray.",
      });
    }
  };

  getFile = async (req: Request, res: Response) => {
    try {
      const uploadName = normalizeString(req.body?.uploadName);
      if (!uploadName) {
        return res.status(400).json({ status: false, message: "uploadName is required" });
      }
      const collection = await this.uploadFilesCollection();
      const doc = await collection.findOne(
        { uploadName },
        {
          projection: {
            _id: 0,
            fileName: 1,
            fileType: 1,
            uploadName: 1,
            uploadedDate: 1,
            fileSize: 1,
            uploadId: 1,
          },
        }
      );
      if (!doc) {
        return res.json({ status: false, message: "File not found", data: null });
      }
      return res.json({ status: true, message: "Success", data: doc });
    } catch (error) {
      console.error("getFile error", error);
      return res.status(500).json({ status: false, message: "Failed to get object" });
    }
  };

  getFileData = async (req: Request, res: Response) => {
    try {
      const uploadId = toNumber(req.body?.uploadId);
      if (uploadId === null) {
        return res.status(400).json({ status: false, message: "uploadId is required" });
      }
      const collection = await this.uploadFilesCollection();
      const doc = await collection.findOne({ uploadId }, { projection: { _id: 0 } });
      if (!doc) {
        return res.json({ status: false, message: "File not found", data: null });
      }
      let fileData = doc.fileData;
      if (typeof fileData === "string") {
        try {
          const parsed = JSON.parse(fileData);
          if (parsed?.path) {
            const fileJson = await fs.readFile(parsed.path, "utf-8");
            const fileObj = JSON.parse(fileJson);
            fileData = fileObj.fileData ?? fileObj;
          }
        } catch {
          // ignore parse errors
        }
      }
      return res.json({ status: true, message: "Success", data: { ...doc, fileData } });
    } catch (error) {
      console.error("getFileData error", error);
      return res.status(500).json({ status: false, message: "Failed to get object" });
    }
  };
}

export const uploadController = new UploadController();
