"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const routeHelpers_1 = require("../utils/routeHelpers");
const registry_1 = require("../socket/registry");
const mongo_1 = require("../config/mongo");
const toNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim().length) {
        const parsed = Number(value.trim());
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};
const normalizeSocketId = (value) => {
    if (typeof value === "string" && value.trim())
        return value.trim();
    if (value !== undefined && value !== null)
        return String(value);
    return "";
};
class SocketRoutesClass {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    async usersCollection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("Users");
    }
    config() {
        const base = (0, routeHelpers_1.withBasePath)("socket");
        this.router.post(`${base}/register`, (req, res) => this.registerSocket(req, res));
        this.router.get(`${base}/online`, (_req, res) => {
            try {
                return res.json({ success: true, data: (0, registry_1.getOnlineUsers)() });
            }
            catch (error) {
                return res.status(500).json({ success: false, message: error?.message ?? "Error" });
            }
        });
    }
    async registerSocket(req, res) {
        try {
            const socketId = normalizeSocketId(req.body?.socketId ?? req.body?.socketID);
            if (!socketId) {
                return res.status(400).json({ success: false, message: "socketId is required" });
            }
            const token = req.body?.token;
            let userId = toNumber(req.body?.userId);
            if (userId === null && token) {
                try {
                    const decoded = jsonwebtoken_1.default.decode(String(token));
                    userId = toNumber(decoded?.userId ?? decoded?.sub);
                }
                catch { }
            }
            if (userId === null) {
                return res.status(400).json({ success: false, message: "userId or token required" });
            }
            const usersCollection = await this.usersCollection();
            const updateResult = await usersCollection.updateOne({ userId }, { $set: { socketId: socketId } });
            if (!updateResult.matchedCount) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            const entry = (0, registry_1.registerSocket)(socketId, userId, { via: "api-register" });
            return res.json({ success: true, message: "Socket registered", data: entry });
        }
        catch (error) {
            console.error("registerSocket error", error);
            return res.status(500).json({ success: false, message: error?.message ?? "Error" });
        }
    }
}
const SocketRoutes = new SocketRoutesClass();
exports.default = SocketRoutes.router;
