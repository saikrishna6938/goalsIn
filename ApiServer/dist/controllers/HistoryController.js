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
exports.historyController = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../keys"));
class HistoryController {
    createDbConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield mysql.createConnection(keys_1.default.database);
        });
    }
    addHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { historyTypeId, historyUserId, historyTaskId } = req.body;
            if (!historyTypeId || !historyUserId || !historyTaskId) {
                return res.status(400).json({ message: "Required fields are missing." });
            }
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const query = `SELECT COUNT(*) AS count FROM History WHERE historyTypeId = ${historyTypeId} AND historyUserId = ${historyUserId} AND DATE(historyCreatedDate) = CURDATE() AND historyTaskId = ${historyTaskId}`;
                const [checkRows] = yield connection.execute(query);
                if (checkRows[0].count === 0) {
                    const [insertRows] = yield connection.execute("INSERT INTO History (historyTypeId, historyUserId, historyCreatedDate, historyTaskId) VALUES (?, ?, NOW(), ?)", [historyTypeId, historyUserId, historyTaskId]);
                    res.json({
                        status: true,
                        message: "History added successfully!",
                        data: insertRows,
                    });
                }
                else {
                    res.json({
                        status: true,
                        message: "History already exists for today!",
                        data: checkRows,
                    });
                }
            }
            catch (error) {
                console.error("Error adding history:", error);
                res
                    .status(500)
                    .json({ status: false, message: "Internal server error." });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    getHistoryByTaskId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { taskId } = req.params;
            if (!taskId) {
                return res.status(400).json({ message: "TaskId is required." });
            }
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [rows] = yield connection.execute(`SELECT 
                h.historyId, 
                h.historyUserId, 
                u.userFirstName, 
                u.userLastName, 
                h.historyCreatedDate, 
                h.historyTaskId, 
                ht.historyTypeName,
                u.userFirstName,
                u.userLastName
            FROM History h 
            JOIN HistoryTypes ht ON h.historyTypeId = ht.historyTypeId 
            JOIN Users u ON h.historyUserId = u.userId
            WHERE h.historyTaskId = ?`, [taskId]);
                res.json({
                    status: true,
                    message: "History retrieved successfully!",
                    data: rows,
                });
            }
            catch (error) {
                console.error("Error fetching history:", error);
                res
                    .status(500)
                    .json({ status: false, message: "Internal server error." });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
}
exports.historyController = new HistoryController();
//# sourceMappingURL=HistoryController.js.map