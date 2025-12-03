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
exports.adminRolesController = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../keys"));
const SuperRoleTypesHelper_1 = require("../../helpers/RolesManager/AdminManager/MainRolesManager/SuperRoleTypesHelper");
class AdminRolesManager {
    // Get all super role types
    getSuperRoleTypes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const roleTypes = yield (0, SuperRoleTypesHelper_1.getRoleTypes)(connection);
                res.status(200).json({
                    success: true,
                    data: roleTypes,
                });
            }
            catch (err) {
                console.error("Error fetching role types:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while fetching role types",
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
    // Update a super role type
    updateSuperRoleType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const roleType = req.body;
                if (!roleType.roleTypeId) {
                    res.status(400).json({
                        success: false,
                        message: "roleTypeId is required for updating a role type",
                    });
                    return;
                }
                yield (0, SuperRoleTypesHelper_1.updateRoleType)(connection, roleType);
                res.status(200).json({
                    success: true,
                    message: "Role type updated successfully",
                });
            }
            catch (err) {
                console.error("Error updating role type:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while updating role type",
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
    // Delete a super role type
    deleteSuperRoleType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const { roleTypeId } = req.params;
                if (!roleTypeId) {
                    res.status(400).json({
                        success: false,
                        message: "roleTypeId is required for deleting a role type",
                    });
                    return;
                }
                yield (0, SuperRoleTypesHelper_1.deleteRoleType)(connection, parseInt(roleTypeId, 10));
                res.status(200).json({
                    success: true,
                    message: "Role type deleted successfully",
                });
            }
            catch (err) {
                console.error("Error deleting role type:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while deleting role type",
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
    // Insert a new super role type
    insertSuperRoleType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const roleType = req.body;
                if (!roleType.roleTypeName) {
                    res.status(400).json({
                        success: false,
                        message: "roleTypeName is required for inserting a role type",
                    });
                    return;
                }
                yield (0, SuperRoleTypesHelper_1.insertRoleType)(connection, roleType);
                res.status(201).json({
                    success: true,
                    message: "Role type inserted successfully",
                });
            }
            catch (err) {
                console.error("Error inserting role type:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while inserting role type",
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
exports.adminRolesController = new AdminRolesManager();
//# sourceMappingURL=AdminRolesManager.js.map