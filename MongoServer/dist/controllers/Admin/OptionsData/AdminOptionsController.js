"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOptionsController = exports.AdminOptionsController = void 0;
const mongo_1 = require("../../../config/mongo");
const toNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value.trim());
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};
const nextId = async (collection, field) => {
    const doc = await collection.find({}, { projection: { [field]: 1 } }).sort({ [field]: -1 }).limit(1).next();
    return (doc?.[field] ?? 0) + 1;
};
class AdminOptionsController {
    constructor() {
        this.createOption = async (req, res) => {
            try {
                const optionName = typeof req.body?.optionName === "string" ? req.body.optionName : "";
                if (!optionName) {
                    return res.status(400).json({ success: false, message: "optionName is required" });
                }
                const options = req.body?.options;
                const collection = await this.optionsCollection();
                const optionId = await nextId(collection, "optionId");
                await collection.insertOne({
                    optionId,
                    optionName,
                    options: typeof options === "string" ? options : JSON.stringify(options ?? {}),
                });
                return res.status(201).json({ success: true, optionId });
            }
            catch (error) {
                console.error("createOption error", error);
                return res.status(500).json({ success: false, message: "Failed to create option" });
            }
        };
        this.getOptions = async (_req, res) => {
            try {
                const collection = await this.optionsCollection();
                const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
                return res.json({ success: true, data: docs });
            }
            catch (error) {
                console.error("getOptions error", error);
                return res.status(500).json({ success: false, message: "Failed to fetch options" });
            }
        };
        this.deleteOption = async (req, res) => {
            try {
                const optionId = toNumber(req.params?.optionId);
                if (optionId === null) {
                    return res.status(400).json({ success: false, message: "optionId is required" });
                }
                const collection = await this.optionsCollection();
                const result = await collection.deleteOne({ optionId });
                return res.json({ success: true, deletedCount: result.deletedCount ?? 0 });
            }
            catch (error) {
                console.error("deleteOption error", error);
                return res.status(500).json({ success: false, message: "Failed to delete option" });
            }
        };
        this.updateOption = async (req, res) => {
            try {
                const optionId = toNumber(req.params?.optionId);
                if (optionId === null) {
                    return res.status(400).json({ success: false, message: "optionId is required" });
                }
                const updates = {};
                if (typeof req.body?.optionName === "string")
                    updates.optionName = req.body.optionName;
                if (req.body?.options !== undefined) {
                    updates.options = typeof req.body.options === "string" ? req.body.options : JSON.stringify(req.body.options);
                }
                const collection = await this.optionsCollection();
                const result = await collection.updateOne({ optionId }, { $set: updates });
                return res.json({ success: true, modifiedCount: result.modifiedCount ?? 0 });
            }
            catch (error) {
                console.error("updateOption error", error);
                return res.status(500).json({ success: false, message: "Failed to update option" });
            }
        };
        this.getOptionDataByLabelName = async (req, res) => {
            try {
                const optionName = req.params?.optionName;
                if (!optionName) {
                    return res.status(400).json({ success: false, message: "optionName is required" });
                }
                const collection = await this.optionsCollection();
                const doc = await collection.findOne({ optionName }, { projection: { _id: 0 } });
                if (!doc) {
                    return res.status(404).json({ success: false, message: "Option not found" });
                }
                return res.json({ success: true, data: doc });
            }
            catch (error) {
                console.error("getOptionDataByLabelName error", error);
                return res.status(500).json({ success: false, message: "Failed to fetch option" });
            }
        };
        this.getOptionsByID = async (req, res) => {
            try {
                const optionId = toNumber(req.params?.optionId);
                if (optionId === null) {
                    return res.status(400).json({ success: false, message: "optionId is required" });
                }
                const collection = await this.optionsCollection();
                const doc = await collection.findOne({ optionId }, { projection: { _id: 0 } });
                if (!doc) {
                    return res.status(404).json({ success: false, message: "Option not found" });
                }
                return res.json({ success: true, data: doc });
            }
            catch (error) {
                console.error("getOptionsByID error", error);
                return res.status(500).json({ success: false, message: "Failed to fetch option" });
            }
        };
        this.getOptionsDataByValueLabel = async (_req, res) => {
            try {
                const collection = await this.optionsCollection();
                const docs = await collection.find({}, { projection: { optionId: 1, optionName: 1 } }).toArray();
                return res.json({ success: true, data: docs });
            }
            catch (error) {
                console.error("getOptionsDataByValueLabel error", error);
                return res.status(500).json({ success: false, message: "Failed to fetch options" });
            }
        };
        this.getValueLabelsByEntityId = async (_req, res) => {
            return res.json({ success: true, data: [] });
        };
        this.createStructureOptionValue = async (req, res) => {
            try {
                const collection = await this.structureOptionsCollection();
                const doc = {
                    id: await nextId(collection, "id"),
                    entityId: toNumber(req.body?.entityId) ?? 0,
                    optionId: toNumber(req.body?.optionId) ?? 0,
                    selectedOptionId: toNumber(req.body?.selectedOptionId) ?? 0,
                    valueLabel: req.body?.valueLabel ?? "",
                    notes: req.body?.notes,
                };
                await collection.insertOne(doc);
                return res.status(201).json({ success: true, id: doc.id });
            }
            catch (error) {
                console.error("createStructureOptionValue error", error);
                return res.status(500).json({ success: false, message: "Failed to create structure option value" });
            }
        };
        this.updateStructureOptionValue = async (req, res) => {
            try {
                const id = toNumber(req.params?.id);
                if (id === null) {
                    return res.status(400).json({ success: false, message: "id is required" });
                }
                const collection = await this.structureOptionsCollection();
                const updates = {};
                ["entityId", "optionId", "selectedOptionId"].forEach((field) => {
                    const value = toNumber((req.body ?? {})[field]);
                    if (value !== null)
                        updates[field] = value;
                });
                if (typeof req.body?.valueLabel === "string")
                    updates.valueLabel = req.body.valueLabel;
                if (typeof req.body?.notes === "string")
                    updates.notes = req.body.notes;
                const result = await collection.updateOne({ id }, { $set: updates });
                return res.json({ success: true, modifiedCount: result.modifiedCount ?? 0 });
            }
            catch (error) {
                console.error("updateStructureOptionValue error", error);
                return res.status(500).json({ success: false, message: "Failed to update structure option value" });
            }
        };
        this.deleteStructureOptionValue = async (req, res) => {
            try {
                const id = toNumber(req.params?.id);
                if (id === null) {
                    return res.status(400).json({ success: false, message: "id is required" });
                }
                const collection = await this.structureOptionsCollection();
                const result = await collection.deleteOne({ id });
                return res.json({ success: true, deletedCount: result.deletedCount ?? 0 });
            }
            catch (error) {
                console.error("deleteStructureOptionValue error", error);
                return res.status(500).json({ success: false, message: "Failed to delete structure option value" });
            }
        };
        this.getAllStructureOptionValues = async (_req, res) => {
            try {
                const collection = await this.structureOptionsCollection();
                const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
                return res.json({ success: true, data: docs });
            }
            catch (error) {
                console.error("getAllStructureOptionValues error", error);
                return res.status(500).json({ success: false, message: "Failed to fetch structure option values" });
            }
        };
        this.getStructureOptionValueById = async (req, res) => {
            try {
                const id = toNumber(req.params?.id);
                if (id === null) {
                    return res.status(400).json({ success: false, message: "id is required" });
                }
                const collection = await this.structureOptionsCollection();
                const doc = await collection.findOne({ id }, { projection: { _id: 0 } });
                if (!doc) {
                    return res.status(404).json({ success: false, message: "Structure option value not found" });
                }
                return res.json({ success: true, data: doc });
            }
            catch (error) {
                console.error("getStructureOptionValueById error", error);
                return res.status(500).json({ success: false, message: "Failed to fetch structure option value" });
            }
        };
    }
    async optionsCollection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("OptionsData");
    }
    async structureOptionsCollection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("StructureOptionValues");
    }
}
exports.AdminOptionsController = AdminOptionsController;
exports.adminOptionsController = new AdminOptionsController();
