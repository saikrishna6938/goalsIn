"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSubProfileSettingsController = void 0;
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
class AdminSubProfileSettingsController {
    constructor() {
        this.addSubProfileSetting = async (req, res) => {
            try {
                const payload = req.body || {};
                const SettingId = this.readNumericField("SettingId", payload);
                const subProfileId = this.readNumericField("subProfileId", payload);
                const dataTypeId = this.readNumericField("dataTypeId", payload);
                const value = this.readNumericField("value", payload);
                if ([SettingId, subProfileId, dataTypeId, value].some((val) => val === null)) {
                    return res.status(400).json({
                        message: "SettingId, subProfileId, dataTypeId, and value are required",
                        status: false,
                    });
                }
                const collection = await this.collection();
                const profileSettingsId = await this.nextId(collection);
                await collection.insertOne({
                    profileSettingsId,
                    SettingId: SettingId,
                    subProfileId: subProfileId,
                    dataTypeId: dataTypeId,
                    value: value,
                });
                return res.status(201).json({
                    message: "SubProfileSetting created successfully",
                    id: profileSettingsId,
                    status: true,
                });
            }
            catch (error) {
                console.error("addSubProfileSetting error", error);
                return res.status(500).json({ message: "Error creating SubProfileSetting", error, status: false });
            }
        };
        this.editSubProfileSetting = async (req, res) => {
            try {
                const profileSettingsId = toNumber(req.params?.profileSettingsId);
                if (profileSettingsId === null) {
                    return res.status(400).json({ message: "Invalid profileSettingsId", status: false });
                }
                const payload = req.body || {};
                const updates = {};
                ["SettingId", "subProfileId", "dataTypeId", "value"].forEach((field) => {
                    if (payload[field] !== undefined) {
                        const parsed = this.readNumericField(field, payload);
                        if (parsed === null) {
                            throw new Error(`${field} must be a number`);
                        }
                        updates[field] = parsed;
                    }
                });
                if (!Object.keys(updates).length) {
                    return res.status(400).json({ message: "No valid fields to update", status: false });
                }
                const collection = await this.collection();
                const result = await collection.updateOne({ profileSettingsId }, { $set: updates });
                if (!result.matchedCount) {
                    return res.status(404).json({ message: "SubProfileSetting not found", status: false });
                }
                return res.status(200).json({ message: "SubProfileSetting updated successfully", status: true });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Error updating SubProfileSetting";
                if (message.endsWith("must be a number")) {
                    return res.status(400).json({ message, status: false });
                }
                console.error("editSubProfileSetting error", error);
                return res.status(500).json({ message: "Error updating SubProfileSetting", error, status: false });
            }
        };
        this.deleteSubProfileSetting = async (req, res) => {
            try {
                const profileSettingsId = toNumber(req.params?.profileSettingsId);
                if (profileSettingsId === null) {
                    return res.status(400).json({ message: "Invalid profileSettingsId", status: false });
                }
                const collection = await this.collection();
                const result = await collection.deleteOne({ profileSettingsId });
                if (!result.deletedCount) {
                    return res.status(404).json({ message: "SubProfileSetting not found", status: false });
                }
                return res.status(200).json({ message: "SubProfileSetting deleted successfully", status: true });
            }
            catch (error) {
                console.error("deleteSubProfileSetting error", error);
                return res.status(500).json({ message: "Error deleting SubProfileSetting", error, status: false });
            }
        };
        this.getAllSubProfileSettings = async (_req, res) => {
            try {
                const collection = await this.collection();
                const rows = await collection.find({}, { projection: { _id: 0 } }).sort({ profileSettingsId: 1 }).toArray();
                return res.status(200).json(rows);
            }
            catch (error) {
                console.error("getAllSubProfileSettings error", error);
                return res.status(500).json({ message: "Error fetching SubProfileSettings", error, status: false });
            }
        };
        this.getSingleSubProfileSetting = async (req, res) => {
            try {
                const profileSettingsId = toNumber(req.params?.profileSettingsId);
                if (profileSettingsId === null) {
                    return res.status(400).json({ message: "Invalid profileSettingsId", status: false });
                }
                const collection = await this.collection();
                const row = await collection.findOne({ profileSettingsId }, { projection: { _id: 0 } });
                if (!row) {
                    return res.status(404).json({ message: "SubProfileSetting not found", status: false });
                }
                return res.status(200).json(row);
            }
            catch (error) {
                console.error("getSingleSubProfileSetting error", error);
                return res.status(500).json({ message: "Error fetching SubProfileSetting", error, status: false });
            }
        };
    }
    async collection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("SubProfileSettings");
    }
    async nextId(collection) {
        const target = collection ?? (await this.collection());
        const doc = await target
            .find({}, { projection: { profileSettingsId: 1 } })
            .sort({ profileSettingsId: -1 })
            .limit(1)
            .next();
        return (doc?.profileSettingsId ?? 0) + 1;
    }
    readNumericField(field, source) {
        const value = toNumber(source?.[field]);
        return value;
    }
}
exports.AdminSubProfileSettingsController = AdminSubProfileSettingsController;
