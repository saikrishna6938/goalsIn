"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUserSubProfileTypesController = void 0;
const mongo_1 = require("../../../config/mongo");
const toNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim().length) {
        const parsed = Number(value.trim());
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};
class AdminUserSubProfileTypesController {
    constructor() {
        this.assignUserSubProfiles = async (req, res) => {
            const body = req.body || {};
            const userId = toNumber(body.userId);
            const subProfileIds = this.parseIdArray(body.subProfileIds);
            const subProfileId = toNumber(body.subProfileId);
            const userIds = this.parseIdArray(body.userIds ?? body.ueserIds);
            const hasUserToSubProfiles = userId !== null && Array.isArray(body.subProfileIds);
            const hasSubProfileToUsers = subProfileId !== null && Array.isArray(body.userIds ?? body.ueserIds);
            if (!hasUserToSubProfiles && !hasSubProfileToUsers) {
                return res.status(400).json({
                    message: "Provide either { userId, subProfileIds[] } or { subProfileId, userIds[] }",
                    status: false,
                });
            }
            try {
                const collection = await this.collection();
                if (hasUserToSubProfiles && userId !== null) {
                    const existing = await collection.find({ userId }, { projection: { _id: 0, subProfileId: 1 } }).toArray();
                    const existingSet = new Set(existing.map((doc) => doc.subProfileId));
                    const toAdd = subProfileIds.filter((sid) => !existingSet.has(sid));
                    if (toAdd.length) {
                        let nextId = await this.nextId(collection);
                        const docs = toAdd.map((sid) => ({
                            userSubProfileId: nextId++,
                            userId,
                            subProfileId: sid,
                        }));
                        await collection.insertMany(docs);
                    }
                    return res.status(200).json({
                        message: "Merged assignments for user (existing kept)",
                        userId,
                        addedSubProfileIds: toAdd,
                        alreadyAssigned: subProfileIds.filter((sid) => existingSet.has(sid)),
                        inserted: toAdd.length,
                        mode: "user-to-subprofiles",
                        status: true,
                    });
                }
                if (hasSubProfileToUsers && subProfileId !== null) {
                    const existing = await collection
                        .find({ subProfileId }, { projection: { _id: 0, userId: 1 } })
                        .toArray();
                    const existingSet = new Set(existing.map((doc) => doc.userId));
                    const toAdd = userIds.filter((uid) => !existingSet.has(uid));
                    if (toAdd.length) {
                        let nextId = await this.nextId(collection);
                        const docs = toAdd.map((uid) => ({
                            userSubProfileId: nextId++,
                            subProfileId,
                            userId: uid,
                        }));
                        await collection.insertMany(docs);
                    }
                    return res.status(200).json({
                        message: "Merged assignments for subProfile (existing kept)",
                        subProfileId,
                        addedUserIds: toAdd,
                        alreadyAssigned: userIds.filter((uid) => existingSet.has(uid)),
                        inserted: toAdd.length,
                        mode: "subprofile-to-users",
                        status: true,
                    });
                }
                return res.status(400).json({
                    message: "Unable to determine assignment mode",
                    status: false,
                });
            }
            catch (error) {
                console.error("assignUserSubProfiles error", error);
                return res.status(500).json({ message: "Failed to update assignments", error, status: false });
            }
        };
        this.unassignUserSubProfiles = async (req, res) => {
            const body = req.body || {};
            const userId = toNumber(body.userId);
            const subProfileIds = this.parseIdArray(body.subProfileIds);
            const subProfileId = toNumber(body.subProfileId);
            const userIds = this.parseIdArray(body.userIds ?? body.ueserIds);
            const hasUserToSubProfiles = userId !== null && Array.isArray(body.subProfileIds);
            const hasSubProfileToUsers = subProfileId !== null && Array.isArray(body.userIds ?? body.ueserIds);
            if (!hasUserToSubProfiles && !hasSubProfileToUsers) {
                return res.status(400).json({
                    message: "Provide either { userId, subProfileIds[] } or { subProfileId, userIds[] }",
                    status: false,
                });
            }
            try {
                const collection = await this.collection();
                if (hasUserToSubProfiles && userId !== null) {
                    if (!subProfileIds.length) {
                        return res.status(200).json({
                            message: "Nothing to unassign (no subProfileIds provided)",
                            userId,
                            removedCount: 0,
                            removedSubProfileIds: [],
                            mode: "user-to-subprofiles",
                            status: true,
                        });
                    }
                    const result = await collection.deleteMany({ userId, subProfileId: { $in: subProfileIds } });
                    return res.status(200).json({
                        message: "Unassigned selected sub-profiles from user",
                        userId,
                        removedSubProfileIds: subProfileIds,
                        removedCount: result.deletedCount ?? 0,
                        mode: "user-to-subprofiles",
                        status: true,
                    });
                }
                if (hasSubProfileToUsers && subProfileId !== null) {
                    if (!userIds.length) {
                        return res.status(200).json({
                            message: "Nothing to unassign (no userIds provided)",
                            subProfileId,
                            removedCount: 0,
                            removedUserIds: [],
                            mode: "subprofile-to-users",
                            status: true,
                        });
                    }
                    const result = await collection.deleteMany({ subProfileId, userId: { $in: userIds } });
                    return res.status(200).json({
                        message: "Unassigned selected users from sub-profile",
                        subProfileId,
                        removedUserIds: userIds,
                        removedCount: result.deletedCount ?? 0,
                        mode: "subprofile-to-users",
                        status: true,
                    });
                }
                return res.status(400).json({
                    message: "Unable to determine unassignment mode",
                    status: false,
                });
            }
            catch (error) {
                console.error("unassignUserSubProfiles error", error);
                return res.status(500).json({ message: "Failed to unassign", error, status: false });
            }
        };
        this.getUserSubProfiles = async (req, res) => {
            const userId = toNumber(req.params?.userId);
            if (userId === null) {
                return res.status(400).json({ message: "Invalid userId", status: false });
            }
            try {
                const collection = await this.collection();
                const rows = await collection
                    .find({ userId }, { projection: { _id: 0, subProfileId: 1 } })
                    .sort({ subProfileId: 1 })
                    .toArray();
                const subProfileIds = rows.map((row) => row.subProfileId);
                return res.status(200).json({ userId, subProfileIds, count: subProfileIds.length, status: true });
            }
            catch (error) {
                console.error("getUserSubProfiles error", error);
                return res.status(500).json({ message: "Failed to fetch user sub-profiles", error, status: false });
            }
        };
        this.getUsersBySubProfileId = async (req, res) => {
            const subProfileId = toNumber(req.params?.subProfileId);
            if (subProfileId === null) {
                return res.status(400).json({ message: "Invalid subProfileId", status: false });
            }
            try {
                const collection = await this.collection();
                const rows = await collection
                    .find({ subProfileId }, { projection: { _id: 0, userId: 1 } })
                    .toArray();
                const userIds = rows.map((row) => row.userId);
                if (!userIds.length) {
                    return res.status(200).json({ subProfileId, users: [], count: 0, status: true });
                }
                const usersCollection = await this.usersCollection();
                const users = await usersCollection
                    .find({ userId: { $in: userIds } }, {
                    projection: {
                        _id: 0,
                        userId: 1,
                        userFirstName: 1,
                        userLastName: 1,
                    },
                })
                    .sort({ userFirstName: 1, userLastName: 1 })
                    .toArray();
                return res.status(200).json({ subProfileId, users, count: users.length, status: true });
            }
            catch (error) {
                console.error("getUsersBySubProfileId error", error);
                return res.status(500).json({ message: "Failed to fetch users by subProfileId", error, status: false });
            }
        };
    }
    async collection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("UserSubProfileTypes");
    }
    async usersCollection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("Users");
    }
    async nextId(collection) {
        const target = collection ?? (await this.collection());
        const doc = await target
            .find({}, { projection: { userSubProfileId: 1 } })
            .sort({ userSubProfileId: -1 })
            .limit(1)
            .next();
        return (doc?.userSubProfileId ?? 0) + 1;
    }
    parseIdArray(input) {
        if (!Array.isArray(input))
            return [];
        const values = input
            .map((value) => toNumber(value))
            .filter((value) => value !== null);
        return Array.from(new Set(values));
    }
}
exports.AdminUserSubProfileTypesController = AdminUserSubProfileTypesController;
exports.default = AdminUserSubProfileTypesController;
