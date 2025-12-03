"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadController = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const mongo_1 = require("../config/mongo");
const toNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value.trim());
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};
const normalizeString = (value) => {
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length ? trimmed : undefined;
    }
    return undefined;
};
class UploadController {
    constructor() {
        this.uploadFile = async (req, res) => {
            try {
                const collection = await this.uploadFilesCollection();
                const uploadId = await this.nextId(collection, "uploadId");
                const fileSize = toNumber(req.body?.fileSize) ?? 0;
                const doc = {
                    uploadId,
                    uploadName: normalizeString(req.body?.uploadName),
                    fileData: req.body?.fileData,
                    fileName: normalizeString(req.body?.fileName) ?? `upload-${uploadId}`,
                    fileType: normalizeString(req.body?.type) ?? "application/octet-stream",
                    fileSize,
                    uploadedDate: new Date(),
                };
                await collection.insertOne(doc);
                return res.json({ success: true, message: "File uploaded successfully", uploadId });
            }
            catch (error) {
                console.error("uploadFile error", error);
                return res.status(500).json({ success: false, message: "An error occurred while uploading the file." });
            }
        };
        this.updateFileDataAndCleanupIntray = async (uploadId, filePath) => {
            const uploadFiles = await this.uploadFilesCollection();
            const userIntray = await this.userIntrayCollection();
            let wroteFile = false;
            let jsonStr = "";
            try {
                const doc = await uploadFiles.findOne({ uploadId }, { projection: { fileData: 1 } });
                if (!doc) {
                    throw new Error(`UploadFiles row not found for uploadId=${uploadId}`);
                }
                const dir = path_1.default.dirname(filePath);
                await promises_1.default.mkdir(dir, { recursive: true });
                const payload = { fileData: doc.fileData };
                jsonStr = JSON.stringify(payload, null, 2);
                await promises_1.default.writeFile(filePath, jsonStr, "utf-8");
                wroteFile = true;
                const pointer = JSON.stringify({ path: filePath });
                await uploadFiles.updateOne({ uploadId }, { $set: { fileData: pointer } });
                await userIntray.deleteMany({ uploadId });
                return { success: true, writtenBytes: Buffer.byteLength(jsonStr, "utf-8") };
            }
            catch (error) {
                if (wroteFile) {
                    try {
                        await promises_1.default.unlink(filePath);
                    }
                    catch { }
                }
                throw error;
            }
        };
        this.updateToIndexDocument = async (req, res) => {
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
            }
            catch (error) {
                console.error("updateToIndexDocument error", error);
                return res.status(500).json({ success: false, message: "Error indexing file" });
            }
        };
        this.uploadUserIntray = async (req, res) => {
            try {
                const uploadFiles = await this.uploadFilesCollection();
                const userIntray = await this.userIntrayCollection();
                const uploadId = await this.nextId(uploadFiles, "uploadId");
                const fileSize = toNumber(req.body?.fileSize) ?? 0;
                const uploadDoc = {
                    uploadId,
                    uploadName: normalizeString(req.body?.uploadName),
                    fileData: req.body?.fileData,
                    fileName: normalizeString(req.body?.fileName) ?? `upload-${uploadId}`,
                    fileType: normalizeString(req.body?.type) ?? "application/octet-stream",
                    fileSize,
                    uploadedDate: new Date(),
                };
                await uploadFiles.insertOne(uploadDoc);
                const intrayId = await this.nextId(userIntray, "id");
                const intrayDoc = {
                    id: intrayId,
                    uploadId,
                    userID: toNumber(req.body?.userId) ?? 0,
                    intrayPath: normalizeString(req.body?.path),
                    documentType: normalizeString(req.body?.documentType),
                    dateTime: new Date(),
                };
                await userIntray.insertOne(intrayDoc);
                return res.json({
                    success: true,
                    message: "File uploaded and details added to UserIntray successfully",
                    uploadId,
                    intrayId,
                });
            }
            catch (error) {
                console.error("uploadUserIntray error", error);
                return res.status(500).json({
                    success: false,
                    message: "An error occurred while uploading the file and saving to UserIntray.",
                });
            }
        };
        this.getFile = async (req, res) => {
            try {
                const uploadName = normalizeString(req.body?.uploadName);
                if (!uploadName) {
                    return res.status(400).json({ status: false, message: "uploadName is required" });
                }
                const collection = await this.uploadFilesCollection();
                const doc = await collection.findOne({ uploadName }, {
                    projection: {
                        _id: 0,
                        fileName: 1,
                        fileType: 1,
                        uploadName: 1,
                        uploadedDate: 1,
                        fileSize: 1,
                        uploadId: 1,
                    },
                });
                if (!doc) {
                    return res.json({ status: false, message: "File not found", data: null });
                }
                return res.json({ status: true, message: "Success", data: doc });
            }
            catch (error) {
                console.error("getFile error", error);
                return res.status(500).json({ status: false, message: "Failed to get object" });
            }
        };
        this.getFileData = async (req, res) => {
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
                            const fileJson = await promises_1.default.readFile(parsed.path, "utf-8");
                            const fileObj = JSON.parse(fileJson);
                            fileData = fileObj.fileData ?? fileObj;
                        }
                    }
                    catch {
                        // ignore parse errors
                    }
                }
                return res.json({ status: true, message: "Success", data: { ...doc, fileData } });
            }
            catch (error) {
                console.error("getFileData error", error);
                return res.status(500).json({ status: false, message: "Failed to get object" });
            }
        };
    }
    async uploadFilesCollection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("UploadFiles");
    }
    async userIntrayCollection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("UserIntray");
    }
    async nextId(collection, field) {
        const doc = await collection
            .find({}, { projection: { [field]: 1 } })
            .sort({ [field]: -1 })
            .limit(1)
            .next();
        return (doc?.[field] ?? 0) + 1;
    }
}
exports.uploadController = new UploadController();
