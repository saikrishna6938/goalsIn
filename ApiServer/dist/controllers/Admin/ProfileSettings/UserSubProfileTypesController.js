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
exports.AdminUserSubProfileTypesController = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../../keys"));
// Local pool for this controller (pattern used in nearby controllers)
const pool = promise_1.default.createPool(keys_1.default.database);
class AdminUserSubProfileTypesController {
    constructor() { }
    // Assign subProfileIds to a user or users to a subProfile (merge; do not remove existing)
    assignUserSubProfiles(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body || {};
            const userIdRaw = body.userId;
            const subProfileIdsRaw = body.subProfileIds;
            const subProfileIdRaw = body.subProfileId;
            const userIdsRaw = (_a = body.userIds) !== null && _a !== void 0 ? _a : body.ueserIds; // be tolerant of typo
            const hasUserToSubProfiles = Number.isFinite(Number(userIdRaw)) && Array.isArray(subProfileIdsRaw);
            const hasSubProfileToUsers = Number.isFinite(Number(subProfileIdRaw)) && Array.isArray(userIdsRaw);
            if (!hasUserToSubProfiles && !hasSubProfileToUsers) {
                res.status(400).json({
                    message: "Provide either { userId, subProfileIds[] } or { subProfileId, userIds[] }",
                    status: false,
                });
                return;
            }
            let conn;
            try {
                conn = yield pool.getConnection();
                yield conn.beginTransaction();
                if (hasUserToSubProfiles) {
                    const userId = Number(userIdRaw);
                    const cleanedSubProfileIds = subProfileIdsRaw
                        .map((v) => Number(v))
                        .filter((v) => Number.isFinite(v));
                    // Fetch existing subProfileIds for this user to avoid duplicates
                    const [existingRows] = yield conn.query(`SELECT subProfileId FROM UserSubProfileTypes WHERE userId = ?`, [userId]);
                    const existingSet = new Set(existingRows.map((r) => Number(r.subProfileId)));
                    const toAdd = cleanedSubProfileIds.filter((sid) => !existingSet.has(sid));
                    let inserted = 0;
                    if (toAdd.length > 0) {
                        const values = [];
                        const placeholders = [];
                        for (const sid of toAdd) {
                            placeholders.push("(?, ?)");
                            values.push(sid, userId);
                        }
                        const sql = `INSERT INTO UserSubProfileTypes (subProfileId, userId) VALUES ${placeholders.join(",")}`;
                        const [result] = yield conn.execute(sql, values);
                        inserted = result.affectedRows || 0;
                    }
                    yield conn.commit();
                    res.status(200).json({
                        message: "Merged assignments for user (existing kept)",
                        userId,
                        addedSubProfileIds: toAdd,
                        alreadyAssigned: cleanedSubProfileIds.filter((sid) => existingSet.has(sid)),
                        inserted,
                        mode: "user-to-subprofiles",
                        status: true,
                    });
                    return;
                }
                if (hasSubProfileToUsers) {
                    const subProfileId = Number(subProfileIdRaw);
                    const cleanedUserIds = userIdsRaw
                        .map((v) => Number(v))
                        .filter((v) => Number.isFinite(v));
                    // Fetch existing users for this subProfile to avoid duplicates
                    const [existingRows] = yield conn.query(`SELECT userId FROM UserSubProfileTypes WHERE subProfileId = ?`, [subProfileId]);
                    const existingSet = new Set(existingRows.map((r) => Number(r.userId)));
                    const toAdd = cleanedUserIds.filter((uid) => !existingSet.has(uid));
                    let inserted = 0;
                    if (toAdd.length > 0) {
                        const values = [];
                        const placeholders = [];
                        for (const uid of toAdd) {
                            placeholders.push("(?, ?)");
                            values.push(subProfileId, uid);
                        }
                        const sql = `INSERT INTO UserSubProfileTypes (subProfileId, userId) VALUES ${placeholders.join(",")}`;
                        const [result] = yield conn.execute(sql, values);
                        inserted = result.affectedRows || 0;
                    }
                    yield conn.commit();
                    res.status(200).json({
                        message: "Merged assignments for subProfile (existing kept)",
                        subProfileId,
                        addedUserIds: toAdd,
                        alreadyAssigned: cleanedUserIds.filter((uid) => existingSet.has(uid)),
                        inserted,
                        mode: "subprofile-to-users",
                        status: true,
                    });
                    return;
                }
            }
            catch (error) {
                try {
                    yield (conn === null || conn === void 0 ? void 0 : conn.rollback());
                }
                catch (_b) { }
                res.status(500).json({
                    message: "Failed to update assignments",
                    error,
                    status: false,
                });
            }
            finally {
                conn === null || conn === void 0 ? void 0 : conn.release();
            }
        });
    }
    // Unassign specific mappings without touching others
    unassignUserSubProfiles(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body || {};
            const userIdRaw = body.userId;
            const subProfileIdsRaw = body.subProfileIds;
            const subProfileIdRaw = body.subProfileId;
            const userIdsRaw = (_a = body.userIds) !== null && _a !== void 0 ? _a : body.ueserIds; // be tolerant of typo
            const hasUserToSubProfiles = Number.isFinite(Number(userIdRaw)) && Array.isArray(subProfileIdsRaw);
            const hasSubProfileToUsers = Number.isFinite(Number(subProfileIdRaw)) && Array.isArray(userIdsRaw);
            if (!hasUserToSubProfiles && !hasSubProfileToUsers) {
                res.status(400).json({
                    message: "Provide either { userId, subProfileIds[] } or { subProfileId, userIds[] }",
                    status: false,
                });
                return;
            }
            let conn;
            try {
                conn = yield pool.getConnection();
                yield conn.beginTransaction();
                if (hasUserToSubProfiles) {
                    const userId = Number(userIdRaw);
                    const cleanedSubProfileIds = subProfileIdsRaw
                        .map((v) => Number(v))
                        .filter((v) => Number.isFinite(v));
                    if (cleanedSubProfileIds.length === 0) {
                        yield conn.commit();
                        res.status(200).json({
                            message: "Nothing to unassign (no subProfileIds provided)",
                            userId,
                            removedCount: 0,
                            removedSubProfileIds: [],
                            mode: "user-to-subprofiles",
                            status: true,
                        });
                        return;
                    }
                    const placeholders = cleanedSubProfileIds.map(() => "?").join(",");
                    const sql = `DELETE FROM UserSubProfileTypes WHERE userId = ? AND subProfileId IN (${placeholders})`;
                    const [result] = yield conn.execute(sql, [
                        userId,
                        ...cleanedSubProfileIds,
                    ]);
                    yield conn.commit();
                    res.status(200).json({
                        message: "Unassigned selected sub-profiles from user",
                        userId,
                        removedSubProfileIds: cleanedSubProfileIds,
                        removedCount: result.affectedRows || 0,
                        mode: "user-to-subprofiles",
                        status: true,
                    });
                    return;
                }
                if (hasSubProfileToUsers) {
                    const subProfileId = Number(subProfileIdRaw);
                    const cleanedUserIds = userIdsRaw
                        .map((v) => Number(v))
                        .filter((v) => Number.isFinite(v));
                    if (cleanedUserIds.length === 0) {
                        yield conn.commit();
                        res.status(200).json({
                            message: "Nothing to unassign (no userIds provided)",
                            subProfileId,
                            removedCount: 0,
                            removedUserIds: [],
                            mode: "subprofile-to-users",
                            status: true,
                        });
                        return;
                    }
                    const placeholders = cleanedUserIds.map(() => "?").join(",");
                    const sql = `DELETE FROM UserSubProfileTypes WHERE subProfileId = ? AND userId IN (${placeholders})`;
                    const [result] = yield conn.execute(sql, [
                        subProfileId,
                        ...cleanedUserIds,
                    ]);
                    yield conn.commit();
                    res.status(200).json({
                        message: "Unassigned selected users from sub-profile",
                        subProfileId,
                        removedUserIds: cleanedUserIds,
                        removedCount: result.affectedRows || 0,
                        mode: "subprofile-to-users",
                        status: true,
                    });
                    return;
                }
            }
            catch (error) {
                try {
                    yield (conn === null || conn === void 0 ? void 0 : conn.rollback());
                }
                catch (_b) { }
                res.status(500).json({
                    message: "Failed to unassign",
                    error,
                    status: false,
                });
            }
            finally {
                conn === null || conn === void 0 ? void 0 : conn.release();
            }
        });
    }
    // Fetch current subProfileIds for a user
    getUserSubProfiles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = Number(req.params.userId);
            if (!Number.isFinite(userId)) {
                res.status(400).json({ message: "Invalid userId", status: false });
                return;
            }
            try {
                const [rows] = yield pool.query(`SELECT subProfileId FROM UserSubProfileTypes WHERE userId = ? ORDER BY subProfileId ASC`, [userId]);
                const subProfileIds = rows.map((r) => r.subProfileId);
                res.status(200).json({ userId, subProfileIds, count: subProfileIds.length, status: true });
            }
            catch (error) {
                res.status(500).json({
                    message: "Failed to fetch user sub-profiles",
                    error,
                    status: false,
                });
            }
        });
    }
    // Fetch users for a given subProfileId
    getUsersBySubProfileId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const subProfileId = Number(req.params.subProfileId);
            if (!Number.isFinite(subProfileId)) {
                res.status(400).json({ message: "Invalid subProfileId", status: false });
                return;
            }
            try {
                const [rows] = yield pool.query(`SELECT u.userId, u.userFirstName, u.userLastName
         FROM Users u
         INNER JOIN UserSubProfileTypes uspt ON uspt.userId = u.userId
         WHERE uspt.subProfileId = ?
         ORDER BY u.userFirstName ASC, u.userLastName ASC`, [subProfileId]);
                res.status(200).json({ subProfileId, users: rows, count: rows.length, status: true });
            }
            catch (error) {
                res.status(500).json({
                    message: "Failed to fetch users by subProfileId",
                    error,
                    status: false,
                });
            }
        });
    }
}
exports.AdminUserSubProfileTypesController = AdminUserSubProfileTypesController;
exports.default = AdminUserSubProfileTypesController;
//# sourceMappingURL=UserSubProfileTypesController.js.map