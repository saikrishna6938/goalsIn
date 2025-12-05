"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoleNamesController = void 0;
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
class AdminRoleNamesController {
    constructor() {
        this.getSuperRoleNames = async (_req, res) => {
            try {
                const collection = await this.collection();
                const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
                return res.json({ success: true, data: docs });
            }
            catch (error) {
                console.error("getSuperRoleNames error", error);
                return res.status(500).json({ success: false, message: "An error occurred while fetching role names" });
            }
        };
        this.insertSuperRoleName = async (req, res) => {
            try {
                const roleTypeId = toNumber(req.body?.roleTypeId);
                const roleName = typeof req.body?.roleName === "string" ? req.body.roleName.trim() : "";
                if (roleTypeId === null || !roleName) {
                    return res.status(400).json({ success: false, message: "roleTypeId and roleName are required" });
                }
                const collection = await this.collection();
                await collection.insertOne({
                    roleNameId: await this.nextId(),
                    roleTypeId,
                    roleName,
                    roleNameDescription: typeof req.body?.roleNameDescription === "string" ? req.body.roleNameDescription : "",
                });
                return res.status(201).json({ success: true, message: "Role name inserted successfully" });
            }
            catch (error) {
                console.error("insertSuperRoleName error", error);
                return res.status(500).json({ success: false, message: "An error occurred while inserting role name" });
            }
        };
        this.updateSuperRoleName = async (req, res) => {
            try {
                const roleNameId = toNumber(req.body?.roleNameId);
                if (roleNameId === null) {
                    return res.status(400).json({ success: false, message: "roleNameId is required" });
                }
                const updates = {};
                const roleTypeId = toNumber(req.body?.roleTypeId);
                if (roleTypeId !== null)
                    updates.roleTypeId = roleTypeId;
                if (typeof req.body?.roleName === "string")
                    updates.roleName = req.body.roleName;
                if (typeof req.body?.roleNameDescription === "string")
                    updates.roleNameDescription = req.body.roleNameDescription;
                if (!Object.keys(updates).length) {
                    return res.status(400).json({ success: false, message: "No fields to update" });
                }
                const collection = await this.collection();
                const result = await collection.updateOne({ roleNameId }, { $set: updates });
                if (!result.matchedCount) {
                    return res.status(404).json({ success: false, message: "Role name not found" });
                }
                return res.json({ success: true, message: "Role name updated successfully" });
            }
            catch (error) {
                console.error("updateSuperRoleName error", error);
                return res.status(500).json({ success: false, message: "An error occurred while updating role name" });
            }
        };
        this.deleteSuperRoleName = async (req, res) => {
            try {
                const roleNameId = toNumber(req.params?.roleNameId);
                if (roleNameId === null) {
                    return res.status(400).json({ success: false, message: "roleNameId is required" });
                }
                const collection = await this.collection();
                const result = await collection.deleteOne({ roleNameId });
                if (!result.deletedCount) {
                    return res.status(404).json({ success: false, message: "Role name not found" });
                }
                return res.json({ success: true, message: "Role name deleted successfully" });
            }
            catch (error) {
                console.error("deleteSuperRoleName error", error);
                return res.status(500).json({ success: false, message: "An error occurred while deleting role name" });
            }
        };
    }
    async collection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("SuperRoleNames");
    }
    async nextId() {
        const collection = await this.collection();
        const doc = await collection.find({}, { projection: { roleNameId: 1 } }).sort({ roleNameId: -1 }).limit(1).next();
        return (doc?.roleNameId ?? 0) + 1;
    }
}
exports.adminRoleNamesController = new AdminRoleNamesController();
