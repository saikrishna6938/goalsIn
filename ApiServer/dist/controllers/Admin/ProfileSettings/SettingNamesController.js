"use strict";
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
exports.AdminUserSettingsTypesController = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../../keys"));
// Create a single shared pool for better perf & connection hygiene
const pool = promise_1.default.createPool(keys_1.default.database);
class AdminUserSettingsTypesController {
    constructor() { }
    // CREATE
    addUserSettingsType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { Name } = req.body;
                if (!Name || typeof Name !== "string" || !Name.trim()) {
                    res.status(400).json({ message: "Name is required", status: false });
                    return;
                }
                const [result] = yield pool.execute(`INSERT INTO UserSettingsTypes (Name) VALUES (?)`, [Name.trim()]);
                res.status(201).json({
                    message: "UserSettingsType added successfully",
                    id: result.insertId,
                    status: true,
                });
            }
            catch (error) {
                res
                    .status(500)
                    .json({
                    message: "Error adding UserSettingsType",
                    error,
                    status: false,
                });
            }
        });
    }
    // UPDATE
    editUserSettingsType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { Name } = req.body;
                if (Name !== undefined && (!Name || typeof Name !== "string")) {
                    res.status(400).json({ message: "Name must be a non-empty string" });
                    return;
                }
                // Build dynamic update but only allow Name for now
                const fields = [];
                const values = [];
                if (Name !== undefined) {
                    fields.push(`Name = ?`);
                    values.push(Name.trim());
                }
                if (fields.length === 0) {
                    res.status(400).json({ message: "No valid fields to update" });
                    return;
                }
                values.push(id);
                const [result] = yield pool.execute(`UPDATE UserSettingsTypes SET ${fields.join(", ")} WHERE Id = ?`, values);
                if (result.affectedRows === 0) {
                    res
                        .status(404)
                        .json({ message: "UserSettingsType not found", status: false });
                    return;
                }
                res
                    .status(200)
                    .json({
                    message: "UserSettingsType updated successfully",
                    status: true,
                });
            }
            catch (error) {
                res
                    .status(500)
                    .json({
                    message: "Error updating UserSettingsType",
                    error,
                    status: false,
                });
            }
        });
    }
    // DELETE
    deleteUserSettingsType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const [result] = yield pool.execute(`DELETE FROM UserSettingsTypes WHERE Id = ?`, [id]);
                if (result.affectedRows === 0) {
                    res
                        .status(404)
                        .json({ message: "UserSettingsType not found", status: false });
                    return;
                }
                res
                    .status(200)
                    .json({
                    message: "UserSettingsType deleted successfully",
                    status: true,
                });
            }
            catch (error) {
                res
                    .status(500)
                    .json({
                    message: "Error deleting UserSettingsType",
                    error,
                    status: false,
                });
            }
        });
    }
    // READ (all)
    getAllUserSettingsTypes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [rows] = yield pool.query(`SELECT Id, Name FROM UserSettingsTypes ORDER BY Id ASC`);
                res.status(200).json(rows);
            }
            catch (error) {
                res
                    .status(500)
                    .json({
                    message: "Error fetching UserSettingsTypes",
                    error,
                    status: false,
                });
            }
        });
    }
    // READ (single)
    getSingleUserSettingsType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const [rows] = yield pool.query(`SELECT Id, Name FROM UserSettingsTypes WHERE Id = ?`, [id]);
                if (!rows || rows.length === 0) {
                    res
                        .status(404)
                        .json({ message: "UserSettingsType not found", status: false });
                    return;
                }
                res.status(200).json(rows[0]);
            }
            catch (error) {
                res
                    .status(500)
                    .json({
                    message: "Error fetching UserSettingsType",
                    error,
                    status: false,
                });
            }
        });
    }
}
exports.AdminUserSettingsTypesController = AdminUserSettingsTypesController;
//# sourceMappingURL=SettingNamesController.js.map