"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentStatesController = void 0;
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
    const doc = await collection.find({}, { projection: { documentStateId: 1 } }).sort({ documentStateId: -1 }).limit(1).next();
    return (doc?.documentStateId ?? 0) + 1;
};
class DocumentStatesController {
    constructor() {
        this.getDocumentStatesByWorkflow = async (req, res) => {
            try {
                const workflowID = toNumber(req.params?.workflowID);
                if (workflowID === null) {
                    return res.status(400).json({ message: "workflowID is required" });
                }
                const collection = await this.collection();
                const docs = await collection.find({ WorkflowID: workflowID }, { projection: { _id: 0 } }).toArray();
                return res.json(docs);
            }
            catch (error) {
                console.error("getDocumentStatesByWorkflow error", error);
                return res.status(500).json({ message: "Failed to fetch document states" });
            }
        };
        this.createDocumentState = async (req, res) => {
            try {
                const WorkflowID = toNumber(req.body?.WorkflowID);
                if (WorkflowID === null) {
                    return res.status(400).json({ message: "WorkflowID is required" });
                }
                const collection = await this.collection();
                const documentStateId = await nextId(collection);
                const doc = {
                    documentStateId,
                    documentStateName: req.body?.documentStateName ?? `State ${documentStateId}`,
                    documentStateDescription: req.body?.documentStateDescription,
                    WorkflowID,
                    steps: toNumber(req.body?.steps) ?? 1,
                };
                await collection.insertOne(doc);
                return res.status(201).json({ message: "Document state created", documentStateId });
            }
            catch (error) {
                console.error("createDocumentState error", error);
                return res.status(500).json({ message: "Failed to create document state" });
            }
        };
        this.updateDocumentState = async (req, res) => {
            try {
                const documentStateId = toNumber(req.body?.documentStateId);
                if (documentStateId === null) {
                    return res.status(400).json({ message: "documentStateId is required" });
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
                const result = await collection.updateOne({ documentStateId }, { $set: updates });
                if (!result.matchedCount) {
                    return res.status(404).json({ message: "Document state not found" });
                }
                return res.json({ message: "Document state updated" });
            }
            catch (error) {
                console.error("updateDocumentState error", error);
                return res.status(500).json({ message: "Failed to update document state" });
            }
        };
        this.deleteDocumentState = async (req, res) => {
            try {
                const documentStateId = toNumber(req.body?.documentStateId);
                if (documentStateId === null) {
                    return res.status(400).json({ message: "documentStateId is required" });
                }
                const collection = await this.collection();
                const result = await collection.deleteOne({ documentStateId });
                if (!result.deletedCount) {
                    return res.status(404).json({ message: "Document state not found" });
                }
                return res.json({ message: "Document state deleted" });
            }
            catch (error) {
                console.error("deleteDocumentState error", error);
                return res.status(500).json({ message: "Failed to delete document state" });
            }
        };
        this.reorderDocumentStates = async (req, res) => {
            try {
                const order = Array.isArray(req.body?.order)
                    ? req.body.order.map((id) => Number(id)).filter(Number.isFinite)
                    : [];
                if (!order.length) {
                    return res.status(400).json({ message: "order array is required" });
                }
                const collection = await this.collection();
                await Promise.all(order.map((documentStateId, index) => collection.updateOne({ documentStateId }, { $set: { steps: index + 1 } })));
                return res.json({ message: "Document states reordered" });
            }
            catch (error) {
                console.error("reorderDocumentStates error", error);
                return res.status(500).json({ message: "Failed to reorder document states" });
            }
        };
    }
    async collection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("DocumentStates");
    }
}
exports.DocumentStatesController = DocumentStatesController;
