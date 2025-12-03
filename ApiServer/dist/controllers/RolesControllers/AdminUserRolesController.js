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
exports.adminUserRolesController = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../keys"));
const SuperUserRolesHelper_1 = require("../../helpers/RolesManager/AdminManager/UserRoles/SuperUserRolesHelper");
class AdminUserRolesController {
    // Get Super User Roles
    getSuperUserRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const condition = req.query.userId
                    ? `userId = ${req.query.userId}`
                    : undefined;
                const roles = yield (0, SuperUserRolesHelper_1.getSuperUserRoles)(connection, condition);
                res.status(200).json({
                    success: true,
                    data: roles,
                });
            }
            catch (err) {
                console.error("Error fetching user roles:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while fetching user roles",
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
    // Insert a new Super User Role
    insertSuperUserRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const role = req.body;
                yield (0, SuperUserRolesHelper_1.insertSuperUserRole)(connection, role);
                res.status(201).json({
                    success: true,
                    message: "User role inserted successfully",
                });
            }
            catch (err) {
                console.error("Error inserting user role:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while inserting user role",
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
    // Update an existing Super User Role
    updateSuperUserRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const role = req.body;
                if (!role.superUserRoleId) {
                    res.status(400).json({
                        success: false,
                        message: "superUserRoleId is required to update a user role",
                    });
                    return;
                }
                yield (0, SuperUserRolesHelper_1.updateSuperUserRole)(connection, role);
                res.status(200).json({
                    success: true,
                    message: "User role updated successfully",
                });
            }
            catch (err) {
                console.error("Error updating user role:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while updating user role",
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
    // Delete a Super User Role
    deleteSuperUserRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const { superUserRoleId } = req.params;
                if (!superUserRoleId) {
                    res.status(400).json({
                        success: false,
                        message: "superUserRoleId is required to delete a user role",
                    });
                    return;
                }
                yield (0, SuperUserRolesHelper_1.deleteSuperUserRole)(connection, parseInt(superUserRoleId, 10));
                res.status(200).json({
                    success: true,
                    message: "User role deleted successfully",
                });
            }
            catch (err) {
                console.error("Error deleting user role:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while deleting user role",
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
    updateMultipleSuperUserRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const roles = req.body;
                if (!Array.isArray(roles) || roles.length === 0) {
                    res.status(400).json({
                        success: false,
                        message: "Request body must contain an array of roles for updating",
                    });
                    return;
                }
                yield (0, SuperUserRolesHelper_1.updateMultipleSuperUserRoles)(connection, roles);
                res.status(200).json({
                    success: true,
                    message: "Roles updated successfully",
                });
            }
            catch (err) {
                console.error("Error updating multiple user roles:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while updating roles",
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
    insertMultipleSuperUserRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const roles = req.body;
                if (!Array.isArray(roles) || roles.length === 0) {
                    res.status(400).json({
                        success: false,
                        message: "Request body must contain an array of roles for inserting",
                    });
                    return;
                }
                yield (0, SuperUserRolesHelper_1.insertMultipleSuperUserRoles)(connection, roles);
                res.status(201).json({
                    success: true,
                    message: "Roles inserted successfully",
                });
            }
            catch (err) {
                console.error("Error inserting multiple user roles:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while inserting roles",
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
    deleteMultipleSuperUserRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const { ids } = req.body;
                if (!Array.isArray(ids) || ids.length === 0) {
                    res.status(400).json({
                        success: false,
                        message: "Request body must contain an array of IDs for deletion",
                    });
                    return;
                }
                yield (0, SuperUserRolesHelper_1.deleteMultipleSuperUserRoles)(connection, ids);
                res.status(200).json({
                    success: true,
                    message: "Roles deleted successfully",
                });
            }
            catch (err) {
                console.error("Error deleting multiple user roles:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while deleting roles",
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
}
exports.adminUserRolesController = new AdminUserRolesController();
//# sourceMappingURL=AdminUserRolesController.js.map