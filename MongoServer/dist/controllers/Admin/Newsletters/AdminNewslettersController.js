"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminNewslettersController = void 0;
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
class AdminNewslettersController {
    constructor() {
        // Newsletters
        this.getNewsletters = async (_req, res) => {
            try {
                const collection = await this.newsletters();
                const docs = await collection.find({}, { projection: { _id: 0 } }).toArray();
                return res.status(200).json({ rows: docs, status: true });
            }
            catch (error) {
                console.error("getNewsletters error", error);
                return res.status(500).json({ message: "Error fetching newsletters", error, status: false });
            }
        };
        this.addNewsletters = async (req, res) => {
            try {
                const payload = Array.isArray(req.body) ? req.body : [];
                if (!payload.length) {
                    return res.status(400).json({ message: "Invalid input: must be a non-empty array" });
                }
                const collection = await this.newsletters();
                const docs = [];
                for (const item of payload) {
                    docs.push({
                        newsletterId: await nextId(collection, "newsletterId"),
                        newsletterTypeId: toNumber(item.newsletterTypeId) ?? 0,
                        newsletterName: item.newsletterName ?? "",
                        newsletterDescription: item.newsletterDescription ?? "",
                    });
                }
                const result = await collection.insertMany(docs);
                return res.status(201).json({
                    message: "Newsletters added successfully",
                    affectedRows: result.insertedCount,
                    status: true,
                });
            }
            catch (error) {
                console.error("addNewsletters error", error);
                return res.status(500).json({ message: "Error adding newsletters", error, status: false });
            }
        };
        this.updateNewsletter = async (req, res) => {
            try {
                const newsletterId = toNumber(req.body?.newsletterId);
                if (newsletterId === null) {
                    return res.status(400).json({ message: "newsletterId is required for update" });
                }
                const updates = {};
                if (typeof req.body?.newsletterName === "string")
                    updates.newsletterName = req.body.newsletterName;
                if (typeof req.body?.newsletterDescription === "string")
                    updates.newsletterDescription = req.body.newsletterDescription;
                const newsletterTypeId = toNumber(req.body?.newsletterTypeId);
                if (newsletterTypeId !== null)
                    updates.newsletterTypeId = newsletterTypeId;
                const collection = await this.newsletters();
                const result = await collection.updateOne({ newsletterId }, { $set: updates });
                return res.status(200).json({
                    message: "Newsletter updated successfully",
                    affectedRows: result.modifiedCount,
                    status: true,
                });
            }
            catch (error) {
                console.error("updateNewsletter error", error);
                return res.status(500).json({ message: "Error updating newsletter", error, status: false });
            }
        };
        this.deleteNewsletters = async (req, res) => {
            try {
                const ids = Array.isArray(req.body?.newsletterIds)
                    ? req.body.newsletterIds.map((id) => Number(id)).filter(Number.isFinite)
                    : [];
                if (!ids.length) {
                    return res.status(400).json({ message: "Invalid input: Provide newsletterIds" });
                }
                const collection = await this.newsletters();
                const result = await collection.deleteMany({ newsletterId: { $in: ids } });
                return res.status(200).json({
                    message: "Newsletters deleted successfully",
                    affectedRows: result.deletedCount ?? 0,
                    status: true,
                });
            }
            catch (error) {
                console.error("deleteNewsletters error", error);
                return res.status(500).json({ message: "Error deleting newsletters", error, status: false });
            }
        };
        this.getById = async (req, res) => {
            try {
                const newsletterId = toNumber(req.params?.newslettersId);
                if (newsletterId === null) {
                    return res.status(400).json({ message: "newsletterId is required" });
                }
                const collection = await this.newsletters();
                const doc = await collection.findOne({ newsletterId }, { projection: { _id: 0 } });
                if (!doc) {
                    return res.status(404).json({ message: "Newsletter not found", status: false });
                }
                return res.status(200).json({ rows: [doc], status: true });
            }
            catch (error) {
                console.error("getById error", error);
                return res.status(500).json({ message: "Error fetching newsletter", error, status: false });
            }
        };
        // Newsletter types
        this.getNewsletterTypes = async (_req, res) => {
            try {
                const collection = await this.newsletterTypes();
                const rows = await collection.find({}, { projection: { _id: 0 } }).toArray();
                return res.status(200).json({ rows, status: true });
            }
            catch (error) {
                console.error("getNewsletterTypes error", error);
                return res.status(500).json({ message: "Error fetching newsletter types", error, status: false });
            }
        };
        this.addNewsletterTypes = async (req, res) => {
            try {
                const types = Array.isArray(req.body) ? req.body : [];
                if (!types.length) {
                    return res.status(400).json({ message: "Invalid input: must be a non-empty array" });
                }
                const collection = await this.newsletterTypes();
                const docs = [];
                for (const type of types) {
                    docs.push({
                        typeId: await nextId(collection, "typeId"),
                        typeName: type.typeName ?? "",
                        typeDescription: type.typeDescription ?? "",
                    });
                }
                const result = await collection.insertMany(docs);
                return res.status(201).json({
                    message: "Newsletter types added successfully",
                    affectedRows: result.insertedCount,
                    status: true,
                });
            }
            catch (error) {
                console.error("addNewsletterTypes error", error);
                return res.status(500).json({ message: "Error adding newsletter types", error, status: false });
            }
        };
        this.updateNewsletterType = async (req, res) => {
            try {
                const typeId = toNumber(req.body?.typeId);
                if (typeId === null) {
                    return res.status(400).json({ message: "typeId is required for update" });
                }
                const updates = {};
                if (typeof req.body?.typeName === "string")
                    updates.typeName = req.body.typeName;
                if (typeof req.body?.typeDescription === "string")
                    updates.typeDescription = req.body.typeDescription;
                const collection = await this.newsletterTypes();
                const result = await collection.updateOne({ typeId }, { $set: updates });
                return res.status(200).json({
                    message: "Newsletter type updated successfully",
                    affectedRows: result.modifiedCount,
                    status: true,
                });
            }
            catch (error) {
                console.error("updateNewsletterType error", error);
                return res.status(500).json({ message: "Error updating newsletter type", error, status: false });
            }
        };
        this.deleteNewsletterTypes = async (req, res) => {
            try {
                const typeIds = Array.isArray(req.body?.typeIds)
                    ? req.body.typeIds.map((id) => Number(id)).filter(Number.isFinite)
                    : [];
                if (!typeIds.length) {
                    return res.status(400).json({ message: "Invalid input: Provide typeIds" });
                }
                const collection = await this.newsletterTypes();
                const result = await collection.deleteMany({ typeId: { $in: typeIds } });
                return res.status(200).json({
                    message: "Newsletter types deleted successfully",
                    affectedRows: result.deletedCount ?? 0,
                    status: true,
                });
            }
            catch (error) {
                console.error("deleteNewsletterTypes error", error);
                return res.status(500).json({ message: "Error deleting newsletter types", error, status: false });
            }
        };
    }
    async newsletters() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("Newsletters");
    }
    async newsletterTypes() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("NewsletterType");
    }
}
exports.AdminNewslettersController = AdminNewslettersController;
