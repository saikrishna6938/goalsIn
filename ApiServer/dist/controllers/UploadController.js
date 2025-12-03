"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadController = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../keys"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class UploadController {
    constructor() {
        /**
         * Express handler – uses arrow function to keep `this` bound.
         */
        this.updateToIndexDocument = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const { uploadId, filePath } = (_a = req.body) !== null && _a !== void 0 ? _a : {};
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
                const result = yield this.updateFileDataAndCleanupIntray(id, filePath);
                res.status(200).json({
                    success: true,
                    message: "File indexed and intray cleaned",
                    uploadId: id,
                    filePath,
                    writtenBytes: (_b = result.writtenBytes) !== null && _b !== void 0 ? _b : 0,
                });
            }
            catch (error) {
                console.error("updateToIndexDocument error:", error);
                res.status(500).json({
                    success: false,
                    message: "Error indexing file",
                    error: String((_c = error === null || error === void 0 ? void 0 : error.message) !== null && _c !== void 0 ? _c : error),
                });
            }
        });
        /**
         * Core operation – arrow function keeps `this` context if we expand later.
         * Transactional + file-system aware.
         */
        this.updateFileDataAndCleanupIntray = (uploadId, filePath) => __awaiter(this, void 0, void 0, function* () {
            const conn = yield mysql.createConnection(keys_1.default.database);
            let wroteFile = false;
            try {
                yield conn.beginTransaction();
                // Lock the UploadFiles row to avoid races
                const [rows] = yield conn.execute("SELECT fileData FROM UploadFiles WHERE uploadId = ? FOR UPDATE", [uploadId]);
                if (!rows || rows.length === 0) {
                    throw new Error(`UploadFiles row not found for uploadId=${uploadId}`);
                }
                const fileData = rows[0].fileData;
                // Ensure target directory exists, then persist fileData to JSON
                const dir = path_1.default.dirname(filePath);
                yield promises_1.default.mkdir(dir, { recursive: true });
                const jsonPayload = { fileData };
                const jsonStr = JSON.stringify(jsonPayload, null, 2);
                yield promises_1.default.writeFile(filePath, jsonStr, "utf-8");
                wroteFile = true;
                // Update UploadFiles.fileData to pointer { path: filePath }
                const pointer = JSON.stringify({ path: filePath });
                yield conn.execute("UPDATE UploadFiles SET fileData = ? WHERE uploadId = ?", [pointer, uploadId]);
                // Remove any matching intray rows by uploadId
                yield conn.execute("DELETE FROM UserIntray WHERE uploadId = ?", [uploadId]);
                yield conn.commit();
                return {
                    success: true,
                    writtenBytes: Buffer.byteLength(jsonStr, "utf-8"),
                };
            }
            catch (err) {
                try {
                    yield conn.rollback();
                }
                catch (_d) { }
                if (wroteFile) {
                    try {
                        yield promises_1.default.unlink(filePath);
                    }
                    catch (_e) { }
                }
                throw err;
            }
            finally {
                yield conn.end();
            }
        });
    }
    uploadFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const { uploadName, fileData, fileName, fileSize, type } = req.body;
                yield connection.execute("INSERT INTO UploadFiles(uploadName,fileData,fileName,fileType,fileSize) VALUES (?,?,?,?,?)", [uploadName, fileData, fileName, type, fileSize]);
                res.json({
                    success: true,
                    message: "File uploaded successfully",
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).send("An error occurred while uploading the file.");
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    uploadUserIntray(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const { uploadName = null, fileData = null, fileName = null, fileSize = null, type = null, userId = null, documentType = null, path: intrayPath = null, } = req.body;
                // Insert into UploadFiles and get the new uploadId
                const [result] = yield connection.execute("INSERT INTO UploadFiles (uploadName, fileData, fileName, fileType, fileSize) VALUES (?, ?, ?, ?, ?)", [uploadName, fileData, fileName, type, fileSize]);
                // @ts-ignore
                const uploadId = result.insertId;
                // Insert into UserIntray
                yield connection.execute("INSERT INTO UserIntray (uploadId, userID, intrayPath, documentType) VALUES (?, ?, ?, ?)", [uploadId, userId, intrayPath, documentType]);
                res.json({
                    success: true,
                    message: "File uploaded and details added to UserIntray successfully",
                });
            }
            catch (error) {
                console.error(error);
                res
                    .status(500)
                    .send("An error occurred while uploading the file and saving to UserIntray.");
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    getFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const { uploadName } = req.body;
                const [result] = yield connection.execute("SELECT fileName,fileType,uploadName,uploadedDate,fileSize,uploadId FROM UploadFiles WHERE uploadName = ?", [uploadName]);
                // @ts-ignore
                if (result[0]) {
                    // @ts-ignore
                    res.json({ status: true, message: "Success", data: result[0] });
                }
                else {
                    res.json({ status: false, message: "File not found", data: null });
                }
            }
            catch (error) {
                console.log(error);
                res.json({ status: false, message: "Failed to get object" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    getFileData(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const { uploadId } = req.body;
                const [rows] = yield connection.execute("SELECT * FROM UploadFiles WHERE uploadId = ?", [uploadId]);
                yield connection.end();
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
                        const fileJson = yield promises_1.default.readFile(parsed.path, "utf-8");
                        const fileObj = JSON.parse(fileJson);
                        fileData = (_a = fileObj.fileData) !== null && _a !== void 0 ? _a : fileObj; // fallback if structure changes
                    }
                }
                catch (_b) {
                    // Not JSON → keep fileData as-is
                }
                // Overwrite the DB row's fileData with resolved data
                row.fileData = fileData;
                res.json({ status: true, message: "Success", data: row });
            }
            catch (error) {
                console.error(error);
                res.json({ status: false, message: "Failed to get object" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_c) { }
                }
            }
        });
    }
}
exports.uploadController = new UploadController();
//# sourceMappingURL=UploadController.js.map