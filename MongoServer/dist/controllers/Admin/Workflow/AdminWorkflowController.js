"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminWorkflowController = void 0;
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
class AdminWorkflowController {
    constructor() {
        this.getAllWorkflows = async (_req, res) => {
            try {
                const collection = await this.workflows();
                const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
                return res.json(docs);
            }
            catch (error) {
                console.error("getAllWorkflows error", error);
                return res.status(500).json({ message: "Failed to fetch workflows" });
            }
        };
        this.createWorkflow = async (req, res) => {
            try {
                const collection = await this.workflows();
                const WorkflowID = await nextId(collection, "WorkflowID");
                const doc = {
                    WorkflowID,
                    WorkflowName: req.body?.WorkflowName ?? `Workflow ${WorkflowID}`,
                    Description: req.body?.Description,
                    CreatedAt: new Date(),
                };
                await collection.insertOne(doc);
                return res.status(201).json({ message: "Workflow created", WorkflowID });
            }
            catch (error) {
                console.error("createWorkflow error", error);
                return res.status(500).json({ message: "Failed to create workflow" });
            }
        };
        this.updateWorkflow = async (req, res) => {
            try {
                const WorkflowID = toNumber(req.body?.WorkflowID);
                if (WorkflowID === null) {
                    return res.status(400).json({ message: "WorkflowID is required" });
                }
                const updates = {};
                if (typeof req.body?.WorkflowName === "string")
                    updates.WorkflowName = req.body.WorkflowName;
                if (typeof req.body?.Description === "string")
                    updates.Description = req.body.Description;
                if (!Object.keys(updates).length) {
                    return res.status(400).json({ message: "No fields to update" });
                }
                const collection = await this.workflows();
                const result = await collection.updateOne({ WorkflowID }, { $set: updates });
                if (!result.matchedCount) {
                    return res.status(404).json({ message: "Workflow not found" });
                }
                return res.json({ message: "Workflow updated" });
            }
            catch (error) {
                console.error("updateWorkflow error", error);
                return res.status(500).json({ message: "Failed to update workflow" });
            }
        };
        this.deleteWorkflow = async (req, res) => {
            try {
                const WorkflowID = toNumber(req.body?.WorkflowID);
                if (WorkflowID === null) {
                    return res.status(400).json({ message: "WorkflowID is required" });
                }
                const collection = await this.workflows();
                const result = await collection.deleteOne({ WorkflowID });
                if (!result.deletedCount) {
                    return res.status(404).json({ message: "Workflow not found" });
                }
                return res.json({ message: "Workflow deleted" });
            }
            catch (error) {
                console.error("deleteWorkflow error", error);
                return res.status(500).json({ message: "Failed to delete workflow" });
            }
        };
        this.getWorkflowDocumentTypes = async (req, res) => {
            try {
                const workflowID = toNumber(req.params?.workflowID);
                if (workflowID === null) {
                    return res.status(400).json({ message: "workflowID is required" });
                }
                const collection = await this.workflowDocumentTypes();
                const docs = await collection.find({ workflowID }, { projection: { _id: 0 } }).toArray();
                return res.json(docs);
            }
            catch (error) {
                console.error("getWorkflowDocumentTypes error", error);
                return res.status(500).json({ message: "Failed to fetch workflow document types" });
            }
        };
        this.addWorkflowDocumentTypes = async (req, res) => {
            try {
                const workflowID = toNumber(req.body?.workflowID);
                const documentTypeIds = Array.isArray(req.body?.documentTypeIds)
                    ? req.body.documentTypeIds.map((id) => Number(id)).filter(Number.isFinite)
                    : [];
                if (workflowID === null || !documentTypeIds.length) {
                    return res.status(400).json({ message: "workflowID and documentTypeIds are required" });
                }
                const collection = await this.workflowDocumentTypes();
                const docs = [];
                for (const DocumentTypeID of documentTypeIds) {
                    docs.push({
                        workflowDocumentTypeID: await nextId(collection, "workflowDocumentTypeID"),
                        workflowID,
                        DocumentTypeID,
                    });
                }
                await collection.insertMany(docs);
                return res.status(201).json({ message: "Workflow document types added" });
            }
            catch (error) {
                console.error("addWorkflowDocumentTypes error", error);
                return res.status(500).json({ message: "Failed to add workflow document types" });
            }
        };
        this.deleteWorkflowDocumentTypes = async (req, res) => {
            try {
                const workflowID = toNumber(req.body?.workflowID);
                const documentTypeIds = Array.isArray(req.body?.documentTypeIds)
                    ? req.body.documentTypeIds.map((id) => Number(id)).filter(Number.isFinite)
                    : [];
                if (workflowID === null || !documentTypeIds.length) {
                    return res.status(400).json({ message: "workflowID and documentTypeIds are required" });
                }
                const collection = await this.workflowDocumentTypes();
                const result = await collection.deleteMany({ workflowID, DocumentTypeID: { $in: documentTypeIds } });
                return res.json({ message: "Workflow document types deleted", deletedCount: result.deletedCount ?? 0 });
            }
            catch (error) {
                console.error("deleteWorkflowDocumentTypes error", error);
                return res.status(500).json({ message: "Failed to delete workflow document types" });
            }
        };
    }
    async workflows() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("Workflow");
    }
    async workflowDocumentTypes() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("WorkflowDocumentTypes");
    }
}
exports.AdminWorkflowController = AdminWorkflowController;
