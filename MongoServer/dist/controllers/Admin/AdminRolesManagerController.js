"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRolesController = void 0;
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
class AdminRolesManagerController {
    constructor() {
        this.getSuperRoleTypes = async (_req, res) => {
            try {
                const collection = await this.collection();
                const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
                return res.json({ success: true, data: docs });
            }
            catch (error) {
                console.error("getSuperRoleTypes error", error);
                return res.status(500).json({ success: false, message: "An error occurred while fetching role types" });
            }
        };
        this.insertSuperRoleType = async (req, res) => {
            try {
                const roleTypeName = typeof req.body?.roleTypeName === "string" ? req.body.roleTypeName.trim() : "";
                if (!roleTypeName) {
                    return res.status(400).json({ success: false, message: "roleTypeName is required" });
                }
                const collection = await this.collection();
                const roleTypeId = await this.nextId();
                await collection.insertOne({
                    roleTypeId,
                    roleTypeName,
                    roleTypeDescription: typeof req.body?.roleTypeDescription === "string" ? req.body.roleTypeDescription : "",
                    updatedDate: new Date(),
                });
                return res.status(201).json({ success: true, message: "Role type inserted successfully" });
            }
            catch (error) {
                console.error("insertSuperRoleType error", error);
                return res.status(500).json({ success: false, message: "An error occurred while inserting role type" });
            }
        };
        this.updateSuperRoleType = async (req, res) => {
            try {
                const roleTypeId = toNumber(req.body?.roleTypeId);
                if (roleTypeId === null) {
                    return res.status(400).json({ success: false, message: "roleTypeId is required" });
                }
                const updates = {};
                if (typeof req.body?.roleTypeName === "string")
                    updates.roleTypeName = req.body.roleTypeName;
                if (typeof req.body?.roleTypeDescription === "string")
                    updates.roleTypeDescription = req.body.roleTypeDescription;
                if (!Object.keys(updates).length) {
                    return res.status(400).json({ success: false, message: "No fields to update" });
                }
                updates.updatedDate = new Date();
                const collection = await this.collection();
                const result = await collection.updateOne({ roleTypeId }, { $set: updates });
                if (!result.matchedCount) {
                    return res.status(404).json({ success: false, message: "Role type not found" });
                }
                return res.json({ success: true, message: "Role type updated successfully" });
            }
            catch (error) {
                console.error("updateSuperRoleType error", error);
                return res.status(500).json({ success: false, message: "An error occurred while updating role type" });
            }
        };
        this.deleteSuperRoleType = async (req, res) => {
            try {
                const roleTypeId = toNumber(req.params?.roleTypeId);
                if (roleTypeId === null) {
                    return res.status(400).json({ success: false, message: "roleTypeId is required" });
                }
                const collection = await this.collection();
                const result = await collection.deleteOne({ roleTypeId });
                if (!result.deletedCount) {
                    return res.status(404).json({ success: false, message: "Role type not found" });
                }
                return res.json({ success: true, message: "Role type deleted successfully" });
            }
            catch (error) {
                console.error("deleteSuperRoleType error", error);
                return res.status(500).json({ success: false, message: "An error occurred while deleting role type" });
            }
        };
    }
    async collection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("SuperRoleTypes");
    }
    async nextId() {
        const collection = await this.collection();
        const doc = await collection.find({}, { projection: { roleTypeId: 1 } }).sort({ roleTypeId: -1 }).limit(1).next();
        return (doc?.roleTypeId ?? 0) + 1;
    }
}
exports.adminRolesController = new AdminRolesManagerController();
