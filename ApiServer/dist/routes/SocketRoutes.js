"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const socket_1 = require("../socket");
const jwt = __importStar(require("jsonwebtoken"));
const socket_2 = require("../socket");
class SocketRoutesClass {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        // Register an existing socket.id to a user after login
        this.router.post(`${keys_1.default.basePath}socket/register`, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { socketId, token, userId } = req.body || {};
                if (!socketId) {
                    return res.status(400).json({ success: false, message: "socketId is required" });
                }
                const io = (0, socket_1.getIo)();
                if (!io)
                    return res.status(500).json({ success: false, message: "Socket server not ready" });
                const socket = io.sockets.sockets.get(String(socketId));
                if (!socket)
                    return res.status(404).json({ success: false, message: "Socket not found" });
                let uid = userId;
                if (!uid && token) {
                    try {
                        const decoded = jwt.decode(String(token));
                        uid = (decoded === null || decoded === void 0 ? void 0 : decoded.userId) || (decoded === null || decoded === void 0 ? void 0 : decoded.sub);
                    }
                    catch (_a) { }
                }
                if (!uid) {
                    return res.status(400).json({ success: false, message: "userId or token required" });
                }
                (0, socket_2.bindSocketToUser)(socket, uid);
                socket.data = socket.data || {};
                socket.data.userId = uid;
                // Persist socketId to Users
                try {
                    const mysql = yield Promise.resolve().then(() => __importStar(require("mysql2/promise")));
                    const conn = yield mysql.createConnection(keys_1.default.database);
                    yield conn.execute(`UPDATE Users SET socketId = ? WHERE userId = ?`, [String(socketId), uid]);
                    yield conn.end();
                }
                catch (_b) { }
                return res.json({ success: true, message: "Socket registered", socketId, userId: uid });
            }
            catch (e) {
                return res.status(500).json({ success: false, message: (e === null || e === void 0 ? void 0 : e.message) || "Error" });
            }
        }));
        // Inspect currently online users (debug only)
        this.router.get(`${keys_1.default.basePath}socket/online`, (req, res) => {
            try {
                return res.json({ success: true, data: (0, socket_2.getOnlineUsers)() });
            }
            catch (e) {
                return res.status(500).json({ success: false, message: (e === null || e === void 0 ? void 0 : e.message) || "Error" });
            }
        });
    }
}
const SocketRoutes = new SocketRoutesClass();
exports.default = SocketRoutes.router;
//# sourceMappingURL=SocketRoutes.js.map