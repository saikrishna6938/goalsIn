"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentObjectController = void 0;
const promises_1 = __importDefault(require("fs/promises"));
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
const deepParse = (value, depth = 3) => {
    let current = value;
    for (let i = 0; i < depth; i++) {
        if (typeof current === "string") {
            try {
                current = JSON.parse(current);
            }
            catch {
                return current;
            }
        }
        else {
            break;
        }
    }
    return current;
};
class DocumentObjectController {
    constructor() {
        this.getByTaskId = async (req, res) => {
            let uploadDocument;
            try {
                const taskId = toNumber(req.body?.taskId);
                if (taskId === null || taskId <= 0) {
                    return res.status(400).json({ success: false, message: "Invalid taskId" });
                }
                const db = await (0, mongo_1.getMongoDb)();
                const answers = await db
                    .collection("DocumentTagAnswers")
                    .find({ taskId })
                    .sort({ documentTagAnswersId: -1 })
                    .limit(1)
                    .next();
                if (!answers) {
                    return res.status(404).json({ success: false, message: "No document answers found for taskId" });
                }
                const uploadIdNumeric = toNumber(answers.uploadId);
                const uploads = await db
                    .collection("UploadFiles")
                    .findOne(uploadIdNumeric !== null ? { uploadId: uploadIdNumeric } : { uploadId: answers.uploadId }, { projection: { _id: 0 } });
                if (!uploads) {
                    return res.status(404).json({ success: false, message: "Upload not found" });
                }
                let documentObject = uploads.fileData;
                const parsedPointer = deepParse(uploads.fileData, 3);
                if (parsedPointer && typeof parsedPointer === "object" && parsedPointer.path) {
                    const filePath = parsedPointer.path;
                    try {
                        const jsonStr = await promises_1.default.readFile(filePath, "utf-8");
                        const onDisk = deepParse(jsonStr, 2);
                        documentObject =
                            onDisk && typeof onDisk === "object" && onDisk.fileData ? onDisk.fileData : onDisk;
                    }
                    catch {
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
            }
            catch (error) {
                console.error("getByTaskId error:", error);
                return res.status(500).json({
                    status: false,
                    message: "Failed to get document object",
                });
            }
        };
    }
}
exports.documentObjectController = new DocumentObjectController();
