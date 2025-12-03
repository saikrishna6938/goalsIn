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
exports.globalController = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../keys"));
const DocumentTypeHelpers_1 = require("../helpers/documents/DocumentTypeHelpers");
class GlobalController {
    checkUserDocumentPermission(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { userId, documentTypeId, userType } = req.body;
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = (_a = (yield connection.execute("SELECT * from UserDocumentsPermission WHERE documentTypeId = ? AND userType= ?", [documentTypeId, userType]))) !== null && _a !== void 0 ? _a : [];
                if (result[0].submissions > 0) {
                    res.json({ status: true, data: 1 });
                }
                else {
                    res.json({ status: true, data: 0 });
                }
            }
            catch (error) {
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
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
    getDocumentGroups(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const result = yield (0, DocumentTypeHelpers_1.getDocumentGroups)(connection);
                if (result[0].documentGroups) {
                    res.json({ status: true, data: result[0].documentGroups });
                }
                else {
                    res.json({ status: true, data: [] });
                }
            }
            catch (error) {
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
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
    cloneProfileObject(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const userId = req.params.userId; // Assuming userId is passed as a parameter
                const documentTypeAnswer = yield getCloneProfile(connection, userId);
                if (documentTypeAnswer) {
                    res.json({ status: true, data: documentTypeAnswer });
                }
                else {
                    res.json({ status: true, data: null });
                }
            }
            catch (error) {
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
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
    // ... other imports ...
    checkUserSubmittedDocument(req, res) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { userId, documentTypeId } = req.body;
                connection = yield mysql.createConnection(keys_1.default.database);
                // 1. Fetch the user's roles
                const [userRolesResult] = yield connection.execute("SELECT roles FROM Users WHERE userId = ?", [userId]);
                const userRoles = (_a = userRolesResult[0]) === null || _a === void 0 ? void 0 : _a.roles.split(",").map(Number);
                // 2. Fetch all roleTypeIds that have the name "Default"
                const [defaultRoleTypeResult] = yield connection.execute("SELECT roleTypeId FROM RoleTypes WHERE roleTypeName = ?", ["Default"]);
                const defaultRoleTypeId = (_b = defaultRoleTypeResult[0]) === null || _b === void 0 ? void 0 : _b.roleTypeId;
                // 3. Check if user has a role with roleTypeId of "Default"
                const hasDefaultRole = userRoles === null || userRoles === void 0 ? void 0 : userRoles.includes(defaultRoleTypeId);
                if (!hasDefaultRole) {
                    return res.json({
                        status: false,
                        message: "User has not been assigned the Default role type.",
                        userRoles,
                        defaultRoleTypeId,
                        hasDefaultRole,
                    });
                }
                // 4. If user has "Default" role type, check if they have submitted the document
                const [result] = (_c = (yield connection.execute("SELECT COUNT(*) AS count from DocumentTypeAnswers WHERE documentTypeId = ? AND userId= ?", [documentTypeId, userId]))) !== null && _c !== void 0 ? _c : [];
                res.json({ status: true, data: result[0].count });
            }
            catch (error) {
                console.log(error);
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_d) { }
                }
            }
        });
    }
    assignDefaultRoleToUser(userId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                // 1. Fetch the user's roles
                const [userRolesResult] = yield connection.execute("SELECT roles FROM Users WHERE userId = ?", [userId]);
                const userRoles = ((_a = userRolesResult[0]) === null || _a === void 0 ? void 0 : _a.roles)
                    ? userRolesResult[0].roles.split(",").map(Number)
                    : [];
                // 2. Fetch the roleTypeId for "Default"
                const [defaultRoleTypeResult] = yield connection.execute("SELECT roleTypeId FROM RoleTypes WHERE roleTypeName = ?", ["Default"]);
                const defaultRoleTypeId = (_b = defaultRoleTypeResult[0]) === null || _b === void 0 ? void 0 : _b.roleTypeId;
                if (!defaultRoleTypeId) {
                    // nothing to assign
                }
                // 3. Check if user already has the default role
                const hasDefaultRole = userRoles.includes(defaultRoleTypeId);
                if (!hasDefaultRole) {
                    // Add default role to the user's roles
                    userRoles.push(defaultRoleTypeId);
                    const updatedRoles = userRoles.join(",");
                    // Update the user's roles in the database
                    yield connection.execute("UPDATE Users SET roles = ? WHERE userId = ?", [updatedRoles, userId]);
                }
            }
            catch (error) {
                console.log(error);
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
}
function getCloneProfile(connection, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Query to check and fetch the first documentTypeAnswers for the given userId
            const [rows] = yield connection.execute(`SELECT * FROM DocumentTypeAnswers WHERE userId = ? LIMIT 1`, [userId]);
            // Return the first index values if any rows exist
            if (rows.length > 0) {
                return rows[0];
            }
            // Return null if no entries found
            return null;
        }
        catch (error) {
            throw new Error("Error fetching documentTypeAnswers: " + error.message);
        }
    });
}
exports.globalController = new GlobalController();
//# sourceMappingURL=GlobalController.js.map