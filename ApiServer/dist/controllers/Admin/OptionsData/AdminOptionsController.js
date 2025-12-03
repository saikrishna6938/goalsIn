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
exports.adminOptionsController = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../../keys"));
class AdminOptionsController {
    createOption(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { optionName, options } = req.body;
            if (!optionName || !Array.isArray(options)) {
                return res
                    .status(400)
                    .json({ success: false, message: "Invalid input." });
            }
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute("INSERT INTO OptionsData (optionName, options) VALUES (?, ?)", [optionName, JSON.stringify(options)]);
                res.status(201).json({
                    success: true,
                    message: "Option created successfully",
                    insertId: result.insertId,
                });
            }
            catch (error) {
                console.error("Error creating option:", error);
                res
                    .status(500)
                    .json({ success: false, message: "Failed to create option." });
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
    getOptions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [rows] = yield connection.execute("SELECT optionId,optionName FROM OptionsData");
                const cleaned = rows.map((row) => (Object.assign({}, row)));
                res.json({ success: true, data: cleaned });
            }
            catch (error) {
                console.error("Error fetching options:", error);
                res
                    .status(500)
                    .json({ success: false, message: "Failed to fetch options." });
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
    getOptionsByID(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { optionId } = req.params;
            if (!optionId) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required parameter: optionId",
                });
            }
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [rows] = yield connection.execute("SELECT optionId, optionName, options FROM OptionsData WHERE optionId = ?", [optionId]);
                if (rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Option not found.",
                    });
                }
                const row = rows[0];
                res.json({
                    success: true,
                    data: {
                        optionId: row.optionId,
                        optionName: row.optionName,
                        options: JSON.parse(row.options),
                    },
                });
            }
            catch (error) {
                console.error("Error fetching option by ID:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch option by ID.",
                });
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
    deleteOption(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { optionId } = req.params;
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute("DELETE FROM OptionsData WHERE optionId = ?", [optionId]);
                if (result.affectedRows > 0) {
                    res.json({ success: true, message: "Option deleted successfully." });
                }
                else {
                    res.status(404).json({ success: false, message: "Option not found." });
                }
            }
            catch (error) {
                console.error("Error deleting option:", error);
                res
                    .status(500)
                    .json({ success: false, message: "Failed to delete option." });
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
    updateOption(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { optionId } = req.params;
            const { optionName, options } = req.body;
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute("UPDATE OptionsData SET optionName = ?, options = ? WHERE optionId = ?", [optionName, JSON.stringify(options), optionId]);
                if (result.affectedRows > 0) {
                    res.json({ success: true, message: "Option updated successfully." });
                }
                else {
                    res.status(404).json({ success: false, message: "Option not found." });
                }
            }
            catch (error) {
                console.error("Error updating option:", error);
                res
                    .status(500)
                    .json({ success: false, message: "Failed to update option." });
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
    getOptionDataByLabelName(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { optionName } = req.params;
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [rows] = yield connection.execute("SELECT * FROM OptionsData WHERE optionName = ?", [optionName]);
                if (rows.length > 0) {
                    res.json({ success: true, data: rows });
                }
                else {
                    res.status(404).json({ success: false, message: "Option not found." });
                }
            }
            catch (error) {
                console.error("Error fetching option by label:", error);
                res
                    .status(500)
                    .json({ success: false, message: "Failed to fetch option." });
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
    getOptionsDataByValueLabel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { entityId, valueLabel } = req.query;
            if (!entityId || !valueLabel) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required parameters: entityId and valueLabel",
                });
            }
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [rows] = yield connection.execute(`
      SELECT 
        sov.id AS structureOptionId,
        sov.selectedOptionId,
        sov.valueLabel,
        od.optionId,
        od.optionName,
        od.options,
        s.entityName
      FROM StructureOptionValues sov
      JOIN OptionsData od ON sov.optionId = od.optionId
      JOIN Structure s ON sov.entityId = s.entityId
      WHERE sov.entityId = ? AND sov.valueLabel = ?
      `, [entityId, valueLabel]);
                if (rows.length > 0) {
                    const row = rows[0];
                    // Parse the JSON options and find the selected option
                    const optionsList = JSON.parse(row.options);
                    const selected = optionsList.find((o) => o.id === row.selectedOptionId);
                    return res.json({
                        success: true,
                        data: {
                            structureOptionId: row.structureOptionId,
                            entityId,
                            entityName: row.entityName,
                            optionId: row.optionId,
                            optionName: row.optionName,
                            selectedOptionId: row.selectedOptionId,
                            selectedOptionName: (selected === null || selected === void 0 ? void 0 : selected.name) || null,
                            selectedOptionDescription: (selected === null || selected === void 0 ? void 0 : selected.description) || null,
                            valueLabel: row.valueLabel,
                            fullOptionsList: optionsList,
                        },
                    });
                }
                else {
                    return res.status(404).json({
                        success: false,
                        message: "No matching record found for the given entity and value label",
                    });
                }
            }
            catch (error) {
                console.error("Error in getOptionsDataByValueLabel:", error);
                res.status(500).json({
                    success: false,
                    message: "Internal server error while fetching option data",
                });
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
    getValueLabelsByEntityId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { entityId } = req.params;
            if (!entityId) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required parameter: entityId",
                });
            }
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [rows] = yield connection.execute(`
      SELECT id, valueLabel 
      FROM StructureOptionValues 
      WHERE entityId = ?
      `, [entityId]);
                res.json({
                    success: true,
                    data: rows,
                });
            }
            catch (error) {
                console.error("Error fetching value labels by entityId:", error);
                res.status(500).json({
                    success: false,
                    message: "Internal server error while fetching value labels.",
                });
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
    createStructureOptionValue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { entityId, optionId, selectedOptionId, valueLabel, notes } = req.body;
            if (!entityId || !optionId || !selectedOptionId || !valueLabel) {
                return res.status(400).json({
                    success: false,
                    message: "Required fields: entityId, optionId, selectedOptionId, valueLabel",
                });
            }
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute(`
      INSERT INTO StructureOptionValues 
      (entityId, optionId, selectedOptionId, valueLabel, notes) 
      VALUES (?, ?, ?, ?, ?)
      `, [entityId, optionId, selectedOptionId, valueLabel, notes || null]);
                res.status(201).json({
                    success: true,
                    message: "StructureOptionValue created successfully.",
                    insertId: result.insertId,
                });
            }
            catch (error) {
                console.error("Error inserting StructureOptionValue:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to create StructureOptionValue.",
                });
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
    getAllStructureOptionValues(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [rows] = yield connection.execute(`
      SELECT 
        sov.id,
        sov.entityId,
        s.entityName,
        sov.optionId,
        od.optionName,
        sov.selectedOptionId,
        sov.valueLabel,
        sov.notes
      FROM StructureOptionValues sov
      JOIN Structure s ON sov.entityId = s.entityId
      JOIN OptionsData od ON sov.optionId = od.optionId
      `);
                const result = rows.map((row) => (Object.assign({}, row)));
                res.json({ success: true, data: result });
            }
            catch (error) {
                console.error("Error fetching StructureOptionValues:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch structure option values.",
                });
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
    getStructureOptionValueById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required parameter: id",
                });
            }
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [rows] = yield connection.execute(`
      SELECT 
        sov.id,
        sov.entityId,
        s.entityName,
        sov.optionId,
        od.optionName,
        od.options,
        sov.selectedOptionId,
        sov.valueLabel,
        sov.notes
      FROM StructureOptionValues sov
      JOIN Structure s ON sov.entityId = s.entityId
      JOIN OptionsData od ON sov.optionId = od.optionId
      WHERE sov.id = ?
      `, [id]);
                connection.end();
                if (rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "StructureOptionValue not found.",
                    });
                }
                const row = rows[0];
                const optionsList = JSON.parse(row.options);
                const selected = optionsList.find((o) => o.id === row.selectedOptionId);
                res.json({
                    success: true,
                    data: {
                        id: row.id,
                        entityId: row.entityId,
                        entityName: row.entityName,
                        optionId: row.optionId,
                        optionName: row.optionName,
                        selectedOptionId: row.selectedOptionId,
                        selectedOptionName: (selected === null || selected === void 0 ? void 0 : selected.name) || null,
                        selectedOptionDescription: (selected === null || selected === void 0 ? void 0 : selected.description) || null,
                        valueLabel: row.valueLabel,
                        notes: row.notes,
                        fullOptionsList: optionsList,
                    },
                });
            }
            catch (error) {
                console.error("Error fetching StructureOptionValue by ID:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch StructureOptionValue by ID.",
                });
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
    updateStructureOptionValue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { entityId, optionId, selectedOptionId, valueLabel, notes } = req.body;
            if (!entityId || !optionId || !selectedOptionId || !valueLabel) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields: entityId, optionId, selectedOptionId, valueLabel",
                });
            }
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute(`
      UPDATE StructureOptionValues
      SET entityId = ?, optionId = ?, selectedOptionId = ?, valueLabel = ?, notes = ?
      WHERE id = ?
      `, [entityId, optionId, selectedOptionId, valueLabel, notes || null, id]);
                if (result.affectedRows > 0) {
                    res.json({
                        success: true,
                        message: "StructureOptionValue updated successfully.",
                    });
                }
                else {
                    res.status(404).json({
                        success: false,
                        message: "StructureOptionValue not found.",
                    });
                }
            }
            catch (error) {
                console.error("Error updating StructureOptionValue:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to update StructureOptionValue.",
                });
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
    deleteStructureOptionValue(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required parameter: id",
                });
            }
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute(`DELETE FROM StructureOptionValues WHERE id = ?`, [id]);
                if (result.affectedRows > 0) {
                    res.json({
                        success: true,
                        message: "StructureOptionValue deleted successfully.",
                    });
                }
                else {
                    res.status(404).json({
                        success: false,
                        message: "StructureOptionValue not found.",
                    });
                }
            }
            catch (error) {
                console.error("Error deleting StructureOptionValue:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to delete StructureOptionValue.",
                });
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
exports.adminOptionsController = new AdminOptionsController();
//# sourceMappingURL=AdminOptionsController.js.map