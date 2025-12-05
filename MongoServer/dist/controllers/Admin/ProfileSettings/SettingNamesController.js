"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUserSettingsTypesController = void 0;
const mongo_1 = require("../../../config/mongo");
const normalizeName = (value) => {
    if (typeof value === "string")
        return value.trim();
    return "";
};
const toNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim().length) {
        const parsed = Number(value.trim());
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};
class AdminUserSettingsTypesController {
    constructor() {
        this.addUserSettingsType = async (req, res) => {
            try {
                const name = normalizeName(req.body?.Name ?? req.body?.name);
                if (!name) {
                    return res.status(400).json({ message: "Name is required", status: false });
                }
                const collection = await this.collection();
                const Id = await this.nextId(collection);
                await collection.insertOne({ Id, Name: name });
                return res.status(201).json({
                    message: "UserSettingsType added successfully",
                    id: Id,
                    status: true,
                });
            }
            catch (error) {
                console.error("addUserSettingsType error", error);
                return res.status(500).json({ message: "Error adding UserSettingsType", error, status: false });
            }
        };
        this.editUserSettingsType = async (req, res) => {
            try {
                const id = toNumber(req.params?.id);
                if (id === null) {
                    return res.status(400).json({ message: "Invalid id", status: false });
                }
                const name = req.body?.Name ?? req.body?.name;
                if (name !== undefined && !normalizeName(name)) {
                    return res.status(400).json({ message: "Name must be a non-empty string", status: false });
                }
                if (name === undefined) {
                    return res.status(400).json({ message: "No valid fields to update", status: false });
                }
                const collection = await this.collection();
                const result = await collection.updateOne({ Id: id }, { $set: { Name: normalizeName(name) } });
                if (!result.matchedCount) {
                    return res.status(404).json({ message: "UserSettingsType not found", status: false });
                }
                return res.status(200).json({ message: "UserSettingsType updated successfully", status: true });
            }
            catch (error) {
                console.error("editUserSettingsType error", error);
                return res.status(500).json({ message: "Error updating UserSettingsType", error, status: false });
            }
        };
        this.deleteUserSettingsType = async (req, res) => {
            try {
                const id = toNumber(req.params?.id);
                if (id === null) {
                    return res.status(400).json({ message: "Invalid id", status: false });
                }
                const collection = await this.collection();
                const result = await collection.deleteOne({ Id: id });
                if (!result.deletedCount) {
                    return res.status(404).json({ message: "UserSettingsType not found", status: false });
                }
                return res.status(200).json({ message: "UserSettingsType deleted successfully", status: true });
            }
            catch (error) {
                console.error("deleteUserSettingsType error", error);
                return res.status(500).json({ message: "Error deleting UserSettingsType", error, status: false });
            }
        };
        this.getAllUserSettingsTypes = async (_req, res) => {
            try {
                const collection = await this.collection();
                const rows = await collection.find({}, { projection: { _id: 0 } }).sort({ Id: 1 }).toArray();
                return res.status(200).json(rows);
            }
            catch (error) {
                console.error("getAllUserSettingsTypes error", error);
                return res.status(500).json({ message: "Error fetching UserSettingsTypes", error, status: false });
            }
        };
        this.getSingleUserSettingsType = async (req, res) => {
            try {
                const id = toNumber(req.params?.id);
                if (id === null) {
                    return res.status(400).json({ message: "Invalid id", status: false });
                }
                const collection = await this.collection();
                const row = await collection.findOne({ Id: id }, { projection: { _id: 0 } });
                if (!row) {
                    return res.status(404).json({ message: "UserSettingsType not found", status: false });
                }
                return res.status(200).json(row);
            }
            catch (error) {
                console.error("getSingleUserSettingsType error", error);
                return res.status(500).json({ message: "Error fetching UserSettingsType", error, status: false });
            }
        };
    }
    async collection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("UserSettingsTypes");
    }
    async nextId(collection) {
        const target = collection ?? (await this.collection());
        const doc = await target.find({}, { projection: { Id: 1 } }).sort({ Id: -1 }).limit(1).next();
        return (doc?.Id ?? 0) + 1;
    }
}
exports.AdminUserSettingsTypesController = AdminUserSettingsTypesController;
