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
exports.rolescontroller = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../keys"));
class RolesController {
    index(req, res) {
        res.send(" Hello from controller");
    }
    test(req, res) {
        res.send(req.body);
    }
    addRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { roleTypeId, roleName, roleDescription } = req.body;
                connection = yield mysql.createConnection(keys_1.default.database);
                yield connection.execute(`INSERT INTO Roles ( roleTypeId, roleName, roleDescription) VALUES ( ?, ?, ?)`, [roleTypeId, roleName, roleDescription]);
                res.json({ success: true, message: "Role added successfully" });
            }
            catch (error) {
                res.status(500).json({ success: false, message: "Failed to add role" });
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
    getRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute("SELECT * from Roles");
                //@ts-ignore
                if (result.length) {
                    res.json({ success: true, message: "Success", data: result });
                }
                else {
                    res.json({ success: true, message: "Success", data: [] });
                }
            }
            catch (error) {
                res.json({ success: false, message: "Something went wrong", data: [] });
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
    getRolesById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const roleId = req.params.roleId;
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute("SELECT * from Roles WHERE roleId= ?", [roleId]);
                //@ts-ignore
                if (result.length) {
                    res.json({ success: true, message: "Success", data: result[0] });
                }
                else {
                    res.json({ success: true, message: "Success", data: {} });
                }
            }
            catch (error) {
                res.json({ success: false, message: "Something went wrong", data: {} });
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
    updateRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const roleId = req.params.roleId; // Extract the roleId from the request parameters
                const { roleTypeId, roleName, roleDescription } = req.body;
                connection = yield mysql.createConnection(keys_1.default.database);
                yield connection.execute(`UPDATE Roles SET roleTypeId = ?, roleName = ?, roleDescription = ? WHERE roleId = ?`, [roleTypeId, roleName, roleDescription, roleId]);
                res.json({ success: true, message: "Role updated successfully" });
            }
            catch (error) {
                res
                    .status(500)
                    .json({ success: false, message: "Failed to update role" });
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
    deleteRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const roleId = req.params.roleId;
                connection = yield mysql.createConnection(keys_1.default.database);
                yield connection.execute(`DELETE FROM Roles WHERE roleId = ?`, [roleId]);
                res.json({ success: true, message: "Role deleted successfully" });
            }
            catch (error) {
                res
                    .status(500)
                    .json({ success: false, message: "Failed to delete role" });
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
    addRoleType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { documentTypeId, roleTypeName, roleTypeDescription } = req.body;
                connection = yield mysql.createConnection(keys_1.default.database);
                yield connection.execute(`INSERT INTO RoleTypes (documentTypeId, roleTypeName, roleTypeDescription) VALUES (?, ?, ?)`, [documentTypeId, roleTypeName, roleTypeDescription]);
                res.json({ success: true, message: "Role type added successfully" });
            }
            catch (error) {
                res
                    .status(500)
                    .json({ success: false, message: "Failed to add role type" });
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
    getRoleTypes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute(`SELECT * FROM RoleTypes `);
                //@ts-ignore
                if (result.length)
                    res.json({ success: true, message: "Success", data: result });
                else
                    res.json({ success: true, message: "Success", data: {} });
            }
            catch (error) {
                res.status(500).json({ success: false, message: "Failed", data: {} });
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
    updateRoleType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const roleTypeId = req.params.roleTypeId; // Extract the documentTypeId from the request parameters
                const { roleTypeName, roleTypeDescription, documentTypeId } = req.body;
                connection = yield mysql.createConnection(keys_1.default.database);
                yield connection.execute(`UPDATE RoleTypes SET roleTypeName = ?, roleTypeDescription = ?, documentTypeId = ? WHERE documentTypeId = ?`, [roleTypeName, roleTypeDescription, documentTypeId, roleTypeId]);
                res.json({ success: true, message: "Role type updated successfully" });
            }
            catch (error) {
                res
                    .status(500)
                    .json({ success: false, message: "Failed to update role type" });
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
    deleteRoleType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const roleTypeId = req.params.roleTypeId; // Extract the documentTypeId from the request parameters
                connection = yield mysql.createConnection(keys_1.default.database);
                yield connection.execute(`DELETE FROM RoleTypes WHERE documentTypeId = ?`, [roleTypeId]);
                res.json({ success: true, message: "Role type deleted successfully" });
            }
            catch (error) {
                res
                    .status(500)
                    .json({ success: false, message: "Failed to delete role type" });
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
exports.rolescontroller = new RolesController();
//# sourceMappingURL=RolesController.js.map