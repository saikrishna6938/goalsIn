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
exports.DocumentStatesController = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../../keys"));
class DocumentStatesController {
    constructor() { }
    // 🔍 Get all document states by workflowID
    getDocumentStatesByWorkflow(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { workflowID } = req.params;
            if (!workflowID) {
                return res.status(400).json({
                    message: "workflowID is required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const query = `
        SELECT 
          documentStateId,
          documentStateName,
          documentStateDescription,
          documentStateCreatedDate,
          documentStateUpdatedDate,
          WorkflowID,
          steps
        FROM DocumentStates
        WHERE WorkflowID = ?
        ORDER BY documentStateId ASC
      `;
                const [rows] = yield connection.execute(query, [workflowID]);
                res.status(200).json({
                    message: "Document states retrieved successfully",
                    data: rows,
                    status: true,
                });
            }
            catch (error) {
                console.error("Error retrieving document states:", error);
                res.status(500).json({
                    message: "Failed to retrieve document states",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // ➕ Create a new document state
    createDocumentState(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { documentStateName, documentStateDescription, WorkflowID, steps } = req.body;
            if (!documentStateName || !WorkflowID) {
                return res.status(400).json({
                    message: "documentStateName and WorkflowID are required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const query = `
        INSERT INTO DocumentStates (
          documentStateName,
          documentStateDescription,
          documentStateCreatedDate,
          documentStateUpdatedDate,
          WorkflowID,
          steps
        ) VALUES (?, ?, NOW(), NOW(), ?, ?)
      `;
                const [result] = yield connection.execute(query, [
                    documentStateName,
                    documentStateDescription,
                    WorkflowID,
                    steps,
                ]);
                res.status(201).json({
                    message: "Document state created successfully",
                    insertedId: result["insertId"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error creating document state:", error);
                res.status(500).json({
                    message: "Failed to create document state",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // ✏️ Update an existing document state
    updateDocumentState(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { documentStateId, documentStateName, documentStateDescription, steps, } = req.body;
            if (!documentStateId || !documentStateName) {
                return res.status(400).json({
                    message: "documentStateId and documentStateName are required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const query = `
        UPDATE DocumentStates
        SET documentStateName = ?,
            documentStateDescription = ?,
            documentStateUpdatedDate = NOW(),
            steps = ?
        WHERE documentStateId = ?
      `;
                const [result] = yield connection.execute(query, [
                    documentStateName,
                    documentStateDescription,
                    steps,
                    documentStateId,
                ]);
                res.status(200).json({
                    message: "Document state updated successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error updating document state:", error);
                res.status(500).json({
                    message: "Failed to update document state",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // ❌ Delete a document state
    deleteDocumentState(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { documentStateId } = req.body;
            if (!documentStateId) {
                return res.status(400).json({
                    message: "documentStateId is required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const query = `
        DELETE FROM DocumentStates
        WHERE documentStateId = ?
      `;
                const [result] = yield connection.execute(query, [documentStateId]);
                res.status(200).json({
                    message: "Document state deleted successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error deleting document state:", error);
                res.status(500).json({
                    message: "Failed to delete document state",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    reorderDocumentStates(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { workflowID, reorderedStates } = req.body;
            if (!workflowID ||
                !Array.isArray(reorderedStates) ||
                reorderedStates.length === 0) {
                return res.status(400).json({
                    message: "workflowID and reorderedStates array are required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                yield connection.beginTransaction();
                const updatePromises = reorderedStates.map((item, index) => {
                    return connection.execute(`UPDATE DocumentStates SET steps = ?, documentStateUpdatedDate = NOW() WHERE documentStateId = ? AND WorkflowID = ?`, [index + 1, item.documentStateId, workflowID]);
                });
                yield Promise.all(updatePromises);
                yield connection.commit();
                res.status(200).json({
                    message: "Document states reordered successfully",
                    status: true,
                });
            }
            catch (error) {
                yield connection.rollback();
                console.error("Error reordering document states:", error);
                res.status(500).json({
                    message: "Failed to reorder document states",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
}
exports.DocumentStatesController = DocumentStatesController;
//# sourceMappingURL=DocumentStatesController.js.map