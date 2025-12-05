"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateActionsController = void 0;
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
    const doc = await collection.find({}, { projection: { actionId: 1 } }).sort({ actionId: -1 }).limit(1).next();
    return (doc?.actionId ?? 0) + 1;
};
class StateActionsController {
    constructor() {
        this.getActionsByDocumentState = async (req, res) => {
            try {
                const documentStateId = toNumber(req.params?.documentStateId);
                if (documentStateId === null) {
                    return res.status(400).json({ message: "documentStateId is required" });
                }
                const collection = await this.collection();
                const docs = await collection.find({ documentStateId }, { projection: { _id: 0 } }).toArray();
                return res.json(docs);
            }
            catch (error) {
                console.error("getActionsByDocumentState error", error);
                return res.status(500).json({ message: "Failed to fetch actions" });
            }
        };
        this.addAction = async (req, res) => {
            try {
                const documentStateId = toNumber(req.body?.documentStateId);
                if (documentStateId === null) {
                    return res.status(400).json({ message: "documentStateId is required" });
                }
                const collection = await this.collection();
                const actionId = await nextId(collection);
                const doc = {
                    actionId,
                    documentStateId,
                    actionName: req.body?.actionName ?? `Action ${actionId}`,
                    actionDescription: req.body?.actionDescription,
                    optionId: toNumber(req.body?.optionId) ?? 0,
                };
                await collection.insertOne(doc);
                return res.status(201).json({ message: "Action added", actionId });
            }
            catch (error) {
                console.error("addAction error", error);
                return res.status(500).json({ message: "Failed to add action" });
            }
        };
        this.updateAction = async (req, res) => {
            try {
                const actionId = toNumber(req.body?.actionId);
                if (actionId === null) {
                    return res.status(400).json({ message: "actionId is required" });
                }
                const updates = {};
                Object.entries(req.body ?? {}).forEach(([key, value]) => {
                    if (value !== undefined)
                        updates[key] = value;
                });
                if (!Object.keys(updates).length) {
                    return res.status(400).json({ message: "No fields to update" });
                }
                const collection = await this.collection();
                const result = await collection.updateOne({ actionId }, { $set: updates });
                if (!result.matchedCount) {
                    return res.status(404).json({ message: "Action not found" });
                }
                return res.json({ message: "Action updated" });
            }
            catch (error) {
                console.error("updateAction error", error);
                return res.status(500).json({ message: "Failed to update action" });
            }
        };
        this.deleteAction = async (req, res) => {
            try {
                const actionId = toNumber(req.body?.actionId);
                if (actionId === null) {
                    return res.status(400).json({ message: "actionId is required" });
                }
                const collection = await this.collection();
                const result = await collection.deleteOne({ actionId });
                if (!result.deletedCount) {
                    return res.status(404).json({ message: "Action not found" });
                }
                return res.json({ message: "Action deleted" });
            }
            catch (error) {
                console.error("deleteAction error", error);
                return res.status(500).json({ message: "Failed to delete action" });
            }
        };
    }
    async collection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("Actions");
    }
}
exports.StateActionsController = StateActionsController;
