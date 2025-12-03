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
exports.userRolesManagerController = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../keys"));
const UserRolesManagerHelper_1 = require("../../helpers/RolesManager/AdminManager/UserManager/UserRolesManagerHelper");
class UserRolesManagerController {
    constructor() { }
    getUsersByEntityId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield promise_1.default.createConnection(keys_1.default.database);
                const { entityId, userType } = req.params;
                if (!entityId) {
                    res.status(400).json({
                        success: false,
                        message: "entityId is required to fetch users",
                    });
                    return;
                }
                const users = yield (0, UserRolesManagerHelper_1.getUsersByEntityId)(connection, parseInt(entityId, 10));
                yield connection.end();
                res.status(200).json({
                    success: true,
                    data: users,
                });
            }
            catch (err) {
                console.error("Error fetching users by entityId:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while fetching users",
                    error: err.message,
                });
            }
        });
    }
    getSuperUserRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const query = `
          SELECT 
            sur.superUserRoleId,
            sur.userId,
            sur.userRoleNameId AS roleNameId,
            sur.updatedDate,
            srn.roleName
          FROM SuperUserRoles sur
          LEFT JOIN SuperRoleNames srn ON sur.userRoleNameId = srn.roleNameId
          WHERE sur.userId = ?
        `;
                const [rows] = yield connection.execute(query, [userId]);
                res.status(200).json({ rows, status: true });
            }
            catch (error) {
                console.error("Error fetching SuperUserRoles:", error);
                res.status(500).json({
                    message: "Error fetching SuperUserRoles",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    getusersforjob(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield promise_1.default.createConnection(keys_1.default.database);
                const { entityId, userType } = req.params;
                if (!entityId) {
                    res.status(400).json({
                        success: false,
                        message: "entityId is required to fetch users",
                    });
                    return;
                }
                const users = yield (0, UserRolesManagerHelper_1.getUsersByJob)(connection, parseInt(entityId, 10), parseInt(userType, 10));
                yield connection.end();
                res.status(200).json({
                    success: true,
                    data: users,
                });
            }
            catch (err) {
                console.error("Error fetching users by entityId:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while fetching users",
                    error: err.message,
                });
            }
        });
    }
    addSuperUserRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const roles = req.body;
            if (!Array.isArray(roles) || roles.length === 0) {
                return res
                    .status(400)
                    .json({ message: "Invalid input: must be a non-empty array" });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const insertQuery = `
          INSERT INTO SuperUserRoles (
            userId,
            userRoleNameId,
            updatedDate
          ) VALUES ?
        `;
                const values = roles.map((role) => [
                    role.userId,
                    role.userRoleNameId,
                    role.updatedDate || new Date(), // defaulting to current date
                ]);
                const [result] = yield connection.query(insertQuery, [values]);
                res.status(201).json({
                    message: "SuperUserRoles added successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error adding SuperUserRoles:", error);
                res.status(500).json({
                    message: "Error adding SuperUserRoles",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    deleteSuperUserRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { roleIds: superUserRoleIds, userId } = req.body;
            console.log(req.body);
            if (!Array.isArray(superUserRoleIds) ||
                superUserRoleIds.length === 0 ||
                !userId) {
                return res.status(400).json({
                    message: "Invalid input: Provide superUserRoleIds and userId",
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const deleteQuery = `
          DELETE FROM SuperUserRoles 
          WHERE userRoleNameId IN (?) AND userId = ?
        `;
                const [result] = yield connection.query(deleteQuery, [
                    superUserRoleIds,
                    userId,
                ]);
                res.status(200).json({
                    message: "SuperUserRoles deleted successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error deleting SuperUserRoles:", error);
                res.status(500).json({
                    message: "Error deleting SuperUserRoles",
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
exports.userRolesManagerController = new UserRolesManagerController();
//# sourceMappingURL=UserRolesManagerController.js.map