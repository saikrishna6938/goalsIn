"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainController = void 0;
const mongo_1 = require("../config/mongo");
const GlobalController_1 = require("./GlobalController");
const toNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value.trim());
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};
const toBoolean = (value) => {
    if (typeof value === "boolean")
        return value;
    if (typeof value === "number")
        return value !== 0;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["true", "1", "yes"].includes(normalized))
            return true;
        if (["false", "0", "no"].includes(normalized))
            return false;
    }
    return null;
};
const toDateValue = (value) => {
    if (value instanceof Date && !Number.isNaN(value.getTime()))
        return value;
    if (typeof value === "string" || typeof value === "number") {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime()))
            return date;
    }
    return null;
};
class MainController {
    constructor() {
        this.updatableFields = [
            "userName",
            "userEmail",
            "userPassword",
            "userFirstName",
            "userLastName",
            "userImage",
            "userAddress",
            "userServerEmail",
            "userPhoneOne",
            "userPhoneTwo",
            "userLastLogin",
            "userCreated",
            "userEnabled",
            "userLocked",
            "userType",
            "roles",
            "entities",
            "socketId",
            "lastNotesSeen",
        ];
        this.numericFields = new Set(["userType", "socketId"]);
        this.booleanFields = new Set(["userEnabled", "userLocked"]);
        this.dateFields = new Set(["userLastLogin", "userCreated", "lastNotesSeen"]);
        this.getUser = async (req, res) => {
            try {
                const { userId: rawUserId } = req.body || {};
                const userId = toNumber(rawUserId);
                if (userId === null) {
                    return res.status(400).json({ success: false, message: "userId is required" });
                }
                const db = await (0, mongo_1.getMongoDb)();
                const user = await db.collection("Users").findOne({ userId }, { projection: { _id: 0 } });
                if (!user) {
                    return res.status(404).json({ success: false, message: "User not found" });
                }
                return res.json({ success: true, data: user });
            }
            catch (error) {
                console.error("getUser error", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
        };
        this.updateUser = async (req, res) => {
            try {
                const userId = toNumber(req.body?.userId);
                if (userId === null) {
                    return res.status(400).json({ success: false, message: "userId is required" });
                }
                let updates;
                try {
                    updates = this.extractUpdates(req.body ?? {});
                }
                catch (error) {
                    return res.status(400).json({ success: false, message: error.message });
                }
                if (!Object.keys(updates).length) {
                    return res.status(400).json({ success: false, message: "No valid fields to update" });
                }
                const db = await (0, mongo_1.getMongoDb)();
                const usersCollection = db.collection("Users");
                const result = await usersCollection.updateOne({ userId }, { $set: updates });
                if (!result.matchedCount) {
                    return res.status(404).json({ success: false, message: "User not found" });
                }
                if (req.body?.userType === 2) {
                    await GlobalController_1.globalController.assignDefaultRoleToUser(userId);
                }
                return res.json({
                    success: true,
                    message: "User details updated successfully",
                    modifiedCount: result.modifiedCount ?? 0,
                });
            }
            catch (error) {
                console.error("updateUser error", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
        };
    }
    coerceValue(field, value) {
        if (value === undefined)
            return undefined;
        if (value === null)
            return null;
        if (this.numericFields.has(field)) {
            const numeric = toNumber(value);
            if (numeric === null) {
                throw new Error(`${String(field)} must be a number`);
            }
            return numeric;
        }
        if (this.booleanFields.has(field)) {
            const boolVal = toBoolean(value);
            if (boolVal === null) {
                throw new Error(`${String(field)} must be a boolean value`);
            }
            return boolVal;
        }
        if (this.dateFields.has(field)) {
            const dateVal = toDateValue(value);
            if (dateVal === null) {
                throw new Error(`${String(field)} must be a valid date`);
            }
            return dateVal;
        }
        return value;
    }
    extractUpdates(payload) {
        const updates = {};
        for (const field of this.updatableFields) {
            if (Object.prototype.hasOwnProperty.call(payload, field)) {
                const coerced = this.coerceValue(field, payload[field]);
                if (coerced !== undefined) {
                    updates[field] = coerced;
                }
            }
        }
        return updates;
    }
}
exports.mainController = new MainController();
