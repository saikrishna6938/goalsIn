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
exports.adminRoleNamesController = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../keys"));
const SuperRoleNamesHelper_1 = require("../../helpers/RolesManager/AdminManager/MainRolesManager/SuperRoleNamesHelper");
class AdminRoleNamesController {
    // Get all role names
    getSuperRoleNames(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const roleNames = yield (0, SuperRoleNamesHelper_1.getSuperRoleNames)(connection);
                res.status(200).json({
                    success: true,
                    data: roleNames,
                });
            }
            catch (err) {
                console.error("Error fetching role names:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while fetching role names",
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
    // Insert a new role name
    insertSuperRoleName(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                yield (0, SuperRoleNamesHelper_1.insertSuperRoleName)(connection, req.body);
                res.status(201).json({
                    success: true,
                    message: "Role name inserted successfully",
                });
            }
            catch (err) {
                console.error("Error inserting role name:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while inserting role name",
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
    // Delete a role name
    deleteSuperRoleName(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { roleNameId } = req.params;
                if (!roleNameId) {
                    res.status(400).json({
                        success: false,
                        message: "roleNameId is required to delete a role name",
                    });
                    return;
                }
                connection = yield mysql.createConnection(keys_1.default.database);
                yield (0, SuperRoleNamesHelper_1.deleteSuperRoleName)(connection, parseInt(roleNameId, 10));
                res.status(200).json({
                    success: true,
                    message: "Role name deleted successfully",
                });
            }
            catch (err) {
                console.error("Error deleting role name:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while deleting role name",
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
    // Update a role name
    updateSuperRoleName(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const roleName = req.body;
                if (!roleName.roleNameId) {
                    res.status(400).json({
                        success: false,
                        message: "roleNameId is required to update a role name",
                    });
                    return;
                }
                yield (0, SuperRoleNamesHelper_1.updateSuperRoleName)(connection, roleName);
                res.status(200).json({
                    success: true,
                    message: "Role name updated successfully",
                });
            }
            catch (err) {
                console.error("Error updating role name:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while updating role name",
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
exports.adminRoleNamesController = new AdminRoleNamesController();
//# sourceMappingURL=AdminRoleNamesController.js.map