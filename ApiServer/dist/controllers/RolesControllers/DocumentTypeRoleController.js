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
exports.documentTypeRoleController = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../keys"));
const SuperDocumentTypeRolesHelper_1 = require("../../helpers/RolesManager/AdminManager/DocumentRoles/SuperDocumentTypeRolesHelper");
class DocumentTypeRoleController {
    getDocumentTypeRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const condition = req.query.documentTypeId
                    ? `documentTypeId = ${req.query.documentTypeId}`
                    : undefined;
                const roles = yield (0, SuperDocumentTypeRolesHelper_1.getDocumentTypeRoles)(connection, condition);
                res.status(200).json({
                    success: true,
                    data: roles,
                });
            }
            catch (err) {
                console.error("Error fetching document type roles:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while fetching document type roles",
                    error: err.message,
                });
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
    insertDocumentTypeRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const body = req.body;
                yield (0, SuperDocumentTypeRolesHelper_1.insertDocumentTypeRole)(connection, body);
                res.status(201).json({
                    success: true,
                    message: "Document type role inserted successfully",
                });
            }
            catch (err) {
                console.error("Error inserting document type role:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while inserting document type role",
                    error: err.message,
                });
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
    updateDocumentTypeRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const body = req.body;
                if (!body.documentTypeRoleId) {
                    res.status(400).json({
                        success: false,
                        message: "documentTypeRoleId is required to update a document type role",
                    });
                    return;
                }
                yield (0, SuperDocumentTypeRolesHelper_1.updateDocumentTypeRole)(connection, body);
                res.status(200).json({
                    success: true,
                    message: "Document type role updated successfully",
                });
            }
            catch (err) {
                console.error("Error updating document type role:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while updating document type role",
                    error: err.message,
                });
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
    deleteDocumentTypeRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const { documentTypeRoleId } = req.params;
                if (!documentTypeRoleId) {
                    res.status(400).json({
                        success: false,
                        message: "documentTypeRoleId is required to delete a document type role",
                    });
                    return;
                }
                yield (0, SuperDocumentTypeRolesHelper_1.deleteDocumentTypeRole)(connection, parseInt(documentTypeRoleId, 10));
                res.status(200).json({
                    success: true,
                    message: "Document type role deleted successfully",
                });
            }
            catch (err) {
                console.error("Error deleting document type role:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while deleting document type role",
                    error: err.message,
                });
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
    getUserDocumentTypes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield mysql.createConnection(keys_1.default.database);
                const { userId, typeId } = req.params;
                if (!userId) {
                    res.status(400).json({
                        success: false,
                        message: "userId is required to fetch document types",
                    });
                    return;
                }
                const documentTypes = yield (0, SuperDocumentTypeRolesHelper_1.getUserDocumentTypes)(connection, parseInt(userId, 10), parseInt(typeId, 10));
                res.status(200).json({
                    success: true,
                    data: documentTypes,
                });
            }
            catch (err) {
                console.error("Error fetching document types for user:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while fetching document types",
                    error: err.message,
                });
            }
        });
    }
    getFilteredDocumentTypes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield mysql.createConnection(keys_1.default.database);
                const { userId, roleTypeId } = req.params;
                if (!userId || !roleTypeId) {
                    res.status(400).json({
                        success: false,
                        message: "Both userId and roleTypeId are required to fetch filtered document types",
                    });
                    return;
                }
                const documentTypes = yield (0, SuperDocumentTypeRolesHelper_1.getFilteredDocumentTypes)(connection, parseInt(userId, 10), parseInt(roleTypeId, 10));
                res.status(200).json({
                    success: true,
                    data: documentTypes,
                });
            }
            catch (err) {
                console.error("Error fetching filtered document types:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while fetching filtered document types",
                    error: err.message,
                });
            }
        });
    }
}
exports.documentTypeRoleController = new DocumentTypeRoleController();
//# sourceMappingURL=DocumentTypeRoleController.js.map