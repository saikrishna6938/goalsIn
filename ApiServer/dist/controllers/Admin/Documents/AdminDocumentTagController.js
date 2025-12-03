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
exports.adminDocumentTagController = exports.AdminDocumentTagController = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../../keys"));
class AdminDocumentTagController {
    // Create a new document tag object
    createDocumentTag(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, description, documentTagObject } = req.body;
            if (!name || !documentTagObject) {
                return res.status(400).json({
                    success: false,
                    message: "Required fields: name, documentTagObject",
                });
            }
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute(`INSERT INTO DocumentTagObject (name, description, documentTagObject)
         VALUES (?, ?, ?)`, [name, description || null, JSON.stringify(documentTagObject)]);
                res.status(201).json({
                    success: true,
                    message: "Document tag created successfully.",
                    insertId: result.insertId,
                });
            }
            catch (error) {
                console.error("Error creating document tag:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to create document tag.",
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
    // Get all document tag objects
    getAllDocumentTags(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [rows] = yield connection.execute(`SELECT documentTagObjectId, name, description, updated, created 
       FROM DocumentTagObject`);
                const parsedRows = rows.map((row) => (Object.assign({}, row)));
                res.json({ success: true, data: parsedRows });
            }
            catch (error) {
                console.error("Error fetching document tags:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch document tags.",
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
    // Update a document tag object
    updateDocumentTag(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { name, description, documentTagObject } = req.body;
            if (!name || !documentTagObject) {
                return res.status(400).json({
                    success: false,
                    message: "Required fields: name, documentTagObject",
                });
            }
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute(`UPDATE DocumentTagObject
         SET name = ?, description = ?, documentTagObject = ?, updated = CURRENT_TIMESTAMP
         WHERE documentTagObjectId = ?`, [name, description || null, JSON.stringify(documentTagObject), id]);
                if (result.affectedRows > 0) {
                    res.json({
                        success: true,
                        message: "Document tag updated successfully.",
                    });
                }
                else {
                    res.status(404).json({
                        success: false,
                        message: "Document tag not found.",
                    });
                }
            }
            catch (error) {
                console.error("Error updating document tag:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to update document tag.",
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
    // Delete a document tag object
    deleteDocumentTag(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute(`DELETE FROM DocumentTagObject WHERE documentTagObjectId = ?`, [id]);
                if (result.affectedRows > 0) {
                    res.json({
                        success: true,
                        message: "Document tag deleted successfully.",
                    });
                }
                else {
                    res.status(404).json({
                        success: false,
                        message: "Document tag not found.",
                    });
                }
            }
            catch (error) {
                console.error("Error deleting document tag:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to delete document tag. check if any document type is using this",
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
    getDocumentTagById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required parameter: id",
                });
            }
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [rows] = yield connection.execute("SELECT * FROM DocumentTagObject WHERE documentTagObjectId = ?", [id]);
                if (rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Document tag not found.",
                    });
                }
                const row = rows[0];
                res.json({
                    success: true,
                    data: {
                        documentTagObjectId: row.documentTagObjectId,
                        name: row.name,
                        description: row.description,
                        created: row.created,
                        updated: row.updated,
                        documentTagObject: JSON.parse(row.documentTagObject),
                    },
                });
            }
            catch (error) {
                console.error("Error fetching document tag by ID:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch document tag by ID.",
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
}
exports.AdminDocumentTagController = AdminDocumentTagController;
exports.adminDocumentTagController = new AdminDocumentTagController();
//# sourceMappingURL=AdminDocumentTagController.js.map