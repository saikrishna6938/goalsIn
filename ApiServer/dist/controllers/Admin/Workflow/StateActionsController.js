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
exports.StateActionsController = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../../keys"));
class StateActionsController {
    constructor() { }
    // 🔍 Get all actions for a given documentStateId
    getActionsByDocumentState(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { documentStateId } = req.params;
            if (!documentStateId) {
                return res.status(400).json({
                    message: "documentStateId is required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const query = `
        SELECT 
          actionId,
          documentStateId,
          actionName,
          actionDescription,
          actionCreatedDate,
          actionUpdatedDate,
          optionId
        FROM Actions
        WHERE documentStateId = ?
        ORDER BY actionId ASC
      `;
                const [rows] = yield connection.execute(query, [documentStateId]);
                res.status(200).json({
                    message: "Actions retrieved successfully",
                    data: rows,
                    status: true,
                });
            }
            catch (error) {
                console.error("Error retrieving actions:", error);
                res.status(500).json({
                    message: "Failed to retrieve actions",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // ➕ Add a new action to a document state
    addAction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { documentStateId, actionName, actionDescription, optionId } = req.body;
            if (!documentStateId || !actionName) {
                return res.status(400).json({
                    message: "documentStateId and actionName are required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const insertQuery = `
        INSERT INTO Actions (
          documentStateId,
          actionName,
          actionDescription,
          actionCreatedDate,
          actionUpdatedDate,
          optionId
        ) VALUES (?, ?, ?, NOW(), NOW(), ?)
      `;
                const [result] = yield connection.execute(insertQuery, [
                    documentStateId,
                    actionName,
                    actionDescription,
                    optionId,
                ]);
                res.status(201).json({
                    message: "Action added successfully",
                    insertedId: result["insertId"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error adding action:", error);
                res.status(500).json({
                    message: "Failed to add action",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // ❌ Delete an action
    deleteAction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { actionId } = req.body;
            if (!actionId) {
                return res.status(400).json({
                    message: "actionId is required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const deleteQuery = `
        DELETE FROM Actions WHERE actionId = ?
      `;
                const [result] = yield connection.execute(deleteQuery, [actionId]);
                res.status(200).json({
                    message: "Action deleted successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error deleting action:", error);
                res.status(500).json({
                    message: "Failed to delete action",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // ✏️ Update an action
    updateAction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { actionId, actionName, actionDescription, optionId } = req.body;
            if (!actionId || !actionName) {
                return res.status(400).json({
                    message: "actionId and actionName are required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const updateQuery = `
        UPDATE Actions
        SET actionName = ?,
            actionDescription = ?,
            actionUpdatedDate = NOW(),
            optionId = ?
        WHERE actionId = ?
      `;
                const [result] = yield connection.execute(updateQuery, [
                    actionName,
                    actionDescription,
                    optionId,
                    actionId,
                ]);
                res.status(200).json({
                    message: "Action updated successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error updating action:", error);
                res.status(500).json({
                    message: "Failed to update action",
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
exports.StateActionsController = StateActionsController;
//# sourceMappingURL=StateActionsController.js.map