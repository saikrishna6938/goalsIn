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
exports.AdminSubProfileSettingsController = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../../keys"));
// Use a shared pool for efficiency
const pool = promise_1.default.createPool(keys_1.default.database);
class AdminSubProfileSettingsController {
    constructor() { }
    // CREATE
    addSubProfileSetting(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { SettingId, subProfileId, dataTypeId, value } = req.body;
                // Basic validation
                if (SettingId === undefined ||
                    subProfileId === undefined ||
                    dataTypeId === undefined ||
                    value === undefined) {
                    res
                        .status(400)
                        .json({
                        message: "SettingId, subProfileId, dataTypeId, and value are required",
                        status: false,
                    });
                    return;
                }
                const [result] = yield pool.execute(`INSERT INTO SubProfileSettings (SettingId, subProfileId, dataTypeId, value) VALUES (?, ?, ?, ?)`, [SettingId, subProfileId, dataTypeId, value]);
                res.status(201).json({
                    message: "SubProfileSetting created successfully",
                    id: result.insertId,
                    status: true,
                });
            }
            catch (error) {
                res
                    .status(500)
                    .json({
                    message: "Error creating SubProfileSetting",
                    error,
                    status: false,
                });
            }
        });
    }
    // UPDATE (partial)
    editSubProfileSetting(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { profileSettingsId } = req.params;
                const updates = req.body;
                const allowed = [
                    "SettingId",
                    "subProfileId",
                    "dataTypeId",
                    "value",
                ];
                const keys = Object.keys(updates).filter((k) => allowed.includes(k));
                if (keys.length === 0) {
                    res
                        .status(400)
                        .json({ message: "No valid fields to update", status: false });
                    return;
                }
                const fields = keys.map((k) => `${k} = ?`).join(", ");
                const values = keys.map((k) => updates[k]);
                values.push(profileSettingsId);
                const [result] = yield pool.execute(`UPDATE SubProfileSettings SET ${fields} WHERE profileSettingsId = ?`, values);
                if (result.affectedRows === 0) {
                    res
                        .status(404)
                        .json({ message: "SubProfileSetting not found", status: false });
                    return;
                }
                res
                    .status(200)
                    .json({
                    message: "SubProfileSetting updated successfully",
                    status: true,
                });
            }
            catch (error) {
                res
                    .status(500)
                    .json({
                    message: "Error updating SubProfileSetting",
                    error,
                    status: false,
                });
            }
        });
    }
    // DELETE
    deleteSubProfileSetting(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { profileSettingsId } = req.params;
                const [result] = yield pool.execute(`DELETE FROM SubProfileSettings WHERE profileSettingsId = ?`, [profileSettingsId]);
                if (result.affectedRows === 0) {
                    res
                        .status(404)
                        .json({ message: "SubProfileSetting not found", status: false });
                    return;
                }
                res
                    .status(200)
                    .json({
                    message: "SubProfileSetting deleted successfully",
                    status: true,
                });
            }
            catch (error) {
                res
                    .status(500)
                    .json({
                    message: "Error deleting SubProfileSetting",
                    error,
                    status: false,
                });
            }
        });
    }
    // READ (all)
    getAllSubProfileSettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [rows] = yield pool.query(`SELECT profileSettingsId, SettingId, subProfileId, dataTypeId, value FROM SubProfileSettings ORDER BY profileSettingsId ASC`);
                res.status(200).json(rows);
            }
            catch (error) {
                res
                    .status(500)
                    .json({
                    message: "Error fetching SubProfileSettings",
                    error,
                    status: false,
                });
            }
        });
    }
    // READ (single)
    getSingleSubProfileSetting(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { profileSettingsId } = req.params;
                const [rows] = yield pool.query(`SELECT profileSettingsId, SettingId, subProfileId, dataTypeId, value FROM SubProfileSettings WHERE profileSettingsId = ?`, [profileSettingsId]);
                if (!rows || rows.length === 0) {
                    res
                        .status(404)
                        .json({ message: "SubProfileSetting not found", status: false });
                    return;
                }
                res.status(200).json(rows[0]);
            }
            catch (error) {
                res
                    .status(500)
                    .json({
                    message: "Error fetching SubProfileSetting",
                    error,
                    status: false,
                });
            }
        });
    }
}
exports.AdminSubProfileSettingsController = AdminSubProfileSettingsController;
//# sourceMappingURL=SubProfileSettingsController.js.map