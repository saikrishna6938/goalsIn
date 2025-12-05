"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSubProfileTypesController = void 0;
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
class AdminSubProfileTypesController {
    constructor() {
        this.addSubProfileType = async (req, res) => {
            try {
                const subProfileName = normalizeName(req.body?.subProfileName ?? req.body?.SubProfileName);
                if (!subProfileName) {
                    return res.status(400).json({ message: "subProfileName is required", status: false });
                }
                const collection = await this.subProfileCollection();
                const subProfileId = await this.nextId(collection);
                await collection.insertOne({ subProfileId, subProfileName });
                return res.status(201).json({
                    message: "SubProfileType added successfully",
                    id: subProfileId,
                    status: true,
                });
            }
            catch (error) {
                console.error("addSubProfileType error", error);
                return res.status(500).json({ message: "Error adding SubProfileType", error, status: false });
            }
        };
        this.editSubProfileType = async (req, res) => {
            try {
                const subProfileId = toNumber(req.params?.subProfileId);
                if (subProfileId === null) {
                    return res.status(400).json({ message: "Invalid subProfileId", status: false });
                }
                const subProfileName = req.body?.subProfileName ?? req.body?.SubProfileName;
                if (subProfileName === undefined) {
                    return res.status(400).json({ message: "No valid fields to update", status: false });
                }
                const normalized = normalizeName(subProfileName);
                if (!normalized) {
                    return res.status(400).json({ message: "subProfileName must be a non-empty string", status: false });
                }
                const collection = await this.subProfileCollection();
                const result = await collection.updateOne({ subProfileId }, { $set: { subProfileName: normalized } });
                if (!result.matchedCount) {
                    return res.status(404).json({ message: "SubProfileType not found", status: false });
                }
                return res.status(200).json({ message: "SubProfileType updated successfully", status: true });
            }
            catch (error) {
                console.error("editSubProfileType error", error);
                return res.status(500).json({ message: "Error updating SubProfileType", error, status: false });
            }
        };
        this.deleteSubProfileType = async (req, res) => {
            try {
                const subProfileId = toNumber(req.params?.subProfileId);
                if (subProfileId === null) {
                    return res.status(400).json({ message: "Invalid subProfileId", status: false });
                }
                const collection = await this.subProfileCollection();
                const result = await collection.deleteOne({ subProfileId });
                if (!result.deletedCount) {
                    return res.status(404).json({ message: "SubProfileType not found", status: false });
                }
                return res.status(200).json({ message: "SubProfileType deleted successfully", status: true });
            }
            catch (error) {
                console.error("deleteSubProfileType error", error);
                return res.status(500).json({ message: "Error deleting SubProfileType", error, status: false });
            }
        };
        this.getAllSubProfileTypes = async (_req, res) => {
            try {
                const collection = await this.subProfileCollection();
                const rows = await collection.find({}, { projection: { _id: 0 } }).sort({ subProfileId: 1 }).toArray();
                return res.status(200).json(rows);
            }
            catch (error) {
                console.error("getAllSubProfileTypes error", error);
                return res.status(500).json({ message: "Error fetching SubProfileTypes", error, status: false });
            }
        };
        this.getSingleSubProfileType = async (req, res) => {
            try {
                const subProfileId = toNumber(req.params?.subProfileId);
                if (subProfileId === null) {
                    return res.status(400).json({ message: "Invalid subProfileId", status: false });
                }
                const collection = await this.subProfileCollection();
                const row = await collection.findOne({ subProfileId }, { projection: { _id: 0 } });
                if (!row) {
                    return res.status(404).json({ message: "SubProfileType not found", status: false });
                }
                return res.status(200).json(row);
            }
            catch (error) {
                console.error("getSingleSubProfileType error", error);
                return res.status(500).json({ message: "Error fetching SubProfileType", error, status: false });
            }
        };
        this.getSettingNames = async (req, res) => {
            try {
                const subProfileId = toNumber(req.params?.subProfileId);
                if (subProfileId === null) {
                    return res.status(400).json({ message: "Invalid subProfileId", status: false });
                }
                const settingsCollection = await this.subProfileSettingsCollection();
                const settings = await settingsCollection
                    .find({ subProfileId }, { projection: { _id: 0, SettingId: 1 } })
                    .toArray();
                const settingIds = Array.from(new Set(settings
                    .map((doc) => doc.SettingId)
                    .filter((id) => typeof id === "number" && Number.isFinite(id))));
                if (!settingIds.length) {
                    return res.status(200).json({ subProfileId, names: [], count: 0, status: true });
                }
                const userSettingsCollection = await this.userSettingsCollection();
                const names = await userSettingsCollection
                    .find({ Id: { $in: settingIds } }, { projection: { _id: 0, Name: 1 } })
                    .sort({ Name: 1 })
                    .toArray();
                const cleanNames = names
                    .map((doc) => (typeof doc.Name === "string" ? doc.Name : ""))
                    .filter((name) => Boolean(name));
                return res
                    .status(200)
                    .json({ subProfileId, names: cleanNames, count: cleanNames.length, status: true });
            }
            catch (error) {
                console.error("getSettingNames error", error);
                return res.status(500).json({ message: "Error fetching setting names", error, status: false });
            }
        };
    }
    async subProfileCollection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("SubProfileTypes");
    }
    async subProfileSettingsCollection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("SubProfileSettings");
    }
    async userSettingsCollection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("UserSettingsTypes");
    }
    async nextId(collection) {
        const target = collection ?? (await this.subProfileCollection());
        const doc = await target.find({}, { projection: { subProfileId: 1 } }).sort({ subProfileId: -1 }).limit(1).next();
        return (doc?.subProfileId ?? 0) + 1;
    }
}
exports.AdminSubProfileTypesController = AdminSubProfileTypesController;
