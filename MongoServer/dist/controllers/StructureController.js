"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.structureController = void 0;
const mongo_1 = require("../config/mongo");
const toNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value.trim());
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};
const normalizeString = (value) => {
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length ? trimmed : undefined;
    }
    return undefined;
};
class StructureController {
    constructor() {
        this.addEntity = async (req, res) => {
            try {
                const payload = req.body || {};
                const entityName = normalizeString(payload.entityName);
                const entityLocation = normalizeString(payload.entityLocation);
                const entityPhone = normalizeString(payload.entityPhone);
                const refCode = normalizeString(payload.RefCode);
                if (!entityName || !entityLocation || !entityPhone || !refCode) {
                    return res.status(400).json({ success: false, message: "Missing required entity fields" });
                }
                const entityId = toNumber(payload.entityId) ?? (await this.nextEntityId());
                const doc = {
                    entityId,
                    entityName,
                    entityLocation,
                    entityPhone,
                    entityDescription: normalizeString(payload.entityDescription),
                    userRoleNameId: toNumber(payload.userRoleNameId) ?? undefined,
                    RefCode: refCode,
                };
                const coll = await this.collection();
                const existing = await coll.findOne({ entityId });
                if (existing) {
                    return res.status(409).json({ success: false, message: "Entity with this ID already exists" });
                }
                await coll.insertOne(doc);
                return res.json({ success: true, message: "Entity details added successfully", entityId });
            }
            catch (error) {
                console.error("addEntity error", error);
                return res.status(500).json({ success: false, message: "Failed to add entity details" });
            }
        };
        this.getEntities = async (_req, res) => {
            try {
                const coll = await this.collection();
                const data = await coll.find({}, { projection: { _id: 0 } }).toArray();
                return res.json({ success: true, message: "Success", entities: data });
            }
            catch (error) {
                console.error("getEntities error", error);
                return res.status(500).json({ success: false, message: "Failed to get entities" });
            }
        };
        this.getEntity = async (req, res) => {
            try {
                const entityId = toNumber(req.params.entityId);
                if (entityId === null) {
                    return res.status(400).json({ success: false, message: "Invalid entityId" });
                }
                const coll = await this.collection();
                const entity = await coll.findOne({ entityId }, { projection: { _id: 0 } });
                if (!entity) {
                    return res.json({ success: true, message: "No entity found", entity: {} });
                }
                return res.json({ success: true, message: "Success", entity });
            }
            catch (error) {
                console.error("getEntity error", error);
                return res.status(500).json({ success: false, message: "Failed to get entity" });
            }
        };
        this.updateEntity = async (req, res) => {
            try {
                const entityId = toNumber(req.params.entityId);
                if (entityId === null) {
                    return res.status(400).json({ success: false, message: "Invalid entityId" });
                }
                const updates = {};
                const payload = req.body || {};
                const entityName = normalizeString(payload.entityName);
                const entityLocation = normalizeString(payload.entityLocation);
                const entityPhone = normalizeString(payload.entityPhone);
                const entityDescription = normalizeString(payload.entityDescription);
                const refCode = normalizeString(payload.RefCode);
                const userRoleNameId = toNumber(payload.userRoleNameId);
                if (entityName)
                    updates.entityName = entityName;
                if (entityLocation)
                    updates.entityLocation = entityLocation;
                if (entityPhone)
                    updates.entityPhone = entityPhone;
                if (entityDescription !== undefined)
                    updates.entityDescription = entityDescription;
                if (refCode)
                    updates.RefCode = refCode;
                if (userRoleNameId !== null && userRoleNameId !== undefined)
                    updates.userRoleNameId = userRoleNameId;
                if (!Object.keys(updates).length) {
                    return res.status(400).json({ success: false, message: "No valid fields provided for update" });
                }
                const coll = await this.collection();
                const result = await coll.updateOne({ entityId }, { $set: updates });
                if (!result.matchedCount) {
                    return res.status(404).json({ success: false, message: "Entity not found" });
                }
                return res.json({ success: true, message: "Entity details updated successfully" });
            }
            catch (error) {
                console.error("updateEntity error", error);
                return res.status(500).json({ success: false, message: "Failed to update entity details" });
            }
        };
        this.deleteEntity = async (req, res) => {
            try {
                const entityId = toNumber(req.params.entityId);
                if (entityId === null) {
                    return res.status(400).json({ success: false, message: "Invalid entityId" });
                }
                const coll = await this.collection();
                const result = await coll.deleteOne({ entityId });
                if (!result.deletedCount) {
                    return res.status(404).json({ success: false, message: "Entity not found" });
                }
                return res.json({ success: true, message: "Entity deleted successfully" });
            }
            catch (error) {
                console.error("deleteEntity error", error);
                return res.status(500).json({ success: false, message: "Failed to delete entity" });
            }
        };
    }
    async collection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("Structure");
    }
    async nextEntityId() {
        const coll = await this.collection();
        const doc = await coll.find().project({ entityId: 1 }).sort({ entityId: -1 }).limit(1).next();
        return (doc?.entityId ?? 0) + 1;
    }
}
exports.structureController = new StructureController();
