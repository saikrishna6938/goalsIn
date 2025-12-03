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
exports.documentObjectController = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../keys"));
const promises_1 = __importDefault(require("fs/promises"));
class DocumentObjectController {
    /**
     * Returns the stored document object for a given taskId.
     * Flow:
     * 1) Find latest DocumentTagAnswers row by taskId to get uploadId
     * 2) Read UploadFiles.fileData for that uploadId
     * 3) If fileData is a pointer JSON with { path }, read the JSON file and unwrap { fileData }
     * 4) Return the resolved document object
     */
    getByTaskId(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { taskId } = (_a = req.body) !== null && _a !== void 0 ? _a : {};
                const id = Number(taskId);
                if (!Number.isFinite(id) || id <= 0) {
                    res.status(400).json({ success: false, message: "Invalid taskId" });
                    return;
                }
                connection = yield mysql.createConnection(keys_1.default.database);
                // 1) Get the most recent DocumentTagAnswers row for this taskId (to access uploadId)
                const [ansRows] = yield connection.execute(`SELECT uploadId, documentTagAnswersId
         FROM DocumentTagAnswers
         WHERE taskId = ?
         ORDER BY documentTagAnswersId DESC
         LIMIT 1`, [id]);
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
                const [fileRows] = yield connection.execute(`SELECT uploadId, fileName, fileType, fileSize, uploadedDate, fileData
         FROM UploadFiles WHERE uploadId = ?`, [uploadId]);
                if (!fileRows || fileRows.length === 0) {
                    res.status(404).json({ success: false, message: "Upload not found" });
                    return;
                }
                const upload = fileRows[0];
                let documentObject = upload.fileData;
                // 3) If fileData is a pointer JSON → read the JSON file on disk and unwrap
                const deepParse = (val, maxDepth = 3) => {
                    let out = val;
                    for (let i = 0; i < maxDepth; i++) {
                        if (typeof out === "string") {
                            try {
                                out = JSON.parse(out);
                            }
                            catch (_a) {
                                break;
                            }
                        }
                        else {
                            break;
                        }
                    }
                    return out;
                };
                const parsedPointer = deepParse(upload.fileData, 3);
                if (parsedPointer && typeof parsedPointer === "object" && parsedPointer.path) {
                    try {
                        const filePath = parsedPointer.path;
                        const jsonStr = yield promises_1.default.readFile(filePath, "utf-8");
                        const onDisk = deepParse(jsonStr, 2);
                        documentObject = (onDisk && typeof onDisk === "object" && onDisk.fileData)
                            ? onDisk.fileData
                            : onDisk;
                    }
                    catch (e) {
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
            }
            catch (error) {
                console.error("getByTaskId error:", error);
                res.status(500).json({
                    status: false,
                    message: "Failed to get document object",
                    error: String((_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : error),
                });
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
exports.documentObjectController = new DocumentObjectController();
//# sourceMappingURL=DocumentObjectController.js.map