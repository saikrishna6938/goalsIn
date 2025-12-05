"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUserRolesController = void 0;
const mongo_1 = require("../../config/mongo");
const toNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value.trim());
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};
class AdminUserRolesController {
    constructor() {
        this.getSuperUserRoles = async (_req, res) => {
            try {
                const collection = await this.collection();
                const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
                return res.json({ success: true, data: docs });
            }
            catch (error) {
                console.error("getSuperUserRoles error", error);
                return res.status(500).json({ success: false, message: "An error occurred while fetching user roles" });
            }
        };
        this.insertSuperUserRole = async (req, res) => {
            try {
                const userId = toNumber(req.body?.userId);
                const userRoleNameId = toNumber(req.body?.userRoleNameId);
                if (userId === null || userRoleNameId === null) {
                    return res.status(400).json({ success: false, message: "userId and userRoleNameId are required" });
                }
                const collection = await this.collection();
                await collection.insertOne({
                    superUserRoleId: await this.nextId(),
                    userId,
                    userRoleNameId,
                    updatedDate: new Date(),
                });
                return res.status(201).json({ success: true, message: "User role inserted successfully" });
            }
            catch (error) {
                console.error("insertSuperUserRole error", error);
                return res.status(500).json({ success: false, message: "An error occurred while inserting user role" });
            }
        };
        this.updateSuperUserRole = async (req, res) => {
            try {
                const superUserRoleId = toNumber(req.body?.superUserRoleId);
                if (superUserRoleId === null) {
                    return res.status(400).json({ success: false, message: "superUserRoleId is required" });
                }
                const updates = {};
                const userId = toNumber(req.body?.userId);
                const userRoleNameId = toNumber(req.body?.userRoleNameId);
                if (userId !== null)
                    updates.userId = userId;
                if (userRoleNameId !== null)
                    updates.userRoleNameId = userRoleNameId;
                if (!Object.keys(updates).length) {
                    return res.status(400).json({ success: false, message: "No fields to update" });
                }
                updates.updatedDate = new Date();
                const collection = await this.collection();
                const result = await collection.updateOne({ superUserRoleId }, { $set: updates });
                if (!result.matchedCount) {
                    return res.status(404).json({ success: false, message: "User role not found" });
                }
                return res.json({ success: true, message: "User role updated successfully" });
            }
            catch (error) {
                console.error("updateSuperUserRole error", error);
                return res.status(500).json({ success: false, message: "An error occurred while updating user role" });
            }
        };
        this.insertMultipleSuperUserRoles = async (req, res) => {
            try {
                const roles = Array.isArray(req.body?.roles)
                    ? req.body.roles
                    : [];
                if (!roles.length) {
                    return res.status(400).json({ success: false, message: "roles array is required" });
                }
                const collection = await this.collection();
                const docs = [];
                for (const role of roles) {
                    const userId = toNumber(role.userId);
                    const userRoleNameId = toNumber(role.userRoleNameId);
                    if (userId === null || userRoleNameId === null)
                        continue;
                    docs.push({
                        superUserRoleId: await this.nextId(),
                        userId,
                        userRoleNameId,
                        updatedDate: new Date(),
                    });
                }
                if (!docs.length) {
                    return res.status(400).json({ success: false, message: "No valid roles provided" });
                }
                await collection.insertMany(docs);
                return res.status(201).json({ success: true, message: "User roles inserted successfully" });
            }
            catch (error) {
                console.error("insertMultipleSuperUserRoles error", error);
                return res.status(500).json({ success: false, message: "An error occurred while inserting user roles" });
            }
        };
        this.updateMultipleSuperUserRoles = async (req, res) => {
            try {
                const updates = Array.isArray(req.body?.roles)
                    ? req.body.roles
                    : [];
                if (!updates.length) {
                    return res.status(400).json({ success: false, message: "roles array is required" });
                }
                const collection = await this.collection();
                for (const item of updates) {
                    const superUserRoleId = toNumber(item.superUserRoleId);
                    const userRoleNameId = toNumber(item.userRoleNameId);
                    if (superUserRoleId === null || userRoleNameId === null)
                        continue;
                    await collection.updateOne({ superUserRoleId }, { $set: { userRoleNameId, updatedDate: new Date() } });
                }
                return res.json({ success: true, message: "User roles updated successfully" });
            }
            catch (error) {
                console.error("updateMultipleSuperUserRoles error", error);
                return res.status(500).json({ success: false, message: "An error occurred while updating user roles" });
            }
        };
        this.getSuperUserRolesByUserId = async (req, res) => {
            try {
                const userId = toNumber(req.params?.userId);
                if (userId === null) {
                    return res.status(400).json({ success: false, message: "userId is required" });
                }
                const collection = await this.collection();
                const docs = await collection.find({ userId }, { projection: { _id: 0 } }).toArray();
                return res.json({ success: true, data: docs });
            }
            catch (error) {
                console.error("getSuperUserRolesByUserId error", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
        };
    }
    async collection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("SuperUserRoles");
    }
    async nextId() {
        const collection = await this.collection();
        const doc = await collection.find({}, { projection: { superUserRoleId: 1 } }).sort({ superUserRoleId: -1 }).limit(1).next();
        return (doc?.superUserRoleId ?? 0) + 1;
    }
}
exports.adminUserRolesController = new AdminUserRolesController();
