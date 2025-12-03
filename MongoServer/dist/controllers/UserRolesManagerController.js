"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRolesManagerController = void 0;
const mongo_1 = require("../config/mongo");
const parseEntityFilter = (entities, entityId) => {
    if (!entities)
        return false;
    const tokens = entities.split(",").map((value) => Number(value.trim())).filter(Number.isFinite);
    return tokens.includes(entityId);
};
const toNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim().length) {
        const parsed = Number(value.trim());
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};
class UserRolesManagerController {
    constructor() {
        this.getUsersByEntityId = async (req, res) => {
            try {
                const entityId = toNumber(req.params.entityId);
                if (entityId === null) {
                    return res.status(400).json({ success: false, message: "entityId is required" });
                }
                const userCollection = await this.users();
                const docs = await userCollection.find({}, { projection: { _id: 0 } }).toArray();
                const filtered = docs.filter((doc) => parseEntityFilter(doc.entities, entityId));
                return res.json({ success: true, data: filtered });
            }
            catch (error) {
                console.error("getUsersByEntityId error", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
        };
        this.getusersforjob = async (req, res) => {
            try {
                const entityId = toNumber(req.params.entityId);
                const userType = toNumber(req.params.userType);
                if (entityId === null || userType === null) {
                    return res.status(400).json({ success: false, message: "entityId and userType are required" });
                }
                const userCollection = await this.users();
                const docs = await userCollection.find({ userType }, { projection: { _id: 0 } }).toArray();
                const filtered = docs.filter((doc) => parseEntityFilter(doc.entities, entityId));
                return res.json({ success: true, data: filtered });
            }
            catch (error) {
                console.error("getusersforjob error", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
        };
    }
    async users() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("Users");
    }
}
exports.userRolesManagerController = new UserRolesManagerController();
