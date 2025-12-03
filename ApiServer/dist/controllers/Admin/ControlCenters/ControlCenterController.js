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
exports.ControlCenterController = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../../keys"));
class ControlCenterController {
    constructor() { }
    // 📄 Get all ControlCenters
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const [rows] = yield connection.execute(`SELECT * FROM ControlCenters ORDER BY controlCenterId ASC`);
                res.status(200).json({
                    message: "ControlCenters retrieved successfully",
                    data: rows,
                    status: true,
                });
            }
            catch (error) {
                console.error("Error fetching ControlCenters:", error);
                res.status(500).json({
                    message: "Failed to retrieve ControlCenters",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // 📄 Get a single ControlCenter by ID
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { controlCenterId } = req.params;
            if (!controlCenterId) {
                return res.status(400).json({
                    message: "'controlCenterId' is required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const [rows] = yield connection.execute(`SELECT * FROM ControlCenters WHERE controlCenterId = ?`, [controlCenterId]);
                if (Array.isArray(rows) && rows.length === 0) {
                    return res.status(404).json({
                        message: "ControlCenter not found",
                        status: false,
                    });
                }
                const item = rows[0];
                let parsed;
                try {
                    parsed = JSON.parse(item.jsonObject);
                }
                catch (e) {
                    parsed = null;
                }
                res.status(200).json({
                    message: "ControlCenter retrieved successfully",
                    data: Object.assign(Object.assign({}, item), { jsonObject: parsed }),
                    status: true,
                });
            }
            catch (error) {
                console.error("Error fetching ControlCenter:", error);
                res.status(500).json({
                    message: "Failed to retrieve ControlCenter",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // ➕ Create a new ControlCenter
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, description, jsonObject, enabled = 1 } = req.body;
            if (!name) {
                return res.status(400).json({
                    message: "'name' is required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const [result] = yield connection.execute(`INSERT INTO ControlCenters (
          name,
          description,
          jsonObject,
          created,
          updated,
          enabled
        ) VALUES (?, ?, ?, NOW(), NOW(), ?)`, [name, description, jsonObject, enabled]);
                res.status(201).json({
                    message: "ControlCenter created successfully",
                    insertedId: result["insertId"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error creating ControlCenter:", error);
                res.status(500).json({
                    message: "Failed to create ControlCenter",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // ✏️ Update an existing ControlCenter
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { controlCenterId, name, description, jsonObject, enabled } = req.body;
            if (!controlCenterId) {
                return res.status(400).json({
                    message: "'controlCenterId' is required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const [existingRows] = yield connection.execute(`SELECT * FROM ControlCenters WHERE controlCenterId = ?`, [controlCenterId]);
                if (!Array.isArray(existingRows) || existingRows.length === 0) {
                    return res.status(404).json({
                        message: "ControlCenter not found",
                        status: false,
                    });
                }
                const existing = existingRows[0];
                const [result] = yield connection.execute(`UPDATE ControlCenters SET
          name = ?,
          description = ?,
          jsonObject = ?,
          updated = NOW(),
          enabled = ?
        WHERE controlCenterId = ?`, [
                    name !== null && name !== void 0 ? name : existing.name,
                    description !== null && description !== void 0 ? description : existing.description,
                    jsonObject !== null && jsonObject !== void 0 ? jsonObject : existing.jsonObject,
                    enabled !== null && enabled !== void 0 ? enabled : existing.enabled,
                    controlCenterId,
                ]);
                res.status(200).json({
                    message: "ControlCenter updated successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error updating ControlCenter:", error);
                res.status(500).json({
                    message: "Failed to update ControlCenter",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // ❌ Delete a ControlCenter
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { controlCenterId } = req.body;
            if (!controlCenterId) {
                return res.status(400).json({
                    message: "'controlCenterId' is required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const [result] = yield connection.execute(`DELETE FROM ControlCenters WHERE controlCenterId = ?`, [controlCenterId]);
                res.status(200).json({
                    message: "ControlCenter deleted successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error deleting ControlCenter:", error);
                res.status(500).json({
                    message: "Failed to delete ControlCenter",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
}
exports.ControlCenterController = ControlCenterController;
//# sourceMappingURL=ControlCenterController.js.map