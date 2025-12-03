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
exports.notifyUsersByDb = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../keys"));
const socket_1 = require("../socket");
function notifyUsersByDb(userIds, event, payload, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(userIds === null || userIds === void 0 ? void 0 : userIds.length))
            return;
        const ids = Array.from(new Set(userIds.map((u) => Number(u)).filter(Number.isFinite)));
        if (!ids.length)
            return;
        let ownConn = null;
        try {
            const conn = connection || (ownConn = yield mysql.createConnection(keys_1.default.database));
            const placeholders = ids.map(() => "?").join(",");
            const [rows] = yield conn.execute(`SELECT userId, socketId FROM Users WHERE userId IN (${placeholders}) AND socketId IS NOT NULL AND socketId != ''`, ids);
            //@ts-ignore
            const socketIds = rows.map((r) => r.socketId).filter(Boolean);
            (0, socket_1.emitToSocketIds)(socketIds, event, payload);
        }
        catch (e) {
            console.warn("notifyUsersByDb failed:", (e === null || e === void 0 ? void 0 : e.message) || e);
        }
        finally {
            if (ownConn) {
                try {
                    yield ownConn.end();
                }
                catch (_a) { }
            }
        }
    });
}
exports.notifyUsersByDb = notifyUsersByDb;
//# sourceMappingURL=socketNotify.js.map