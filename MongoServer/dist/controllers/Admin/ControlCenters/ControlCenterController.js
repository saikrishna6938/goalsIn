"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlCenterController = void 0;
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
const nextId = async (collection) => {
    const doc = await collection.find({}, { projection: { controlCenterId: 1 } }).sort({ controlCenterId: -1 }).limit(1).next();
    return (doc?.controlCenterId ?? 0) + 1;
};
class ControlCenterController {
    constructor() {
        this.create = async (req, res) => {
            try {
                const collection = await this.collection();
                const controlCenterId = await nextId(collection);
                const doc = {
                    controlCenterId,
                    name: req.body?.name ?? `Control Center ${controlCenterId}`,
                    description: req.body?.description,
                    jsonObject: typeof req.body?.jsonObject === "string" ? req.body.jsonObject : JSON.stringify(req.body?.jsonObject ?? {}),
                    created: new Date(),
                    updated: new Date(),
                };
                await collection.insertOne(doc);
                return res.status(201).json({ message: "Control center created", controlCenterId });
            }
            catch (error) {
                console.error("create control center error", error);
                return res.status(500).json({ message: "Failed to create control center" });
            }
        };
        this.update = async (req, res) => {
            try {
                const controlCenterId = toNumber(req.body?.controlCenterId);
                if (controlCenterId === null) {
                    return res.status(400).json({ message: "controlCenterId is required" });
                }
                const updates = {};
                if (typeof req.body?.name === "string")
                    updates.name = req.body.name;
                if (typeof req.body?.description === "string")
                    updates.description = req.body.description;
                if (req.body?.jsonObject !== undefined) {
                    updates.jsonObject =
                        typeof req.body.jsonObject === "string" ? req.body.jsonObject : JSON.stringify(req.body.jsonObject);
                }
                updates.updated = new Date();
                const collection = await this.collection();
                const result = await collection.updateOne({ controlCenterId }, { $set: updates });
                if (!result.matchedCount) {
                    return res.status(404).json({ message: "Control center not found" });
                }
                return res.json({ message: "Control center updated" });
            }
            catch (error) {
                console.error("update control center error", error);
                return res.status(500).json({ message: "Failed to update control center" });
            }
        };
        this.delete = async (req, res) => {
            try {
                const controlCenterId = toNumber(req.body?.controlCenterId);
                if (controlCenterId === null) {
                    return res.status(400).json({ message: "controlCenterId is required" });
                }
                const collection = await this.collection();
                const result = await collection.deleteOne({ controlCenterId });
                if (!result.deletedCount) {
                    return res.status(404).json({ message: "Control center not found" });
                }
                return res.json({ message: "Control center deleted" });
            }
            catch (error) {
                console.error("delete control center error", error);
                return res.status(500).json({ message: "Failed to delete control center" });
            }
        };
        this.getAll = async (_req, res) => {
            try {
                const collection = await this.collection();
                const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
                return res.json(docs);
            }
            catch (error) {
                console.error("getAll control centers error", error);
                return res.status(500).json({ message: "Failed to fetch control centers" });
            }
        };
        this.getById = async (req, res) => {
            try {
                const controlCenterId = toNumber(req.params?.controlCenterId);
                if (controlCenterId === null) {
                    return res.status(400).json({ message: "controlCenterId is required" });
                }
                const collection = await this.collection();
                const doc = await collection.findOne({ controlCenterId }, { projection: { _id: 0 } });
                if (!doc) {
                    return res.status(404).json({ message: "Control center not found" });
                }
                return res.json(doc);
            }
            catch (error) {
                console.error("getById control center error", error);
                return res.status(500).json({ message: "Failed to fetch control center" });
            }
        };
    }
    async collection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("ControlCenters");
    }
}
exports.ControlCenterController = ControlCenterController;
