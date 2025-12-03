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
exports.ActionStateTransitionsController = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../../keys"));
class ActionStateTransitionsController {
    constructor() { }
    // 🔍 Get all transitions for a given actionId and fromStateId with state and action names
    getTransitionsByAction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { actionId } = req.params;
            const { fromStateId } = req.query;
            if (!actionId) {
                return res.status(400).json({
                    message: "actionId is required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                let query = `
        SELECT 
          ast.transitionId,
          ast.actionId,
          a.actionName,
          ast.fromStateId,
          fs.documentStateName AS fromStateName,
          ast.toStateId,
          ts.documentStateName AS toStateName
        FROM ActionStateTransitions ast
        LEFT JOIN Actions a ON ast.actionId = a.actionId
        LEFT JOIN DocumentStates fs ON ast.fromStateId = fs.documentStateId
        LEFT JOIN DocumentStates ts ON ast.toStateId = ts.documentStateId
        WHERE ast.actionId = ?
      `;
                const params = [actionId];
                if (fromStateId) {
                    query += ` AND ast.fromStateId = ?`;
                    params.push(fromStateId);
                }
                query += ` ORDER BY ast.transitionId ASC`;
                const [rows] = yield connection.execute(query, params);
                res.status(200).json({
                    message: "Transitions retrieved successfully",
                    data: rows,
                    status: true,
                });
            }
            catch (error) {
                console.error("Error retrieving transitions:", error);
                res.status(500).json({
                    message: "Failed to retrieve transitions",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // ➕ Add a new transition
    addTransition(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { actionId, fromStateId, toStateId } = req.body;
            if (!actionId || !fromStateId || !toStateId) {
                return res.status(400).json({
                    message: "actionId, fromStateId, and toStateId are required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const query = `
        INSERT INTO ActionStateTransitions (actionId, fromStateId, toStateId)
        VALUES (?, ?, ?)
      `;
                const [result] = yield connection.execute(query, [
                    actionId,
                    fromStateId,
                    toStateId,
                ]);
                res.status(201).json({
                    message: "Transition added successfully",
                    insertedId: result["insertId"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error adding transition:", error);
                res.status(500).json({
                    message: "Failed to add transition",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // ✏️ Update an existing transition
    updateTransition(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { transitionId, actionId, fromStateId, toStateId } = req.body;
            if (!transitionId || !actionId || !fromStateId || !toStateId) {
                return res.status(400).json({
                    message: "transitionId, actionId, fromStateId, and toStateId are required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const query = `
        UPDATE ActionStateTransitions
        SET actionId = ?, fromStateId = ?, toStateId = ?
        WHERE transitionId = ?
      `;
                const [result] = yield connection.execute(query, [
                    actionId,
                    fromStateId,
                    toStateId,
                    transitionId,
                ]);
                res.status(200).json({
                    message: "Transition updated successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error updating transition:", error);
                res.status(500).json({
                    message: "Failed to update transition",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // ❌ Delete a transition
    deleteTransition(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { transitionId } = req.body;
            if (!transitionId) {
                return res.status(400).json({
                    message: "transitionId is required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const query = `
        DELETE FROM ActionStateTransitions
        WHERE transitionId = ?
      `;
                const [result] = yield connection.execute(query, [transitionId]);
                res.status(200).json({
                    message: "Transition deleted successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error deleting transition:", error);
                res.status(500).json({
                    message: "Failed to delete transition",
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
exports.ActionStateTransitionsController = ActionStateTransitionsController;
//# sourceMappingURL=ActionStateTransitionsController.js.map