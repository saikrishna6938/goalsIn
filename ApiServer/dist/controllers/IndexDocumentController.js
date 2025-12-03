"use strict";
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
exports.indexDocumentController = exports.IndexDocumentController = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const keys_1 = __importDefault(require("../keys"));
class IndexDocumentController {
    constructor() { }
    // POST /administrator/index-documents
    createIndexDocument(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const { taskId, uploadId, answersObject, // JSON object with tag answers
                 } = req.body;
                if (!taskId || !uploadId || !answersObject) {
                    res.status(400).json({
                        success: false,
                        message: "taskId, uploadId, and answersObject are required",
                    });
                    return;
                }
                const [result] = yield conn.execute(`INSERT INTO DocumentTagAnswers (documentTagAnswersObject, taskId, uploadId)
         VALUES (?, ?, ?)`, [JSON.stringify(answersObject), taskId, uploadId]);
                res.status(201).json({
                    success: true,
                    message: "Index document created successfully",
                    insertId: result.insertId,
                });
            }
            catch (error) {
                console.error("createIndexDocument error:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to create index document",
                    error: error.message,
                });
            }
            finally {
                yield conn.end();
            }
        });
    }
}
exports.IndexDocumentController = IndexDocumentController;
exports.indexDocumentController = new IndexDocumentController();
//# sourceMappingURL=IndexDocumentController.js.map