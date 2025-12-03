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
exports.AdminDocumentTypesRolesController = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../../keys"));
class AdminDocumentTypesRolesController {
    constructor() { }
    getDocumentTypeRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { documentTypeId } = req.params;
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const query = `
        SELECT 
          dtr.documentSecurity,
          dtr.roleNameId,
          srn.roleName
        FROM SuperDocumentTypeRoles dtr
        LEFT JOIN SuperRoleNames srn ON dtr.roleNameId = srn.roleNameId
        WHERE dtr.documentTypeId = ?
      `;
                const [rows] = yield connection.execute(query, [documentTypeId]);
                res.status(200).json({ rows, status: true });
            }
            catch (error) {
                console.error("Error fetching DocumentTypeRoles:", error);
                res.status(500).json({
                    message: "Error fetching DocumentTypeRoles",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    addDocumentTypeRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const roles = req.body;
            if (!Array.isArray(roles) || roles.length === 0) {
                return res
                    .status(400)
                    .json({ message: "Invalid input: must be a non-empty array" });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const insertQuery = `
        INSERT INTO SuperDocumentTypeRoles (
          documentTypeId,
          documentSecurity,
          roleNameId
        ) VALUES ?
      `;
                const values = roles.map((role) => [
                    role.documentTypeId,
                    role.documentSecurity || "1",
                    role.roleNameId,
                ]);
                const [result] = yield connection.query(insertQuery, [values]);
                res.status(201).json({
                    message: "Roles added successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error adding roles:", error);
                res
                    .status(500)
                    .json({ message: "Error adding roles", error, status: false });
            }
            finally {
                yield connection.end();
            }
        });
    }
    deleteDocumentTypeRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { roleIds, documentTypeId } = req.body;
            if (!Array.isArray(roleIds) || roleIds.length === 0 || !documentTypeId) {
                return res
                    .status(400)
                    .json({ message: "Invalid input: Provide roleIds and documentTypeId" });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const deleteQuery = `
        DELETE FROM SuperDocumentTypeRoles 
        WHERE roleNameId IN (?) AND documentTypeId = ?
      `;
                const [result] = yield connection.query(deleteQuery, [
                    roleIds,
                    documentTypeId,
                ]);
                res.status(200).json({
                    message: "Roles deleted successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error deleting roles:", error);
                res
                    .status(500)
                    .json({ message: "Error deleting roles", error, status: false });
            }
            finally {
                yield connection.end();
            }
        });
    }
}
exports.AdminDocumentTypesRolesController = AdminDocumentTypesRolesController;
//# sourceMappingURL=AdminDocumentTypesRoles.js.map