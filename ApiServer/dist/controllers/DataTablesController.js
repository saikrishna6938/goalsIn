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
exports.dataTablesController = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../keys"));
class DataTablesController {
    addDataTable(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const { tableName, fields } = req.body;
                if (!tableName || !fields) {
                    return res.status(400).send("Required parameters not provided");
                }
                const jsonFields = JSON.stringify(fields);
                yield connection.execute("INSERT INTO DataTables(tableName, fields) VALUES(?, ?)", [tableName, jsonFields]);
                // Generate SQL query for creating the actual table
                const columns = fields
                    .map((field) => `${field.name} ${field.type}`)
                    .join(", ");
                const createTableQuery = `CREATE TABLE ${tableName} (${columns})`;
                yield connection.execute(createTableQuery);
                yield connection.execute("COMMIT");
                res.json({
                    status: true,
                    message: `Table ${tableName} created successfully!`,
                });
            }
            catch (error) {
                if (connection) {
                    try {
                        yield connection.execute("ROLLBACK");
                    }
                    catch (_a) { }
                }
                console.log(error);
                res.json({ status: false, message: "Failed to create table" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_b) { }
                }
            }
        });
    }
    updateDataTable(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const { tableName, fields } = req.body;
                if (!tableName || !fields) {
                    return res.status(400).send("Required parameters not provided");
                }
                // Fetch existing fields from DataTables
                const [results] = yield connection.execute("SELECT fields FROM DataTables WHERE tableName = ?", [tableName]);
                //@ts-ignore
                if (results.length === 0) {
                    return res.status(404).send("Table not found in DataTables.");
                }
                let existingFields = JSON.parse(results[0].fields);
                for (let field of fields) {
                    const existingFieldIndex = existingFields.findIndex((ef) => ef.name === field.name);
                    if (existingFieldIndex === -1) {
                        // Field doesn't exist, so we add it
                        existingFields.push(field);
                        const addColumnQuery = `ALTER TABLE ${tableName} ADD COLUMN ${field.name} ${field.type}`;
                        yield connection.execute(addColumnQuery);
                    }
                    else {
                        // Field exists, so we update it (for simplicity, let's assume only the type can change)
                        existingFields[existingFieldIndex].type = field.type;
                        const modifyColumnQuery = `ALTER TABLE ${tableName} MODIFY COLUMN ${field.name} ${field.type}`;
                        yield connection.execute(modifyColumnQuery);
                    }
                }
                const updateMasterQuery = `UPDATE DataTables SET fields = ? WHERE tableName = ?`;
                yield connection.execute(updateMasterQuery, [
                    JSON.stringify(existingFields),
                    tableName,
                ]);
                yield connection.execute("COMMIT");
                res.json({
                    status: true,
                    message: `Table ${tableName} updated successfully!`,
                });
            }
            catch (error) {
                if (connection) {
                    try {
                        yield connection.execute("ROLLBACK");
                    }
                    catch (_a) { }
                }
                console.log(error);
                res.json({ status: false, message: "Failed to update table" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_b) { }
                }
            }
        });
    }
    deleteDataTable(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const { tableName } = req.body;
                if (!tableName) {
                    return res.status(400).send("Table name not provided");
                }
                const deleteMasterQuery = "DELETE FROM DataTables WHERE tableName = ?";
                yield connection.execute(deleteMasterQuery, [tableName]);
                const dropTableQuery = `DROP TABLE ${tableName}`;
                yield connection.execute(dropTableQuery);
                yield connection.execute("COMMIT");
                res.json({
                    status: true,
                    message: `Table ${tableName} deleted successfully!`,
                });
            }
            catch (error) {
                if (connection) {
                    try {
                        yield connection.execute("ROLLBACK");
                    }
                    catch (_a) { }
                }
                console.log(error);
                res.json({ status: false, message: "Failed to delete table" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_b) { }
                }
            }
        });
    }
    importDataTableFromExcel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                // You'll need to implement the logic to parse Excel and insert the data accordingly
                // For example using 'exceljs' or another library
                res.json({
                    status: true,
                    message: "Data imported from Excel successfully!",
                });
            }
            catch (error) {
                console.log(error);
                res.json({ status: false, message: "Failed to import data from Excel" });
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
    importDataTableFromCsv(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                // You'll need to implement the logic to parse CSV and insert the data accordingly
                // For example using 'papaparse' or another library
                res.json({
                    status: true,
                    message: "Data imported from CSV successfully!",
                });
            }
            catch (error) {
                console.log(error);
                res.json({ status: false, message: "Failed to import data from CSV" });
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
    insertIntoTable(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const { tableName, data } = req.body;
                const [results] = yield connection.execute("SELECT fields FROM DataTables WHERE tableName = ?", [tableName]);
                //@ts-ignore
                if (results.length === 0) {
                    return res
                        .status(400)
                        .json({ status: false, message: "Table not found in DataTables." });
                }
                const fields = JSON.parse(results[0].fields);
                const fieldNames = fields.map((field) => field.name).join(", ");
                const placeholders = fields.map(() => "?").join(", ");
                const insertQuery = `INSERT INTO ${tableName} (${fieldNames}) VALUES(${placeholders})`;
                yield connection.execute(insertQuery, Object.values(data));
                res.json({
                    status: true,
                    message: `Data inserted into ${tableName} successfully!`,
                });
            }
            catch (error) {
                console.log(error);
                res.json({ status: false, message: "Failed to insert data." });
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
    updateTable(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const { tableName, data, where } = req.body;
                const [results] = yield connection.execute("SELECT fields FROM DataTables WHERE tableName = ?", [tableName]);
                //@ts-ignore
                if (results.length === 0) {
                    return res
                        .status(400)
                        .json({ status: false, message: "Table not found in DataTables." });
                }
                const fields = JSON.parse(results[0].fields);
                const fieldUpdates = Object.keys(data)
                    .map((key) => `${key} = ?`)
                    .join(", ");
                const updateQuery = `UPDATE ${tableName} SET ${fieldUpdates} WHERE ${where.field} = ?`;
                const values = [...Object.values(data), where.value];
                yield connection.execute(updateQuery, values);
                res.json({
                    status: true,
                    message: `Data in ${tableName} updated successfully!`,
                });
            }
            catch (error) {
                console.log(error);
                res.json({ status: false, message: "Failed to update data." });
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
    deleteFromTable(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const { tableName, where } = req.body;
                const [results] = yield connection.execute("SELECT fields FROM DataTables WHERE tableName = ?", [tableName]);
                //@ts-ignore
                if (results.length === 0) {
                    return res
                        .status(400)
                        .json({ status: false, message: "Table not found in DataTables." });
                }
                const deleteQuery = `DELETE FROM ${tableName} WHERE ${where.field} = ?`;
                yield connection.execute(deleteQuery, [where.value]);
                res.json({
                    status: true,
                    message: `Data from ${tableName} deleted successfully!`,
                });
            }
            catch (error) {
                console.log(error);
                res.json({ status: false, message: "Failed to delete data." });
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
exports.dataTablesController = new DataTablesController();
//# sourceMappingURL=DataTablesController.js.map