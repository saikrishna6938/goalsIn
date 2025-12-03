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
exports.getIndexTypeAndName = exports.getIndexName = exports.getGroupIndexTypeByTaskId = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../keys"));
/**
 * GET groupIndexType by taskId
 * Input: taskId (from req.params or req.body)
 * Output: { groupIndexType: number | null, groupTypeName?: string }
 */
function getGroupIndexTypeByTaskId(req, res) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        let connection = null;
        try {
            const taskIdRaw = (_b = (_a = req.params) === null || _a === void 0 ? void 0 : _a.taskId) !== null && _b !== void 0 ? _b : (_c = req.body) === null || _c === void 0 ? void 0 : _c.taskId;
            const taskId = Number(taskIdRaw);
            if (!Number.isFinite(taskId) || taskId <= 0) {
                res.status(400).json({ success: false, message: "Invalid taskId" });
                return;
            }
            connection = yield mysql.createConnection(keys_1.default.database);
            // Tasks -> DocumentType -> DocumentGroup -> groupTypeId (+ name)
            const sql = `
      SELECT 
        dg.groupTypeId AS groupIndexType,
        dgt.groupTypeName
      FROM Tasks t
      LEFT JOIN DocumentType dt
        ON dt.documentTypeId = t.documentTypeId
      LEFT JOIN DocumentGroup dg
        ON dg.documentGroupId = dt.documentGroupId
      LEFT JOIN DocumentGroupType dgt
        ON dgt.groupTypeId = dg.groupTypeId
      WHERE t.taskId = ?
      LIMIT 1
    `;
            const [rows] = yield connection.execute(sql, [taskId]);
            if (!rows || rows.length === 0) {
                res.status(404).json({ success: false, message: "Task not found" });
                return;
            }
            const row = rows[0];
            res.status(200).json({
                success: true,
                data: {
                    taskId,
                    groupIndexType: (_d = row.groupIndexType) !== null && _d !== void 0 ? _d : null,
                    groupTypeName: (_e = row.groupTypeName) !== null && _e !== void 0 ? _e : null,
                },
            });
        }
        catch (error) {
            console.error("getGroupIndexTypeByTaskId error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch groupIndexType",
                error: String((_f = error === null || error === void 0 ? void 0 : error.message) !== null && _f !== void 0 ? _f : error),
            });
        }
        finally {
            if (connection)
                yield connection.end();
        }
    });
}
exports.getGroupIndexTypeByTaskId = getGroupIndexTypeByTaskId;
function getIndexName(taskIdRaw) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let connection = null;
        try {
            const taskId = Number(taskIdRaw);
            if (!Number.isFinite(taskId) || taskId <= 0) {
                return null;
            }
            connection = yield mysql.createConnection(keys_1.default.database);
            // Tasks -> DocumentType -> DocumentGroup -> groupTypeId (+ name)
            const sql = `
      SELECT 
        dg.groupTypeId AS groupIndexType,
        dgt.groupTypeName
      FROM Tasks t
      LEFT JOIN DocumentType dt
        ON dt.documentTypeId = t.documentTypeId
      LEFT JOIN DocumentGroup dg
        ON dg.documentGroupId = dt.documentGroupId
      LEFT JOIN DocumentGroupType dgt
        ON dgt.groupTypeId = dg.groupTypeId
      WHERE t.taskId = ?
      LIMIT 1
    `;
            const [rows] = yield connection.execute(sql, [taskId]);
            if (!rows || rows.length === 0) {
                return null;
            }
            const row = rows[0];
            return (_a = row.groupTypeName) !== null && _a !== void 0 ? _a : null;
        }
        catch (error) {
            console.error("getGroupIndexTypeByTaskId error:", error);
            return null;
        }
        finally {
            if (connection)
                yield connection.end();
        }
    });
}
exports.getIndexName = getIndexName;
/**
 * Utility: Fetch both index type (numeric id) and name for a taskId
 * Returns: { indexType: number | null, name: string | null } | null on invalid id
 */
function getIndexTypeAndName(taskIdRaw) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let connection = null;
        try {
            const taskId = Number(taskIdRaw);
            if (!Number.isFinite(taskId) || taskId <= 0)
                return null;
            connection = yield mysql.createConnection(keys_1.default.database);
            const sql = `
      SELECT 
        dg.groupTypeId   AS groupIndexType,
        dgt.groupTypeName AS groupTypeName
      FROM Tasks t
      LEFT JOIN DocumentType dt
        ON dt.documentTypeId = t.documentTypeId
      LEFT JOIN DocumentGroup dg
        ON dg.documentGroupId = dt.documentGroupId
      LEFT JOIN DocumentGroupType dgt
        ON dgt.groupTypeId = dg.groupTypeId
      WHERE t.taskId = ?
      LIMIT 1
    `;
            const [rows] = yield connection.execute(sql, [taskId]);
            if (!rows || rows.length === 0)
                return { indexType: null, name: null };
            const row = rows[0];
            return {
                indexType: (_a = row.groupIndexType) !== null && _a !== void 0 ? _a : null,
                name: (_b = row.groupTypeName) !== null && _b !== void 0 ? _b : null,
            };
        }
        catch (error) {
            console.error("getIndexTypeAndName error:", error);
            return null;
        }
        finally {
            if (connection)
                yield connection.end();
        }
    });
}
exports.getIndexTypeAndName = getIndexTypeAndName;
//# sourceMappingURL=groupIndexType.js.map