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
exports.AdminDocumentTypesController = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../../keys"));
class AdminDocumentTypesController {
    constructor() { }
    // DocumentType Functions
    addDocumentType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield mysql.createConnection(keys_1.default.database);
            try {
                const { documentTypeName, documentTypeDescription, documentTypeObjectId, tableName, documentGroupId, documentTypeRoles, documentTypeTableId, enabled, } = req.body;
                const query = `INSERT INTO DocumentType (documentTypeName, documentTypeDescription, documentTypeObjectId, tableName, documentGroupId, documentTypeRoles, documentTypeTableId, enabled) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                const [result] = yield connection.execute(query, [
                    documentTypeName,
                    documentTypeDescription,
                    documentTypeObjectId,
                    tableName,
                    documentGroupId,
                    documentTypeRoles,
                    documentTypeTableId,
                    enabled,
                ]);
                res.status(201).json({
                    message: "DocumentType added successfully",
                    result,
                    status: true,
                });
            }
            catch (error) {
                res
                    .status(500)
                    .json({ message: "Error adding DocumentType", error, status: false });
            }
            finally {
                yield connection.end();
            }
        });
    }
    editDocumentType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield mysql.createConnection(keys_1.default.database);
            try {
                const { documentTypeId } = req.params;
                const updates = req.body;
                if (!Object.keys(updates).length) {
                    return res
                        .status(400)
                        .json({ message: "No fields provided for update" });
                }
                const fields = Object.keys(updates)
                    .map((key) => `${key} = ?`)
                    .join(", ");
                const values = Object.values(updates);
                values.push(documentTypeId);
                const query = `UPDATE DocumentType SET ${fields} WHERE documentTypeId = ?`;
                yield connection.execute(query, values);
                res
                    .status(200)
                    .json({ message: "DocumentType updated successfully", status: true });
            }
            catch (error) {
                res
                    .status(500)
                    .json({ message: "Error updating DocumentType", error, status: false });
            }
            finally {
                yield connection.end();
            }
        });
    }
    deleteDocumentType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield mysql.createConnection(keys_1.default.database);
            try {
                const { documentTypeId } = req.params;
                const query = `DELETE FROM DocumentType WHERE documentTypeId = ?`;
                yield connection.execute(query, [documentTypeId]);
                res
                    .status(200)
                    .json({ message: "DocumentType deleted successfully", status: true });
            }
            catch (error) {
                res
                    .status(500)
                    .json({ message: "Error deleting DocumentType", error, status: false });
            }
            finally {
                yield connection.end();
            }
        });
    }
    getAllDocumentTypes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield mysql.createConnection(keys_1.default.database);
            try {
                const query = `
        SELECT 
          dt.*, 
          dg.documentGroupName,
          dg.groupTypeId,
          dgt.groupTypeName
        FROM DocumentType dt
        LEFT JOIN DocumentGroup dg ON dt.documentGroupId = dg.documentGroupId
        LEFT JOIN DocumentGroupType dgt ON dg.groupTypeId = dgt.groupTypeId
      `;
                const [rows] = yield connection.execute(query);
                res.status(200).json(rows);
            }
            catch (error) {
                res.status(500).json({ message: "Error fetching DocumentTypes", error });
            }
            finally {
                yield connection.end();
            }
        });
    }
    getSingleDocumentType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield mysql.createConnection(keys_1.default.database);
            try {
                const { documentTypeId } = req.params;
                const query = `
        SELECT 
          dt.*, 
          dg.documentGroupName,
          dg.groupTypeId,
          dgt.groupTypeName
        FROM DocumentType dt
        LEFT JOIN DocumentGroup dg ON dt.documentGroupId = dg.documentGroupId
        LEFT JOIN DocumentGroupType dgt ON dg.groupTypeId = dgt.groupTypeId
        WHERE dt.documentTypeId = ?
      `;
                const [rows] = yield connection.execute(query, [documentTypeId]);
                //@ts-ignore
                if (rows.length === 0) {
                    return res
                        .status(404)
                        .json({ message: "DocumentType not found", status: true });
                }
                res.status(200).json(rows[0]);
            }
            catch (error) {
                res
                    .status(500)
                    .json({ message: "Error fetching DocumentType", error, status: false });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // DocumentGroup Functions
    addDocumentGroup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield mysql.createConnection(keys_1.default.database);
            try {
                const { documentGroupName, documentGroupDescription, dataTableId, groupTypeId, } = req.body;
                const query = `INSERT INTO DocumentGroup (documentGroupName, documentGroupDescription, dataTableId, groupTypeId) VALUES (?, ?, ?, ?)`;
                const [result] = yield connection.execute(query, [
                    documentGroupName,
                    documentGroupDescription,
                    dataTableId,
                    groupTypeId,
                ]);
                res.status(201).json({
                    message: "DocumentGroup added successfully",
                    result,
                    status: true,
                });
            }
            catch (error) {
                res
                    .status(500)
                    .json({ message: "Error adding DocumentGroup", error, status: false });
            }
            finally {
                yield connection.end();
            }
        });
    }
    editDocumentGroup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield mysql.createConnection(keys_1.default.database);
            try {
                const { documentGroupId } = req.params;
                const updates = req.body;
                if (!Object.keys(updates).length) {
                    return res
                        .status(400)
                        .json({ message: "No fields provided for update" });
                }
                const fields = Object.keys(updates)
                    .map((key) => `${key} = ?`)
                    .join(", ");
                const values = Object.values(updates);
                values.push(documentGroupId);
                const query = `UPDATE DocumentGroup SET ${fields} WHERE documentGroupId = ?`;
                yield connection.execute(query, values);
                res
                    .status(200)
                    .json({ message: "DocumentGroup updated successfully", status: true });
            }
            catch (error) {
                res.status(500).json({
                    message: "Error updating DocumentGroup",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    getAllDocumentGroups(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield mysql.createConnection(keys_1.default.database);
            try {
                const query = `
        SELECT dg.*, dgt.groupTypeName
        FROM DocumentGroup dg
        LEFT JOIN DocumentGroupType dgt ON dg.groupTypeId = dgt.groupTypeId
      `;
                const [rows] = yield connection.execute(query);
                res.status(200).json(rows);
            }
            catch (error) {
                res.status(500).json({ message: "Error fetching DocumentGroups", error });
            }
            finally {
                yield connection.end();
            }
        });
    }
    getSingleDocumentGroup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield mysql.createConnection(keys_1.default.database);
            try {
                const { documentGroupId } = req.params;
                const query = `
        SELECT dg.*, dgt.groupTypeName
        FROM DocumentGroup dg
        LEFT JOIN DocumentGroupType dgt ON dg.groupTypeId = dgt.groupTypeId
        WHERE dg.documentGroupId = ?
      `;
                const [rows] = yield connection.execute(query, [documentGroupId]);
                //@ts-ignore
                if (rows.length === 0) {
                    return res
                        .status(404)
                        .json({ message: "DocumentGroup not found", status: true });
                }
                res.status(200).json(rows[0]);
            }
            catch (error) {
                res.status(500).json({
                    message: "Error fetching DocumentGroup",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    deleteDocumentGroup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield mysql.createConnection(keys_1.default.database);
            try {
                const { documentGroupId } = req.params;
                const query = `DELETE FROM DocumentGroup WHERE documentGroupId = ?`;
                yield connection.execute(query, [documentGroupId]);
                res.status(200).json({
                    message: "DocumentGroup deleted successfully",
                    status: true,
                });
            }
            catch (error) {
                res.status(500).json({
                    message: "Error deleting DocumentGroup",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    getDocumentGroupTypes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield mysql.createConnection(keys_1.default.database);
            try {
                const query = `SELECT groupTypeId, groupTypeName FROM DocumentGroupType`;
                const [rows] = yield connection.execute(query);
                // Convert to enum-like object
                const enumMap = {};
                //@ts-ignore
                rows.forEach((row) => {
                    enumMap[row.groupTypeName.toUpperCase()] = row.groupTypeId;
                });
                res.status(200).json({
                    data: rows,
                    enum: enumMap,
                    status: true,
                });
            }
            catch (error) {
                res.status(500).json({
                    message: "Error fetching DocumentGroupTypes",
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
exports.AdminDocumentTypesController = AdminDocumentTypesController;
//# sourceMappingURL=AdminDocumentTypesController.js.map