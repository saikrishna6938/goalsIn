"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentTypeRoleController = void 0;
const mongo_1 = require("../../config/mongo");
const toNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value.trim());
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};
class DocumentTypeRoleController {
    constructor() {
        this.getDocumentTypeRoles = async (_req, res) => {
            try {
                const collection = await this.collection();
                const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
                return res.json({ success: true, data: docs });
            }
            catch (error) {
                console.error("getDocumentTypeRoles error", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
        };
        this.insertDocumentTypeRole = async (req, res) => {
            try {
                const documentTypeId = toNumber(req.body?.documentTypeId);
                const roleNameId = toNumber(req.body?.roleNameId);
                if (documentTypeId === null || roleNameId === null) {
                    return res.status(400).json({ success: false, message: "documentTypeId and roleNameId are required" });
                }
                const collection = await this.collection();
                await collection.insertOne({
                    documentTypeRoleId: await this.nextId(),
                    documentTypeId,
                    roleNameId,
                    documentSecurity: typeof req.body?.documentSecurity === "string" ? req.body.documentSecurity : "default",
                });
                return res.status(201).json({ success: true, message: "Document type role inserted successfully" });
            }
            catch (error) {
                console.error("insertDocumentTypeRole error", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
        };
        this.updateDocumentTypeRole = async (req, res) => {
            try {
                const documentTypeRoleId = toNumber(req.body?.documentTypeRoleId);
                if (documentTypeRoleId === null) {
                    return res.status(400).json({ success: false, message: "documentTypeRoleId is required" });
                }
                const updates = {};
                const documentTypeId = toNumber(req.body?.documentTypeId);
                const roleNameId = toNumber(req.body?.roleNameId);
                if (documentTypeId !== null)
                    updates.documentTypeId = documentTypeId;
                if (roleNameId !== null)
                    updates.roleNameId = roleNameId;
                if (typeof req.body?.documentSecurity === "string")
                    updates.documentSecurity = req.body.documentSecurity;
                if (!Object.keys(updates).length) {
                    return res.status(400).json({ success: false, message: "No fields to update" });
                }
                const collection = await this.collection();
                const result = await collection.updateOne({ documentTypeRoleId }, { $set: updates });
                if (!result.matchedCount) {
                    return res.status(404).json({ success: false, message: "Document type role not found" });
                }
                return res.json({ success: true, message: "Document type role updated successfully" });
            }
            catch (error) {
                console.error("updateDocumentTypeRole error", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
        };
        this.deleteDocumentTypeRole = async (req, res) => {
            try {
                const documentTypeRoleId = toNumber(req.params?.documentTypeRoleId);
                if (documentTypeRoleId === null) {
                    return res.status(400).json({ success: false, message: "documentTypeRoleId is required" });
                }
                const collection = await this.collection();
                const result = await collection.deleteOne({ documentTypeRoleId });
                if (!result.deletedCount) {
                    return res.status(404).json({ success: false, message: "Document type role not found" });
                }
                return res.json({ success: true, message: "Document type role deleted successfully" });
            }
            catch (error) {
                console.error("deleteDocumentTypeRole error", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
        };
        this.getUserDocumentTypes = async (_req, res) => {
            try {
                const db = await (0, mongo_1.getMongoDb)();
                const docs = await db.collection("DocumentType").find({}, { projection: { _id: 0 } }).toArray();
                return res.json({ success: true, data: docs });
            }
            catch (error) {
                console.error("getUserDocumentTypes error", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
        };
        this.getFilteredDocumentTypes = async (_req, res) => {
            return this.getUserDocumentTypes(_req, res);
        };
    }
    async collection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("SuperDocumentTypeRoles");
    }
    async nextId() {
        const collection = await this.collection();
        const doc = await collection.find({}, { projection: { documentTypeRoleId: 1 } }).sort({ documentTypeRoleId: -1 }).limit(1).next();
        return (doc?.documentTypeRoleId ?? 0) + 1;
    }
}
exports.documentTypeRoleController = new DocumentTypeRoleController();
