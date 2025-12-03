"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexController = void 0;
const mongo_1 = require("../config/mongo");
const normalizeString = (value) => {
    if (typeof value === "string" && value.trim().length) {
        return value.trim();
    }
    return undefined;
};
const nextNumericId = async (collectionName, idField, fallback = 1) => {
    const db = await (0, mongo_1.getMongoDb)();
    const projection = { [idField]: 1 };
    const sort = { [idField]: -1 };
    const doc = (await db.collection(collectionName).find().project(projection).sort(sort).limit(1).next());
    const value = doc ? Number(doc[idField]) : undefined;
    return Number.isFinite(value) ? value + 1 : fallback;
};
class IndexController {
    constructor() {
        this.index = (_req, res) => {
            res.json({ success: true, message: "MongoServer index" });
        };
        this.test = (_req, res) => {
            res.json({ success: true, message: "Test endpoint" });
        };
        this.action_subscribe = async (req, res) => {
            try {
                const name = normalizeString(req.body?.name) ?? "Anonymous";
                const email = normalizeString(req.body?.email);
                if (!email) {
                    return res.status(400).json({ success: false, message: "email is required" });
                }
                const db = await (0, mongo_1.getMongoDb)();
                const collection = db.collection("Subscriptions");
                const existing = await collection.findOne({ Email: email });
                if (existing) {
                    return res.json({ success: true, message: "Already subscribed" });
                }
                const nextId = await nextNumericId("Subscriptions", "Id");
                await collection.insertOne({ Id: nextId, Name: name, Email: email, CreatedDate: new Date() });
                return res.json({ success: true, message: "Subscribed successfully" });
            }
            catch (error) {
                console.error("action_subscribe error", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
        };
        this.action_contactus = async (req, res) => {
            try {
                const { name, email, message, phone } = req.body || {};
                if (!name || !email || !message || !phone) {
                    return res.status(400).json({ success: false, message: "All fields are required" });
                }
                const db = await (0, mongo_1.getMongoDb)();
                await db.collection("WebsiteContacts").insertOne({ name, email, message, phone, createdAt: new Date() });
                return res.json({ success: true, message: "Your enquiry has been received" });
            }
            catch (error) {
                console.error("action_contactus error", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
        };
        this.action_enroll = async (req, res) => {
            try {
                const { name, email, message, location, phone } = req.body || {};
                if (!name || !email || !message || !phone) {
                    return res.status(400).json({ success: false, message: "All fields are required" });
                }
                const db = await (0, mongo_1.getMongoDb)();
                await db.collection("WebsiteEnrollments").insertOne({ name, email, message, location, phone, createdAt: new Date() });
                return res.json({ success: true, message: "Enrollment request recorded" });
            }
            catch (error) {
                console.error("action_enroll error", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
        };
        this.action_submitFormWithFile = async (req, res) => {
            try {
                const { name, email, message, location, phone } = req.body || {};
                if (!name || !email || !message || !phone) {
                    return res.status(400).json({ success: false, message: "All fields are required" });
                }
                const file = req.file;
                if (!file) {
                    return res.status(400).json({ success: false, message: "File is required" });
                }
                const db = await (0, mongo_1.getMongoDb)();
                const uploads = db.collection("UploadFiles");
                const uploadId = await nextNumericId("UploadFiles", "uploadId");
                await uploads.insertOne({
                    uploadId,
                    uploadName: file.originalname,
                    fileName: file.originalname,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    fileData: file.buffer.toString("base64"),
                    uploadedDate: new Date(),
                });
                await db.collection("WebsiteResumes").insertOne({
                    uploadId,
                    name,
                    email,
                    message,
                    location,
                    phone,
                    createdAt: new Date(),
                });
                return res.json({ success: true, message: "Resume submitted successfully", uploadId });
            }
            catch (error) {
                console.error("action_submitFormWithFile error", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
        };
        this.getDocumentTagById = async (req, res) => {
            try {
                const { id } = req.params;
                const numericId = Number(id);
                if (!Number.isFinite(numericId)) {
                    return res.status(400).json({ success: false, message: "Invalid id" });
                }
                const db = await (0, mongo_1.getMongoDb)();
                const record = await db
                    .collection("DocumentTagObject")
                    .findOne({ documentTagObjectId: numericId });
                if (!record) {
                    return res.status(404).json({ success: false, message: "Document tag not found" });
                }
                let parsed = record.documentTagObject;
                if (typeof parsed === "string") {
                    try {
                        parsed = JSON.parse(parsed);
                    }
                    catch {
                        parsed = record.documentTagObject;
                    }
                }
                return res.json({
                    success: true,
                    data: {
                        documentTagObjectId: record.documentTagObjectId,
                        name: record.name,
                        description: record.description,
                        created: record.created,
                        updated: record.updated,
                        documentTagObject: parsed,
                    },
                });
            }
            catch (error) {
                console.error("getDocumentTagById error", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
        };
    }
}
exports.indexController = new IndexController();
