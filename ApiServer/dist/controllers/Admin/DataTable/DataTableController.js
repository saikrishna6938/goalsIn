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
exports.DataTableController = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../../keys"));
const formidable_1 = __importDefault(require("formidable"));
const XLSX = __importStar(require("xlsx"));
class DataTableController {
    constructor() { }
    // 🔍 Get all data tables with parsed fields
    getAllDataTables(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const query = `
        SELECT tableId, tableName, fields
        FROM DataTables
        ORDER BY tableId ASC
      `;
                const [rows] = yield connection.execute(query);
                const parsedRows = rows.map((row) => (Object.assign(Object.assign({}, row), { fields: row.fields ? JSON.parse(row.fields) : null })));
                res.status(200).json({
                    message: "Data tables retrieved successfully",
                    data: parsedRows,
                    status: true,
                });
            }
            catch (error) {
                console.error("Error retrieving data tables:", error);
                res.status(500).json({
                    message: "Failed to retrieve data tables",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // ➕ Add a new data table and create physical table
    addDataTable(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tableName, fields } = req.body;
            if (!tableName || !Array.isArray(fields) || fields.length === 0) {
                return res.status(400).json({
                    message: "tableName and fields array are required and must be non-empty",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                yield connection.beginTransaction();
                const insertQuery = `
        INSERT INTO DataTables (tableName, fields)
        VALUES (?, ?)
      `;
                const fieldsJson = JSON.stringify(fields);
                yield connection.execute(insertQuery, [tableName, fieldsJson]);
                const columnDefs = fields
                    .map((col) => {
                    const type = col.type.toUpperCase();
                    const safeName = `\`${col.name}\``; // Use backticks directly
                    return `${safeName} ${type}`;
                })
                    .join(", ");
                const createTableQuery = `
        CREATE TABLE IF NOT EXISTS \`${tableName}\` (
          id INT AUTO_INCREMENT PRIMARY KEY,
          ${columnDefs}
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `;
                yield connection.execute(createTableQuery);
                yield connection.commit();
                res.status(201).json({
                    message: "Data table entry and physical table created successfully",
                    status: true,
                });
            }
            catch (error) {
                yield connection.rollback();
                console.error("Error adding data table and creating table:", error);
                res.status(500).json({
                    message: "Failed to create data table",
                    error,
                    status: false,
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    // ➕ Import data table via file and create physical table
    importDataTable(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const form = (0, formidable_1.default)({ multiples: false });
            form.parse(req, (err, fields, files) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                if (err) {
                    return res
                        .status(400)
                        .json({ message: "Error parsing form data", error: err });
                }
                const tableName = (_a = fields.tableName) === null || _a === void 0 ? void 0 : _a[0];
                const file = (_b = files.file) === null || _b === void 0 ? void 0 : _b[0];
                if (!tableName || !file) {
                    return res.status(400).json({
                        message: "tableName and file are required",
                        status: false,
                    });
                }
                let connection = null;
                try {
                    const workbook = XLSX.readFile(file.filepath);
                    const sheetName = workbook.SheetNames[0];
                    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                        defval: null,
                    });
                    if (!sheetData || sheetData.length === 0) {
                        return res.status(400).json({
                            message: "Excel/CSV file contains no data",
                            status: false,
                        });
                    }
                    const columnNames = Object.keys(sheetData[0]).filter((name) => name && name.toString().trim() !== "" && !name.startsWith("__EMPTY"));
                    const fields = columnNames.map((name) => ({ name, type: "TEXT" }));
                    connection = yield promise_1.default.createConnection(keys_1.default.database);
                    yield connection.beginTransaction();
                    // Save metadata
                    const fieldsJson = JSON.stringify(fields);
                    yield connection.execute(`INSERT INTO DataTables (tableName, fields) VALUES (?, ?)`, [tableName, fieldsJson]);
                    // Create SQL table
                    const columnDefs = fields
                        .map((col) => `\`${col.name}\` ${col.type}`)
                        .join(", ");
                    const createQuery = `
          CREATE TABLE IF NOT EXISTS \`${tableName}\` (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ${columnDefs}
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
                    yield connection.execute(createQuery);
                    // Insert rows
                    for (const row of sheetData) {
                        const cleanedRow = Object.fromEntries(Object.entries(row).filter(([key]) => key &&
                            key.toString().trim() !== "" &&
                            !key.startsWith("__EMPTY")));
                        const keys = Object.keys(cleanedRow);
                        const values = keys.map((k) => cleanedRow[k]);
                        const placeholders = keys.map(() => "?").join(", ");
                        yield connection.execute(`INSERT INTO \`${tableName}\` (${keys
                            .map((k) => `\`${k}\``)
                            .join(", ")}) VALUES (${placeholders})`, values);
                    }
                    yield connection.commit();
                    res.status(201).json({
                        message: "Data table created from file and data inserted successfully",
                        status: true,
                    });
                }
                catch (error) {
                    console.error("Error importing data table:", error);
                    res.status(500).json({
                        message: "Failed to import and create data table",
                        error,
                        status: false,
                    });
                }
                finally {
                    if (connection) {
                        try {
                            yield connection.end();
                        }
                        catch (_c) { }
                    }
                }
            }));
        });
    }
    // ❌ Delete a data table and drop its physical table
    deleteDataTable(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tableId, tableName } = req.body;
            if (!tableId || !tableName) {
                return res.status(400).json({
                    message: "tableId and tableName are required",
                    status: false,
                });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                yield connection.beginTransaction();
                const deleteQuery = `
        DELETE FROM DataTables WHERE tableId = ?
      `;
                yield connection.execute(deleteQuery, [tableId]);
                const dropTableQuery = `
        DROP TABLE IF EXISTS \`${tableName}\`
      `;
                yield connection.execute(dropTableQuery);
                yield connection.commit();
                res.status(200).json({
                    message: "Data table entry deleted and physical table dropped successfully",
                    status: true,
                });
            }
            catch (error) {
                yield connection.rollback();
                console.error("Error deleting data table:", error);
                res.status(500).json({
                    message: "Failed to delete data table",
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
exports.DataTableController = DataTableController;
//# sourceMappingURL=DataTableController.js.map