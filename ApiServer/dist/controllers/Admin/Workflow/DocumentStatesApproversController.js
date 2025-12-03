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
exports.DocumentStatesApproversController = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../../keys"));
class DocumentStatesApproversController {
    constructor() { }
    // 🔍 Get all approver role names for a given documentStateId
    getApproversByDocumentState(req, res) {
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
          dsa.documentStatesApproversId,
          dsa.documentStatesId,
          dsa.roleNameId,
          srn.roleName
        FROM DocumentStatesApprovers dsa
        LEFT JOIN SuperRoleNames srn ON dsa.roleNameId = srn.roleNameId
        WHERE dsa.documentStatesId = ?
      `;
                const [rows] = yield connection.execute(query, [documentStateId]);
                res.status(200).json({
                    message: "Approvers retrieved successfully",
                    data: rows,
                    status: true,
                });
            }
            catch (error) {
                console.error("Error retrieving approvers:", error);
                res.status(500).json({
                    message: "Failed to retrieve approvers",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // ➕ Add new approvers to a document state
    addApproversToDocumentState(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { documentStatesId, roleNameIds } = req.body;
            if (!documentStatesId ||
                !Array.isArray(roleNameIds) ||
                roleNameIds.length === 0) {
                return res.status(400).json({
                    message: "documentStatesId and roleNameIds array are required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const insertQuery = `
        INSERT INTO DocumentStatesApprovers (documentStatesId, roleNameId)
        VALUES ?
      `;
                const values = roleNameIds.map((roleId) => [
                    documentStatesId,
                    roleId,
                ]);
                const [result] = yield connection.query(insertQuery, [values]);
                res.status(201).json({
                    message: "Approvers added successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error adding approvers:", error);
                res.status(500).json({
                    message: "Failed to add approvers",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // ❌ Delete approvers from a document state
    deleteApproversFromDocumentState(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { documentStatesId, roleNameIds } = req.body;
            if (!documentStatesId ||
                !Array.isArray(roleNameIds) ||
                roleNameIds.length === 0) {
                return res.status(400).json({
                    message: "documentStatesId and roleNameIds array are required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const placeholders = roleNameIds.map(() => "?").join(",");
                const deleteQuery = `
        DELETE FROM DocumentStatesApprovers
        WHERE documentStatesId = ? AND roleNameId IN (${placeholders})
      `;
                const [result] = yield connection.execute(deleteQuery, [
                    documentStatesId,
                    ...roleNameIds,
                ]);
                res.status(200).json({
                    message: "Approvers deleted successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error deleting approvers:", error);
                res.status(500).json({
                    message: "Failed to delete approvers",
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
exports.DocumentStatesApproversController = DocumentStatesApproversController;
//# sourceMappingURL=DocumentStatesApproversController.js.map