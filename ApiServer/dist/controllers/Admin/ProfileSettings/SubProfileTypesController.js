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
exports.AdminSubProfileTypesController = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../../keys"));
const UserHelprs_1 = require("../../../helpers/user/UserHelprs");
// Use a shared pool for connection management
const pool = promise_1.default.createPool(keys_1.default.database);
class AdminSubProfileTypesController {
    constructor() { }
    // CREATE
    addSubProfileType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subProfileName } = req.body;
                if (!subProfileName ||
                    typeof subProfileName !== "string" ||
                    !subProfileName.trim()) {
                    res
                        .status(400)
                        .json({ message: "subProfileName is required", status: false });
                    return;
                }
                const [result] = yield pool.execute(`INSERT INTO SubProfileTypes (subProfileName) VALUES (?)`, [subProfileName.trim()]);
                res.status(201).json({
                    message: "SubProfileType added successfully",
                    id: result.insertId,
                    status: true,
                });
            }
            catch (error) {
                res
                    .status(500)
                    .json({ message: "Error adding SubProfileType", error, status: false });
            }
        });
    }
    // UPDATE
    editSubProfileType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subProfileId } = req.params;
                const { subProfileName } = req.body;
                if (subProfileName !== undefined &&
                    (!subProfileName || typeof subProfileName !== "string")) {
                    res
                        .status(400)
                        .json({ message: "subProfileName must be a non-empty string" });
                    return;
                }
                const fields = [];
                const values = [];
                if (subProfileName !== undefined) {
                    fields.push(`subProfileName = ?`);
                    values.push(subProfileName.trim());
                }
                if (fields.length === 0) {
                    res.status(400).json({ message: "No valid fields to update" });
                    return;
                }
                values.push(subProfileId);
                const [result] = yield pool.execute(`UPDATE SubProfileTypes SET ${fields.join(", ")} WHERE subProfileId = ?`, values);
                if (result.affectedRows === 0) {
                    res
                        .status(404)
                        .json({ message: "SubProfileType not found", status: false });
                    return;
                }
                res
                    .status(200)
                    .json({ message: "SubProfileType updated successfully", status: true });
            }
            catch (error) {
                res.status(500).json({
                    message: "Error updating SubProfileType",
                    error,
                    status: false,
                });
            }
        });
    }
    // DELETE
    deleteSubProfileType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subProfileId } = req.params;
                const [result] = yield pool.execute(`DELETE FROM SubProfileTypes WHERE subProfileId = ?`, [subProfileId]);
                if (result.affectedRows === 0) {
                    res
                        .status(404)
                        .json({ message: "SubProfileType not found", status: false });
                    return;
                }
                res
                    .status(200)
                    .json({ message: "SubProfileType deleted successfully", status: true });
            }
            catch (error) {
                res.status(500).json({
                    message: "Error deleting SubProfileType",
                    error,
                    status: false,
                });
            }
        });
    }
    // READ (all)
    getAllSubProfileTypes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [rows] = yield pool.query(`SELECT subProfileId, subProfileName FROM SubProfileTypes ORDER BY subProfileId ASC`);
                res.status(200).json(rows);
            }
            catch (error) {
                res.status(500).json({
                    message: "Error fetching SubProfileTypes",
                    error,
                    status: false,
                });
            }
        });
    }
    // READ (single)
    getSingleSubProfileType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subProfileId } = req.params;
                const [rows] = yield pool.query(`SELECT subProfileId, subProfileName FROM SubProfileTypes WHERE subProfileId = ?`, [subProfileId]);
                if (!rows || rows.length === 0) {
                    res
                        .status(404)
                        .json({ message: "SubProfileType not found", status: false });
                    return;
                }
                res.status(200).json(rows[0]);
            }
            catch (error) {
                res.status(500).json({
                    message: "Error fetching SubProfileType",
                    error,
                    status: false,
                });
            }
        });
    }
    getSettingNames(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subProfileId = Number(req.params.subProfileId);
                if (!Number.isFinite(subProfileId)) {
                    res
                        .status(400)
                        .json({ message: "Invalid subProfileId", status: false });
                    return;
                }
                const names = yield (0, UserHelprs_1.getSettingNamesBySubProfileId)(subProfileId);
                res
                    .status(200)
                    .json({ subProfileId, names, count: names.length, status: true });
            }
            catch (error) {
                res
                    .status(500)
                    .json({
                    message: "Error fetching setting names",
                    error,
                    status: false,
                });
            }
        });
    }
}
exports.AdminSubProfileTypesController = AdminSubProfileTypesController;
//# sourceMappingURL=SubProfileTypesController.js.map