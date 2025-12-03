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
exports.FormController = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../../keys"));
class FormController {
    constructor() { }
    // 📄 Get all DocumentTypeObject entries
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const [rows] = yield connection.execute(`SELECT documentTypeObjectId, name, description, created, updated FROM DocumentTypeObject ORDER BY documentTypeObjectId ASC`);
                res.status(200).json({
                    message: "DocumentTypeObjects retrieved successfully",
                    data: rows,
                    status: true,
                });
            }
            catch (error) {
                console.error("Error fetching DocumentTypeObjects:", error);
                res.status(500).json({
                    message: "Failed to retrieve DocumentTypeObjects",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // 📄 Get a single DocumentTypeObject by ID
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { documentTypeObjectId } = req.params;
            if (!documentTypeObjectId) {
                return res.status(400).json({
                    message: "'documentTypeObjectId' is required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const [rows] = yield connection.execute(`SELECT * FROM DocumentTypeObject WHERE documentTypeObjectId = ?`, [documentTypeObjectId]);
                if (Array.isArray(rows) && rows.length === 0) {
                    return res.status(404).json({
                        message: "DocumentTypeObject not found",
                        status: false,
                    });
                }
                const item = rows[0];
                let parsed;
                try {
                    parsed = JSON.parse(item.documentTypeObject);
                }
                catch (e) {
                    parsed = null;
                }
                res.status(200).json({
                    message: "DocumentTypeObject retrieved successfully",
                    data: Object.assign(Object.assign({}, item), { documentTypeObject: parsed }),
                    status: true,
                });
            }
            catch (error) {
                console.error("Error fetching DocumentTypeObject:", error);
                res.status(500).json({
                    message: "Failed to retrieve DocumentTypeObject",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // ➕ Create a new DocumentTypeObject
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { documentTypeObject, name, description } = req.body;
            if (!name) {
                return res.status(400).json({
                    message: "'name' is required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const [result] = yield connection.execute(`INSERT INTO DocumentTypeObject (
          documentTypeObject,
          name,
          description,
          created,
          updated
        ) VALUES (?, ?, ?, NOW(), NOW())`, [documentTypeObject, name, description]);
                res.status(201).json({
                    message: "DocumentTypeObject created successfully",
                    insertedId: result["insertId"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error creating DocumentTypeObject:", error);
                res.status(500).json({
                    message: "Failed to create DocumentTypeObject",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // ✏️ Update an existing DocumentTypeObject
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { documentTypeObjectId, documentTypeObject, name, description } = req.body;
            if (!documentTypeObjectId) {
                return res.status(400).json({
                    message: "'documentTypeObjectId' is required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const existingRowQuery = `SELECT * FROM DocumentTypeObject WHERE documentTypeObjectId = ?`;
                const [existingRows] = yield connection.execute(existingRowQuery, [
                    documentTypeObjectId,
                ]);
                if (!Array.isArray(existingRows) || existingRows.length === 0) {
                    return res.status(404).json({
                        message: "DocumentTypeObject not found",
                        status: false,
                    });
                }
                const existing = existingRows[0];
                const updatedQuery = `
        UPDATE DocumentTypeObject SET
          documentTypeObject = ?,
          name = ?,
          description = ?,
          updated = NOW()
        WHERE documentTypeObjectId = ?`;
                const [result] = yield connection.execute(updatedQuery, [
                    documentTypeObject !== null && documentTypeObject !== void 0 ? documentTypeObject : existing.documentTypeObject,
                    name !== null && name !== void 0 ? name : existing.name,
                    description !== null && description !== void 0 ? description : existing.description,
                    documentTypeObjectId,
                ]);
                res.status(200).json({
                    message: "DocumentTypeObject updated successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error updating DocumentTypeObject:", error);
                res.status(500).json({
                    message: "Failed to update DocumentTypeObject",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // ❌ Delete a DocumentTypeObject
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { documentTypeObjectId } = req.body;
            if (!documentTypeObjectId) {
                return res.status(400).json({
                    message: "'documentTypeObjectId' is required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const [result] = yield connection.execute(`DELETE FROM DocumentTypeObject WHERE documentTypeObjectId = ?`, [documentTypeObjectId]);
                res.status(200).json({
                    message: "DocumentTypeObject deleted successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error deleting DocumentTypeObject:", error);
                res.status(500).json({
                    message: "Failed to delete DocumentTypeObject",
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
exports.FormController = FormController;
//# sourceMappingURL=FormsController.js.map