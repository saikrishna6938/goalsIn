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
exports.documentController = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../keys"));
const SuperDocumentTypeRolesHelper_1 = require("../helpers/RolesManager/AdminManager/DocumentRoles/SuperDocumentTypeRolesHelper");
class DocumentTypeController {
    addDocumentType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { documentTypeName, documentTypeDescription, documentTypeObjectId, } = req.body;
                connection = yield mysql.createConnection(keys_1.default.database);
                yield connection.execute("INSERT INTO DocumentType(documentTypeName, documentTypeDescription, documentTypeObjectId) VALUES (?,?,?)", [documentTypeName, documentTypeDescription, documentTypeObjectId]);
                res.json({ status: true, message: "Added Successfully" });
            }
            catch (error) {
                res.json({ status: false, message: "Failed" });
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
    updateDocumentType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const documentTypeId = req.params.documentTypeId;
                const { documentTypeName, documentTypeDescription, documentTypeObjectId, } = req.body;
                connection = yield mysql.createConnection(keys_1.default.database);
                yield connection.execute("UPDATE DocumentType SET documentTypeName = ?, documentTypeDescription = ?, documentTypeObjectId = ? WHERE documentTypeId = ?", [
                    documentTypeName,
                    documentTypeDescription,
                    documentTypeObjectId,
                    documentTypeId,
                ]);
                res.json({ status: true, message: "Updated Successfully" });
            }
            catch (error) {
                console.log(error);
                res.json({ status: false, message: "Failed" });
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
    deleteDocumentType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const documentTypeId = req.params.documentTypeId;
                connection = yield mysql.createConnection(keys_1.default.database);
                yield connection.execute("DELETE from DocumentType WHERE documentTypeId = ?", [documentTypeId]);
                res.json({ status: true, message: "Deleted Successfully" });
            }
            catch (error) {
                res.json({ status: false, message: "Failed" });
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
    getDocumentType(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const documentTypeId = req.params.documentTypeId;
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = (_a = (yield connection.execute("SELECT * from DocumentType WHERE documentTypeId = ?", [documentTypeId]))) !== null && _a !== void 0 ? _a : [];
                res.json({ status: true, message: "Success", data: result });
            }
            catch (error) {
                res.json({ status: false, message: "Failed", data: [] });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_b) { }
                }
            }
        });
    }
    getTaskUserEntity(taskId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield mysql.createConnection(keys_1.default.database);
                // First, check if the DocumentType exists
                const [entities] = (_a = (yield connection.execute("SELECT u.entities FROM Tasks t JOIN Users u ON u.userId = t.userId WHERE t.taskId = ?", [taskId]))) !== null && _a !== void 0 ? _a : [];
                return entities;
            }
            catch (error) {
                return "";
            }
        });
    }
    getDocumentTypeUsers(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { documentTypeId, isAdminEntity, taskId } = req.body;
                connection = yield mysql.createConnection(keys_1.default.database);
                // First, check if the DocumentType exists
                const [documentTypeResult] = (_a = (yield connection.execute("SELECT * FROM DocumentType WHERE documentTypeId = ?", [documentTypeId]))) !== null && _a !== void 0 ? _a : [];
                //@ts-ignore
                if (documentTypeResult.length === 0) {
                    throw new Error("DocumentType not found");
                }
                const [row] = (_b = (yield connection.execute("SELECT u.entities FROM Tasks t JOIN Users u ON u.userId = t.userId WHERE t.taskId = ?", [taskId]))) !== null && _b !== void 0 ? _b : [];
                let entities = "";
                //@ts-ignore
                if (row.length > 0) {
                    entities = row[0].entities;
                }
                if (isAdminEntity) {
                    entities = entities + "," + "1";
                }
                let usersQuery = `
    SELECT DISTINCT u.userId, u.userName, u.userEmail, u.userFirstName, u.userLastName
    FROM Users u
    JOIN Roles r ON FIND_IN_SET(r.roleId, u.roles)
    JOIN RoleTypes rt ON FIND_IN_SET(rt.roleTypeId, r.roles)
    JOIN DocumentTypeRoles dtr ON rt.roleTypeId = dtr.documentTypeRoleId
    WHERE dtr.documentTypeId = ? AND (
        ${entities
                    .split(",")
                    .map((entity) => `FIND_IN_SET(${entity}, u.entities) > 0`)
                    .join(" OR ")}
    )
`;
                const [usersResult] = yield connection.execute(usersQuery, [
                    documentTypeId,
                ]);
                res.json({ status: true, message: "Success", data: usersResult });
            }
            catch (error) {
                console.error(error); // Logging the error for debugging purposes
                res.json({ status: false, message: "Failed", data: [] });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_c) { }
                }
            }
        });
    }
    getDocumentTypeByRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const { userId } = req.params;
                if (!userId) {
                    res.status(400).json({
                        success: false,
                        message: "userId is required to fetch document types",
                    });
                    return;
                }
                const documentTypes = yield (0, SuperDocumentTypeRolesHelper_1.getUserDocumentTypes)(connection, parseInt(userId, 10));
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
    addDocumentTypeObject(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { documentTypeObject } = req.body;
                connection = yield mysql.createConnection(keys_1.default.database);
                yield connection.execute("INSERT INTO DocumentTypeObject(documentTypeObject) VALUES (?)", [documentTypeObject]);
                res.json({ status: true, message: "Added Successfully" });
            }
            catch (error) {
                res.json({ status: false, message: "Failed to Add DocumentTypeObject" });
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
    updateDocumentTypeObject(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const documentTypeObjectId = req.params.documentTypeObjectId;
            const { documentTypeObject } = req.body;
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                yield connection.execute("UPDATE DocumentTypeObject SET documentTypeObject = ? WHERE documentTypeObjectId = ?", [documentTypeObject, documentTypeObjectId]);
                res.json({ status: true, message: "Updated Successfully" });
            }
            catch (error) {
                res.json({ status: false, message: "Failed to update" });
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
    getDocumentTypeObjectById(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const documentTypeId = req.params.documentTypeId;
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const query = "SELECT documentTypeObjectId FROM DocumentType WHERE documentTypeId = ?";
                const params = [documentTypeId];
                const [types] = yield connection.execute(query, params);
                //@ts-ignore
                const documentTypeObjectId = (_a = types[0].documentTypeObjectId) !== null && _a !== void 0 ? _a : -1;
                const result = (_b = (yield connection.execute("SELECT * from DocumentTypeObject WHERE documentTypeObjectId = ?", [documentTypeObjectId]))) !== null && _b !== void 0 ? _b : [];
                const response = result[0];
                let parsedData = response.map((item) => {
                    // Parse the documentTypeObject string into a JavaScript object
                    let documentTypeObject = JSON.parse(item.documentTypeObject);
                    // Return a new object that includes the original data plus the parsed object
                    return Object.assign(Object.assign({}, item), { documentTypeObject });
                });
                res.json({
                    status: true,
                    message: "success",
                    data: parsedData,
                });
            }
            catch (error) {
                res.json({ status: false, message: "failed" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_c) { }
                }
            }
        });
    }
    getDocumentTypesByUserType(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const userType = req.params.userTypeId;
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const dataObj = (_a = (yield connection.execute("SELECT * FROM `UserDocumentsPermission` WHERE `userType`=?", [userType]))) !== null && _a !== void 0 ? _a : [];
                const documentTypes = dataObj[0];
                let userDocuments = [];
                yield Promise.all(yield documentTypes.map((r) => __awaiter(this, void 0, void 0, function* () {
                    var _c;
                    const types = (_c = (yield connection.execute("SELECT * FROM `DocumentType` WHERE `documentTypeId`=?", [r.documentTypeId]))) !== null && _c !== void 0 ? _c : [];
                    userDocuments = [...userDocuments, ...types[0]];
                })));
                res.json({ status: true, message: "success", data: userDocuments });
            }
            catch (error) {
                res.json({ status: false, message: "failed" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_b) { }
                }
            }
        });
    }
    deleteDocumentTypeObject(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const documentTypeObjectId = req.params.documentTypeObjectId;
                connection = yield mysql.createConnection(keys_1.default.database);
                yield connection.execute("DELETE FROM DocumentTypeObject WHERE documentTypeObjectId = ?", [documentTypeObjectId]);
                res.json({ status: true, message: "Deleted Successfully" });
            }
            catch (error) {
                res.json({ status: false, message: "Failed to delete" });
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
exports.documentController = new DocumentTypeController();
//# sourceMappingURL=DocumentTypeController.js.map