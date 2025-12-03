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
exports.mainController = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../keys"));
const User_1 = require("../modules/User");
const jwt_utils_1 = require("../utils/jwt.utils");
const jwt = __importStar(require("jsonwebtoken"));
const SessionManager_1 = __importDefault(require("../session/SessionManager"));
const GlobalController_1 = require("./GlobalController");
const UserRolesManagerHelper_1 = require("../helpers/RolesManager/AdminManager/UserManager/UserRolesManagerHelper");
const userDashboardData_1 = require("../helpers/dashboard/userDashboardData");
class MainController {
    constructor() {
        this.getUserSettings = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(req.body.userId, 10);
                if (isNaN(userId)) {
                    return res
                        .status(400)
                        .json({ success: false, message: "Invalid userId" });
                }
                const connection = yield mysql.createConnection(keys_1.default.database);
                const [settings] = yield connection.execute(`
        SELECT ust.Name,ust.Id
        FROM UserSettingsTypes ust
        INNER JOIN SubProfileSettings sps ON ust.Id = sps.SettingId
        INNER JOIN UserSubProfileTypes uspt ON sps.subProfileId = uspt.subProfileId
        WHERE uspt.userId = ?
        `, [userId]);
                connection.end();
                res.json({ success: true, data: settings });
            }
            catch (error) {
                console.error(error);
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
            }
        });
        this.getUserDashboardData = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(req.body.userId, 10);
                const { entityId: rawEntityId } = req.body;
                const entityId = rawEntityId !== undefined && rawEntityId !== null
                    ? Number(rawEntityId)
                    : undefined;
                if (isNaN(userId)) {
                    return res
                        .status(400)
                        .json({ success: false, message: "Invalid userId" });
                }
                const connection = yield mysql.createConnection(keys_1.default.database);
                const userQuery = `SELECT userId FROM Users WHERE userId = ? LIMIT 1`;
                const [user] = yield connection.execute(userQuery, [userId]);
                if (user.length === 0) {
                    return res
                        .status(404)
                        .json({ success: false, message: "User not found" });
                }
                const dashboardData = yield (0, userDashboardData_1.buildUserDashboardData)(connection, userId, entityId);
                connection.end();
                return res.json({
                    success: true,
                    data: dashboardData,
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch user dashboard data",
                });
            }
        });
    }
    protected(req, res) {
        var _a;
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, (0, jwt_utils_1.generateJWTSecretKey)(100));
                // Token is valid, return protected data
                res.json({ success: true, message: "Protected data", user: decoded });
            }
            catch (error) {
                console.error("Error occurred during token verification:", error);
                res.status(401).json({ success: false, message: "Invalid token" });
            }
        }
    }
    refreshToken(req, res) {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            return res
                .status(401)
                .json({ success: false, message: "Refresh token not provided" });
        }
        try {
            jwt.verify(refreshToken, keys_1.default.refreshSecret, (err, decoded) => {
                if (err) {
                    console.error("Error occurred during token verification:", err);
                    return res
                        .status(401)
                        .json({ success: false, message: "Invalid refresh token" });
                }
                //@ts-ignore
                const accessToken = jwt.sign(
                //@ts-ignore
                { userId: decoded.userId }, (0, jwt_utils_1.generateJWTSecretKey)(100), { expiresIn: "15m" });
                // Return success response with new access token
                res.json({ success: true, message: "Token refreshed", accessToken });
            });
        }
        catch (error) { }
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { accessToken } = req.body;
            const sessions = SessionManager_1.default.getAllSessions();
            const index = sessions.indexOf(String(accessToken).split(" ")[0]);
            if (index !== -1) {
                SessionManager_1.default.removeSession(sessions[index]);
                res.json({ success: true, message: "Logout successful" });
            }
            else {
                res.status(401).json({ success: false, message: "Invalid access token" });
            }
        });
    }
    getUserEntities(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield mysql.createConnection(keys_1.default.database);
                const { userId } = req.params;
                if (!userId) {
                    res.status(400).json({
                        success: false,
                        message: "userId is required to fetch entities",
                    });
                    return;
                }
                try {
                    const entities = yield (0, UserRolesManagerHelper_1.getUserEntities)(connection, parseInt(userId, 10));
                    res.status(200).json({
                        success: true,
                        data: entities,
                    });
                }
                finally {
                    connection.end();
                }
            }
            catch (err) {
                console.error("Error fetching entities for user:", err);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while fetching entities",
                    error: err.message,
                });
            }
        });
    }
    getAllRolesWithTypes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield mysql.createConnection(keys_1.default.database);
                const [rows] = yield connection.execute(`SELECT 
                r.roleId, r.roleTypeId, r.roleName, r.roleDescription, r.entities,
                rt.roleTypeName, rt.roleTypeDescription
             FROM Roles AS r
             INNER JOIN RoleTypes AS rt ON r.roleTypeId = rt.roleTypeId`);
                connection.end();
                res.json({
                    success: true,
                    message: "Fetched roles successfully",
                    data: rows,
                });
            }
            catch (error) {
                console.log(error);
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
            }
        });
    }
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.body;
            try {
                const connection = yield mysql.createConnection(keys_1.default.database);
                let query = `UPDATE Users SET `;
                const { query: newQuery, values } = (0, User_1.createUserQuery)(`UPDATE Users SET `, req.body);
                values.push(req.body.userId); // add userId to the end since it's used in the WHERE clause
                const finalQuery = newQuery + ` WHERE userId=?`;
                // Now you can execute using the finalQuery and values array.
                const [result] = yield connection.execute(finalQuery, values);
                if (req.body.userType === 2) {
                    GlobalController_1.globalController.assignDefaultRoleToUser(req.body.userId);
                }
                connection.end();
                //@ts-ignore
                if (result.length === 0) {
                    res.status(404).json({ success: false, message: "User not found" });
                }
                else {
                    res.json({
                        success: true,
                        message: "User details updated successfully",
                    });
                }
            }
            catch (error) {
                console.log(error);
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
            }
        });
    }
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.body;
            try {
                const connection = yield mysql.createConnection(keys_1.default.database);
                // Delete the user
                const [result] = yield connection.execute("DELETE FROM Users WHERE userId = ?", [userId]);
                connection.end();
                //@ts-ignore
                if (result.length === 0) {
                    res.status(404).json({ success: false, message: "User not found" });
                }
                else {
                    res.json({ success: true, message: "User deleted successfully" });
                }
            }
            catch (error) {
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
            }
        });
    }
    getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield mysql.createConnection(keys_1.default.database);
                // Explicit allowlist (no userPassword). Includes details if present.
                const base = `
      SELECT
        u.userId,
        u.userName,
        u.userEmail,
        u.userFirstName,
        u.userLastName,
        u.userImage,
        u.userAddress,
        u.userServerEmail,
        u.userPhoneOne,
        u.userPhoneTwo,
        u.userLastLogin,
        u.userCreated,
        u.userEnabled,
        u.userLocked,
        u.userType,
        u.lastNotesSeen,
        ud.avatar,
        ud.preferences
      FROM Users u
      LEFT JOIN userDetails ud ON u.userId = ud.userDetailsId
      WHERE
    `;
                // Whitelist the fields you want to allow for filtering
                const allowedFilters = [
                    "userId",
                    "userEmail",
                    "userName",
                    "mobileNumber",
                    "status",
                ];
                const { query, values } = (0, User_1.buildUserWhere)(base, req.body, allowedFilters);
                const [rows] = yield connection.execute(query, values);
                yield connection.end();
                // @ts-ignore
                if (!rows || rows.length === 0) {
                    res.status(404).json({ success: false, message: "User not found" });
                    return;
                }
                // Defensive scrub in case schema changes accidentally reintroduce userPassword
                // @ts-ignore
                const sanitized = rows.map((r) => {
                    if ("userPassword" in r)
                        delete r.userPassword;
                    return r;
                });
                res.json({ success: true, data: sanitized });
            }
            catch (error) {
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error", error });
            }
        });
    }
}
exports.mainController = new MainController();
//# sourceMappingURL=MainController.js.map