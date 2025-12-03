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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTypes = exports.getNavigations = exports.authController = void 0;
const keys_1 = __importDefault(require("../keys"));
const User_1 = require("../modules/User");
const jwt_utils_1 = require("../utils/jwt.utils");
const SessionManager_1 = __importDefault(require("../session/SessionManager"));
const mysql = __importStar(require("mysql2/promise"));
const database_1 = __importDefault(require("../database"));
const crypto = __importStar(require("crypto"));
const jwt = __importStar(require("jsonwebtoken"));
const promises_1 = __importDefault(require("fs/promises"));
const EmailHelper_1 = require("../EmailHelper");
const userDashboardData_1 = require("../helpers/dashboard/userDashboardData");
const IndexController_1 = require("./IndexController");
const UserHelprs_1 = require("../helpers/user/UserHelprs");
const socket_1 = require("../socket");
const socket_2 = require("../socket");
class AuthenticateController {
    login(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { userEmail, userPassword } = req.body;
            let connection = null;
            try {
                // Fail fast if DB is unreachable
                connection = yield mysql.createConnection(Object.assign(Object.assign({}, keys_1.default.database), { connectTimeout: 5000 }));
                const [rows] = yield connection.execute({
                    sql: `SELECT ${User_1.UserSqlObject},roles,entities FROM Users WHERE userEmail = ? AND userPassword = ?`,
                    timeout: 15000,
                }, [userEmail, userPassword]);
                const user = Object.values(JSON.parse(JSON.stringify(rows)));
                if (user.length > 0) {
                    const userId = user[0].userId;
                    const resolveEntityId = () => {
                        var _a, _b;
                        const raw = (_a = req.body) === null || _a === void 0 ? void 0 : _a.entityId;
                        if (raw !== undefined && raw !== null) {
                            const parsed = Number(raw);
                            if (!Number.isNaN(parsed)) {
                                return parsed;
                            }
                        }
                        const entitiesRaw = (_b = user[0]) === null || _b === void 0 ? void 0 : _b.entities;
                        if (typeof entitiesRaw === "string" && entitiesRaw.trim().length > 0) {
                            const candidate = entitiesRaw
                                .split(",")
                                .map((value) => Number(value.trim()))
                                .find((value) => Number.isInteger(value) && value > 0);
                            if (candidate !== undefined) {
                                return candidate;
                            }
                        }
                        return null;
                    };
                    const entityId = resolveEntityId();
                    const dashboardData = yield (0, userDashboardData_1.buildUserDashboardData)(connection, userId, entityId);
                    const { notes, dashboardCounts, pendingTaskIds, recentTaskIds, oldestTaskIds, pendingApplicationTasks, pendingAssignedTasks, tasks, } = dashboardData;
                    const accessToken = jwt.sign({ userId: user[0].userId }, (0, jwt_utils_1.generateJWTSecretKey)(100), { expiresIn: "7d" });
                    const refreshToken = jwt.sign({ userId: user[0].userId }, (0, jwt_utils_1.generateJWTSecretKey)(100), { expiresIn: "7d" });
                    const navigations = yield (0, exports.getNavigations)(user[0].userType);
                    const userSettings = yield (0, UserHelprs_1.fetchUserSettings)(connection, user[0].userId);
                    // Fetch user profile(s) with setting names by userId
                    const userProfile = yield getUserProfilesWithSettingNames(connection, userId);
                    // Set auth cookies to help Socket.IO identify the user on next connect
                    try {
                        const secure = false; //process.env.NODE_ENV === "production";
                        // Keep access token short-lived in a cookie if needed; currently 7d
                        res.cookie("accessToken", accessToken, {
                            httpOnly: true,
                            sameSite: "lax",
                            secure,
                            maxAge: 7 * 24 * 60 * 60 * 1000,
                        });
                        res.cookie("refreshToken", refreshToken, {
                            httpOnly: true,
                            sameSite: "lax",
                            secure,
                            maxAge: 7 * 24 * 60 * 60 * 1000,
                        });
                    }
                    catch (_b) { }
                    // Optionally bind an existing Socket.IO connection to this user
                    try {
                        const socketId = (_a = req.body) === null || _a === void 0 ? void 0 : _a.socketId;
                        if (socketId) {
                            // Persist the socketId on the user for later direct emits
                            try {
                                yield (connection === null || connection === void 0 ? void 0 : connection.execute(`UPDATE Users SET socketId = ? WHERE userId = ?`, [String(socketId), userId]));
                            }
                            catch (_c) { }
                            const io = (0, socket_1.getIo)();
                            const sock = io === null || io === void 0 ? void 0 : io.sockets.sockets.get(String(socketId));
                            if (sock) {
                                (0, socket_2.bindSocketToUser)(sock, userId);
                                sock.data = sock.data || {};
                                sock.data.userId = userId;
                                console.log(`Socket bound during login: socketId=${socketId}, userId=${userId}`);
                            }
                            else {
                                console.log(`Socket not found during login bind: ${socketId}`);
                            }
                        }
                    }
                    catch (_d) { }
                    res.json({
                        success: true,
                        message: "Login successful",
                        user: user,
                        accessToken,
                        refreshToken,
                        navigations,
                        notes,
                        userSettings,
                        userProfile,
                        dashboardCounts,
                        pendingTaskIds,
                        recentTaskIds,
                        oldestTaskIds,
                        pendingApplicationTasks,
                        pendingAssignedTasks,
                        pendingTasks: pendingAssignedTasks,
                        tasks,
                        dashboard: dashboardData,
                    });
                    // track session after responding (non-blocking)
                    try {
                        SessionManager_1.default.addSession(accessToken);
                    }
                    catch (_e) { }
                    // Debug: Log online users snapshot right after login (post-bind)
                    try {
                        console.log("Online users after login:", (0, socket_1.getOnlineUsers)());
                    }
                    catch (_f) { }
                }
                else {
                    res
                        .status(401)
                        .json({ success: false, message: "Invalid credentials" });
                }
            }
            catch (error) {
                console.log("/api/login error", error);
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    error: error,
                });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_g) { }
                }
            }
        });
    }
    loginWithAccessToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield SessionManager_1.default.checkAccessToken(req.body.accessToken);
            if (response == 1) {
                // Optionally bind an existing Socket.IO connection using provided socketId
                try {
                    const { socketId, accessToken } = req.body || {};
                    // Also persist socketId on Users if we can decode the user
                    const io = (0, socket_1.getIo)();
                    const sock = io === null || io === void 0 ? void 0 : io.sockets.sockets.get(String(socketId));
                    if (sock && accessToken) {
                        try {
                            const decoded = jwt.decode(String(accessToken));
                            const uid = (decoded === null || decoded === void 0 ? void 0 : decoded.userId) || (decoded === null || decoded === void 0 ? void 0 : decoded.sub);
                            if (uid) {
                                try {
                                    const conn = yield mysql.createConnection(keys_1.default.database);
                                    yield conn.execute(`UPDATE Users SET socketId = ? WHERE userId = ?`, [String(socketId), uid]);
                                    yield conn.end();
                                }
                                catch (_a) { }
                                (0, socket_2.bindSocketToUser)(sock, uid);
                                sock.data = sock.data || {};
                                sock.data.userId = uid;
                                console.log(`Socket bound during token-check: socketId=${socketId}, userId=${uid}`);
                            }
                        }
                        catch (_b) { }
                    }
                }
                catch (_c) { }
                res.json({
                    success: true,
                    message: "Valid Token",
                });
                try {
                    console.log("Online users after token-check:", (0, socket_1.getOnlineUsers)());
                }
                catch (_d) { }
            }
            else {
                res.json({
                    success: false,
                    message: "Invalid Token",
                });
                try {
                    console.log("Online users after token-check (invalid):", (0, socket_1.getOnlineUsers)());
                }
                catch (_e) { }
            }
        });
    }
    //Deprecated Function
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userType, entityId } = req.params;
            let sqlQuery;
            let queryParams = [];
            // Construct the query based on entities value
            if (entityId === "-1") {
                sqlQuery = `SELECT ${User_1.UserSqlObject}, userPassword, roles, entities FROM Users AS U WHERE userType = 2`;
                queryParams = [userType];
            }
            if (!sqlQuery) {
                res.status(400).json({
                    success: false,
                    message: "Invalid request parameters",
                });
                return;
            }
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [rows] = yield connection.execute(sqlQuery, queryParams);
                res.json({
                    success: true,
                    message: "Success",
                    data: rows,
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
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
    register(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const _b = req.body, { userId } = _b, userProps = __rest(_b, ["userId"]); // Destructure request body
            const { entityId } = req.params; // Extract entityId
            // Validate inputs
            if (!entityId) {
                return res.status(400).json({
                    success: false,
                    message: "Entity ID is required",
                });
            }
            const columnNames = Object.keys(userProps).join(", ");
            const placeholders = Object.keys(userProps).fill("?").join(", ");
            const values = Object.values(userProps);
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                // Insert user into the Users table
                const [result] = yield connection.execute(`INSERT INTO Users (${columnNames}) VALUES (${placeholders})`, values);
                //@ts-ignore
                const lastInsertId = result.insertId;
                // Fetch the newly created user
                const [rows] = yield connection.execute(`SELECT * FROM Users WHERE userId = ?`, [lastInsertId]);
                const user = Object.values(JSON.parse(JSON.stringify(rows)));
                if (user && user.length > 0) {
                    // Fetch the roleNameId from the Structure table for the provided entityId
                    const [roleRows] = yield connection.execute(`SELECT userRoleNameId FROM Structure WHERE entityId = ?`, [entityId]);
                    const role = Object.values(JSON.parse(JSON.stringify(roleRows)));
                    if (role && role.length > 0) {
                        const roleNameId = ((_a = role[0]) === null || _a === void 0 ? void 0 : _a.userRoleNameId) || null;
                        if (!roleNameId) {
                            throw new Error("Role name ID not found for the given entity");
                        }
                        // Insert into SuperUserRoles
                        yield connection.execute(`INSERT INTO SuperUserRoles (userId, userRoleNameId) VALUES (?, ?)`, [user[0].userId, roleNameId]);
                    }
                    else {
                        console.log("No roleNameId found for the given entityId");
                    }
                }
                connection.end();
                //@ts-ignore
                if (result.affectedRows > 0) {
                    // Generate tokens
                    const accessToken = jwt.sign({ userId: user[0].userId }, (0, jwt_utils_1.generateJWTSecretKey)(100), { expiresIn: "15m" });
                    const refreshToken = jwt.sign({ userId: user[0].userId }, (0, jwt_utils_1.generateJWTSecretKey)(100), { expiresIn: "7d" });
                    // Send registration email
                    const entry = IndexController_1.searchStringMap["register"];
                    const replaceString = [
                        keys_1.default.dashboardLink,
                        `${user[0].userFirstName} ${user[0].userLastName}`,
                    ];
                    let emailTemplate = yield promises_1.default.readFile(entry.filePath, "utf8");
                    entry.searchString.map((r, i) => {
                        emailTemplate = emailTemplate.replace(r, `${replaceString[i]}`);
                    });
                    const subject = "User Registered Successfully";
                    (0, EmailHelper_1.sendEmail)(emailTemplate, user[0].userEmail, subject);
                    res.json({
                        success: true,
                        message: "User registered successfully",
                        user: user,
                        accessToken,
                        refreshToken,
                        navigations: (0, exports.getNavigations)(user[0].userType),
                    });
                }
                else {
                    res.status(500).json({
                        success: false,
                        message: "Failed to register user",
                    });
                }
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: "An error occurred during registration",
                    error: error.message,
                });
            }
        });
    }
    forgotPasswordEmail(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { userEmail } = req.body;
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const urlText = crypto.randomBytes(8).toString("hex");
                const now = new Date();
                const expireDatetime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
                const [rows] = yield connection.execute(`SELECT * FROM Users WHERE userEmail = ?`, [userEmail]);
                const userId = (_b = (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : null;
                if (userId) {
                    const [existingRows] = yield connection.execute("SELECT COUNT(*) AS count FROM UserFix WHERE userId = ?", [userId]);
                    if (existingRows[0].count > 0) {
                        yield connection.execute("UPDATE UserFix SET urlText = ?, expireDatetime = ? WHERE userId = ?", [urlText, expireDatetime, userId]);
                    }
                    else {
                        yield connection.execute("INSERT INTO UserFix (userId, createdDatetime, expireDatetime, urlText) VALUES (?, NOW(), ?, ?)", [userId, expireDatetime, urlText]);
                    }
                    const entry = IndexController_1.searchStringMap["reset"];
                    const replaceString = [urlText];
                    let emailTemplate = yield promises_1.default.readFile(entry.filePath, "utf8");
                    entry.searchString.map((r, i) => {
                        emailTemplate = emailTemplate.replace(r, `${keys_1.default.appPath}session/reset-password/${replaceString[i]}`);
                    });
                    const subject = "Reset Password Request";
                    (0, EmailHelper_1.sendEmail)(emailTemplate, userEmail, subject);
                    res.json({
                        success: true,
                        message: "Password reset URL generated successfully",
                    });
                }
                else {
                    res.json({
                        success: false,
                        message: "User not found",
                    });
                }
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
                    catch (_c) { }
                }
            }
        });
    }
    forgotPassword(req, res) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.body;
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const urlText = crypto.randomBytes(8).toString("hex");
                const now = new Date();
                const expireDatetime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
                const [rows] = yield connection.execute(`SELECT * FROM Users WHERE userId = ?`, [userId]);
                const id = (_b = (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : null;
                const userEmail = (_d = (_c = rows[0]) === null || _c === void 0 ? void 0 : _c.userEmail) !== null && _d !== void 0 ? _d : null;
                if (id) {
                    const [existingRows] = yield connection.execute("SELECT COUNT(*) AS count FROM UserFix WHERE userId = ?", [userId]);
                    if (existingRows[0].count > 0) {
                        // If the userId exists, update the record
                        yield connection.execute("UPDATE UserFix SET urlText = ?, expireDatetime = ? WHERE userId = ?", [urlText, expireDatetime, userId]);
                    }
                    else {
                        // If the userId doesn't exist, insert a new record
                        yield connection.execute("INSERT INTO UserFix (userId, createdDatetime, expireDatetime, urlText) VALUES (?, NOW(), ?, ?)", [userId, expireDatetime, urlText]);
                    }
                    const entry = IndexController_1.searchStringMap["reset"];
                    const replaceString = [urlText];
                    let emailTemplate = yield promises_1.default.readFile(entry.filePath, "utf8");
                    entry.searchString.map((r, i) => {
                        emailTemplate = emailTemplate.replace(r, `${keys_1.default.appPath}session/reset-password/${replaceString[i]}`);
                    });
                    const subject = "Reset Password Request";
                    (0, EmailHelper_1.sendEmail)(emailTemplate, userEmail, subject);
                    res.json({
                        success: true,
                        message: "Password reset URL generated successfully",
                    });
                }
                else {
                    res.json({
                        success: false,
                        message: "User not found",
                    });
                }
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
                    catch (_e) { }
                }
            }
        });
    }
    resetPasswordFrontEnd(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { urlText, newPassword } = req.body;
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute(`SELECT * FROM UserFix WHERE  urlText = '${urlText}' AND expireDatetime > NOW()`);
                //@ts-ignore
                if (result.length === 0) {
                    res.status(200).json({
                        success: false,
                        message: "Invalid or expired reset password URL",
                    });
                    return;
                }
                yield connection.execute("UPDATE Users SET userPassword = ? WHERE userId = ?", [newPassword, result[0].userId]);
                // Delete the record from UserFix table
                yield connection.execute("DELETE FROM UserFix WHERE userId = ?", [
                    result[0].userId,
                ]);
                res.json({ success: true, message: "Password reset successfully" });
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
                    catch (_a) { }
                }
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, urlText, newPassword } = req.body;
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute(`SELECT * FROM UserFix WHERE userId = ${userId} AND urlText = '${urlText}' AND expireDatetime > NOW()`);
                //@ts-ignore
                if (result.length === 0) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid or expired reset password URL",
                    });
                    return;
                }
                yield connection.execute("UPDATE Users SET userPassword = ? WHERE userId = ?", [newPassword, userId]);
                // Delete the record from UserFix table
                yield connection.execute("DELETE FROM UserFix WHERE userId = ?", [
                    userId,
                ]);
                res.json({ success: true, message: "Password reset successfully" });
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
                    catch (_a) { }
                }
            }
        });
    }
}
exports.authController = new AuthenticateController();
// Returns array of user's sub-profiles with their setting names
function getUserProfilesWithSettingNames(connection, userId) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `
    SELECT 
      uspt.subProfileId,
      spt.subProfileName,
      ust.Name AS settingName
    FROM UserSubProfileTypes uspt
    LEFT JOIN SubProfileTypes spt ON spt.subProfileId = uspt.subProfileId
    LEFT JOIN SubProfileSettings sps ON sps.subProfileId = uspt.subProfileId
    LEFT JOIN UserSettingsTypes ust ON ust.Id = sps.SettingId
    WHERE uspt.userId = ?
    ORDER BY uspt.subProfileId, ust.Name ASC
  `;
        const [rows] = yield connection.execute(sql, [userId]);
        const bySub = {};
        for (const r of rows) {
            const sid = Number(r.subProfileId);
            if (!Number.isFinite(sid))
                continue;
            if (!bySub[sid]) {
                bySub[sid] = {
                    subProfileId: sid,
                    subProfileName: (_a = r.subProfileName) !== null && _a !== void 0 ? _a : null,
                    settingNames: new Set(),
                };
            }
            const name = r.settingName;
            if (name && typeof name === "string")
                bySub[sid].settingNames.add(name);
        }
        return Object.values(bySub).map((v) => ({
            subProfileId: v.subProfileId,
            subProfileName: v.subProfileName,
            settingNames: Array.from(v.settingNames.values()),
        }));
    });
}
const getNavigations = (userType) => __awaiter(void 0, void 0, void 0, function* () {
    let adminNavigation = [
        { name: "My Tasks", path: "/dashboard/default", icon: "dashboard" },
        { name: "User Management", path: "/user/users", icon: "group_add" },
        { name: "Applications", path: "/user/documents", icon: "description" },
        //{ name: "Select Entity", path: "#", icon: "location_on" },
    ];
    let navigations = yield [
        { name: "Dashboard", path: "/dashboard/default", icon: "dashboard" },
        {
            name: "Apply",
            icon: "pending",
            children: yield getUserDocuments(userType),
        },
        { name: "Help", path: "/user/help", icon: "dashboard" },
    ];
    if (userType === UserTypes.Admin ||
        userType === UserTypes.EntityAdmin ||
        userType === UserTypes.SuperAdmin ||
        userType === UserTypes.Job ||
        userType === -1) {
        return adminNavigation;
    }
    else {
        return navigations;
    }
});
exports.getNavigations = getNavigations;
function getUserDocuments(userType) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const [rows] = yield database_1.default.execute(`SELECT dt.documentTypeId, dt.documentTypeName
       FROM UserDocumentsPermission udp
       JOIN DocumentType dt ON dt.documentTypeId = udp.documentTypeId
       WHERE udp.userType = ?`, [userType]);
            //@ts-ignore
            const docs = Array.isArray(rows) ? rows : [];
            return docs.map((d) => ({
                name: d.documentTypeName,
                iconText: "task_alt",
                path: `/user/document/${d.documentTypeId}`,
            }));
        }
        catch (error) {
            console.error("Error fetching user documents:", error);
            return [];
        }
    });
}
var UserTypes;
(function (UserTypes) {
    UserTypes[UserTypes["Admin"] = 1] = "Admin";
    UserTypes[UserTypes["Default"] = 2] = "Default";
    UserTypes[UserTypes["Job"] = 3] = "Job";
    UserTypes[UserTypes["EntityAdmin"] = 4] = "EntityAdmin";
    UserTypes[UserTypes["SuperAdmin"] = 5] = "SuperAdmin";
})(UserTypes || (exports.UserTypes = UserTypes = {}));
//# sourceMappingURL=AuthenticateController.js.map