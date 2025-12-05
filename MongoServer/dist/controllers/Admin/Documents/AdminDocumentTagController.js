"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminDocumentTagController = exports.AdminDocumentTagController = void 0;
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
        .find({}, { projection: { documentTagObjectId: 1 } })
        .sort({ documentTagObjectId: -1 })
        .limit(1)
        .next();
    return (doc?.documentTagObjectId ?? 0) + 1;
};
class AdminDocumentTagController {
    constructor() {
        this.createDocumentTag = async (req, res) => {
            try {
                const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
                const documentTagObject = req.body?.documentTagObject;
                if (!name || documentTagObject === undefined) {
                    return res.status(400).json({ success: false, message: "Required fields: name, documentTagObject" });
                }
                const collection = await this.collection();
                const documentTagObjectId = await nextId(collection);
                await collection.insertOne({
                    documentTagObjectId,
                    name,
                    description: req.body?.description ?? null,
                    documentTagObject: typeof documentTagObject === "string" ? documentTagObject : JSON.stringify(documentTagObject),
                    created: new Date(),
                    updated: new Date(),
                });
                return res.status(201).json({
                    success: true,
                    message: "Document tag created successfully.",
                    insertId: documentTagObjectId,
                });
            }
            catch (error) {
                console.error("createDocumentTag error", error);
                return res.status(500).json({ success: false, message: "Failed to create document tag." });
            }
        };
        this.getAllDocumentTags = async (_req, res) => {
            try {
                const collection = await this.collection();
                const rows = await collection.find({}, { projection: { _id: 0 } }).toArray();
                return res.json({ success: true, data: rows });
            }
            catch (error) {
                console.error("getAllDocumentTags error", error);
                return res.status(500).json({ success: false, message: "Failed to fetch document tags." });
            }
        };
        this.updateDocumentTag = async (req, res) => {
            try {
                const id = toNumber(req.params?.id);
                const { name, description, documentTagObject } = req.body;
                if (id === null || !name || documentTagObject === undefined) {
                    return res.status(400).json({ success: false, message: "Required fields: id, name, documentTagObject" });
                }
                const collection = await this.collection();
                const result = await collection.updateOne({ documentTagObjectId: id }, {
                    $set: {
                        name,
                        description: description ?? null,
                        documentTagObject: typeof documentTagObject === "string" ? documentTagObject : JSON.stringify(documentTagObject),
                        updated: new Date(),
                    },
                });
                if (!result.matchedCount) {
                    return res.status(404).json({ success: false, message: "Document tag not found." });
                }
                return res.json({ success: true, message: "Document tag updated successfully." });
            }
            catch (error) {
                console.error("updateDocumentTag error", error);
                return res.status(500).json({ success: false, message: "Failed to update document tag." });
            }
        };
        this.deleteDocumentTag = async (req, res) => {
            try {
                const id = toNumber(req.params?.id);
                if (id === null) {
                    return res.status(400).json({ success: false, message: "Missing required parameter: id" });
                }
                const collection = await this.collection();
                const result = await collection.deleteOne({ documentTagObjectId: id });
                if (!result.deletedCount) {
                    return res.status(404).json({ success: false, message: "Document tag not found." });
                }
                return res.json({ success: true, message: "Document tag deleted successfully." });
            }
            catch (error) {
                console.error("deleteDocumentTag error", error);
                return res.status(500).json({ success: false, message: "Failed to delete document tag." });
            }
        };
        this.getDocumentTagById = async (req, res) => {
            try {
                const id = toNumber(req.params?.id);
                if (id === null) {
                    return res.status(400).json({ success: false, message: "Missing required parameter: id" });
                }
                const collection = await this.collection();
                const doc = await collection.findOne({ documentTagObjectId: id }, { projection: { _id: 0 } });
                if (!doc) {
                    return res.status(404).json({ success: false, message: "Document tag not found." });
                }
                return res.json({
                    success: true,
                    data: {
                        ...doc,
                        documentTagObject: typeof doc.documentTagObject === "string" ? JSON.parse(doc.documentTagObject) : doc.documentTagObject,
                    },
                });
            }
            catch (error) {
                console.error("getDocumentTagById error", error);
                return res.status(500).json({ success: false, message: "Failed to fetch document tag by ID." });
            }
        };
    }
    async collection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("DocumentTagObject");
    }
}
exports.AdminDocumentTagController = AdminDocumentTagController;
exports.adminDocumentTagController = new AdminDocumentTagController();
