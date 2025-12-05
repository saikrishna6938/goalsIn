"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormController = void 0;
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
    const doc = await collection
        .find({}, { projection: { documentTypeObjectId: 1 } })
        .sort({ documentTypeObjectId: -1 })
        .limit(1)
        .next();
    return (doc?.documentTypeObjectId ?? 0) + 1;
};
class FormController {
    constructor() {
        this.create = async (req, res) => {
            try {
                const collection = await this.collection();
                const documentTypeObjectId = await nextId(collection);
                const doc = {
                    documentTypeObjectId,
                    name: req.body?.name ?? `Form ${documentTypeObjectId}`,
                    description: req.body?.description ?? "",
                    documentTypeObject: typeof req.body?.documentTypeObject === "string"
                        ? req.body.documentTypeObject
                        : JSON.stringify(req.body?.documentTypeObject ?? {}),
                    created: new Date(),
                    updated: new Date(),
                };
                await collection.insertOne(doc);
                return res.status(201).json({ message: "Form created", documentTypeObjectId });
            }
            catch (error) {
                console.error("create form error", error);
                return res.status(500).json({ message: "Failed to create form" });
            }
        };
        this.update = async (req, res) => {
            try {
                const documentTypeObjectId = toNumber(req.body?.documentTypeObjectId);
                if (documentTypeObjectId === null) {
                    return res.status(400).json({ message: "documentTypeObjectId is required" });
                }
                const updates = {};
                if (typeof req.body?.name === "string")
                    updates.name = req.body.name;
                if (typeof req.body?.description === "string")
                    updates.description = req.body.description;
                if (req.body?.documentTypeObject !== undefined) {
                    updates.documentTypeObject =
                        typeof req.body.documentTypeObject === "string"
                            ? req.body.documentTypeObject
                            : JSON.stringify(req.body.documentTypeObject);
                }
                if (!Object.keys(updates).length) {
                    return res.status(400).json({ message: "No fields to update" });
                }
                updates.updated = new Date();
                const collection = await this.collection();
                const result = await collection.updateOne({ documentTypeObjectId }, { $set: updates });
                if (!result.matchedCount) {
                    return res.status(404).json({ message: "Form not found" });
                }
                return res.json({ message: "Form updated" });
            }
            catch (error) {
                console.error("update form error", error);
                return res.status(500).json({ message: "Failed to update form" });
            }
        };
        this.delete = async (req, res) => {
            try {
                const documentTypeObjectId = toNumber(req.params?.documentTypeObjectId);
                if (documentTypeObjectId === null) {
                    return res.status(400).json({ message: "documentTypeObjectId is required" });
                }
                const collection = await this.collection();
                const result = await collection.deleteOne({ documentTypeObjectId });
                if (!result.deletedCount) {
                    return res.status(404).json({ message: "Form not found" });
                }
                return res.json({ message: "Form deleted" });
            }
            catch (error) {
                console.error("delete form error", error);
                return res.status(500).json({ message: "Failed to delete form" });
            }
        };
        this.getAll = async (_req, res) => {
            try {
                const collection = await this.collection();
                const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
                return res.json(docs);
            }
            catch (error) {
                console.error("getAll forms error", error);
                return res.status(500).json({ message: "Failed to fetch forms" });
            }
        };
        this.getById = async (req, res) => {
            try {
                const documentTypeObjectId = toNumber(req.params?.documentTypeObjectId);
                if (documentTypeObjectId === null) {
                    return res.status(400).json({ message: "documentTypeObjectId is required" });
                }
                const collection = await this.collection();
                const doc = await collection.findOne({ documentTypeObjectId }, { projection: { _id: 0 } });
                if (!doc) {
                    return res.status(404).json({ message: "Form not found" });
                }
                return res.json(doc);
            }
            catch (error) {
                console.error("getById form error", error);
                return res.status(500).json({ message: "Failed to fetch form" });
            }
        };
    }
    async collection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("DocumentTypeObject");
    }
}
exports.FormController = FormController;
