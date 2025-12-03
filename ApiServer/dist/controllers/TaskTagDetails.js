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
exports.taskTagDetailController = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../keys"));
class TaskTagDetails {
    getTaskTagDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                const { taskTagTableId, taskTagId } = req.params;
                // Attempt to create a database connection
                try {
                    connection = yield mysql.createConnection(keys_1.default.database);
                }
                catch (connError) {
                    console.error("Database connection error:", connError);
                    return res.status(500).json({
                        status: false,
                        message: "Failed to connect to the database",
                    });
                }
                // Fetch task tag details
                let result;
                try {
                    [result] = yield connection.execute("SELECT * from TaskTagDetails WHERE taskTagTableId = ?", [taskTagTableId]);
                }
                catch (queryError) {
                    console.error("Error executing task tag details query:", queryError);
                    return res
                        .status(500)
                        .json({ status: false, message: "Failed to fetch task tag details" });
                }
                // Fetch table name
                let tableName;
                try {
                    [tableName] = yield connection.execute("SELECT D.tableName from DataTables D WHERE tableId = ?", [taskTagTableId]);
                }
                catch (queryError) {
                    console.error("Error executing table name query:", queryError);
                    return res
                        .status(500)
                        .json({ status: false, message: "Failed to fetch table name" });
                }
                // Fetch table data
                let tableData;
                try {
                    [tableData] = yield connection.execute(`SELECT * from ${tableName[0].tableName} T WHERE Id = ?`, [taskTagId]);
                }
                catch (queryError) {
                    console.error("Error executing table data query:", queryError);
                    return res
                        .status(500)
                        .json({ status: false, message: "Failed to fetch table data" });
                }
                // Construct and send the response
                if (result[0]) {
                    const tagDetails = Object.assign(Object.assign(Object.assign(Object.assign({}, result[0]), { taskTagDetailsData: JSON.parse(result[0].taskTagDetailsData) }), tableName[0]), { tableData: Object.assign({}, tableData[0]) });
                    res.json({ status: true, message: "Success", data: tagDetails });
                }
                else {
                    res.json({ status: true, message: "No data found", data: {} });
                }
            }
            catch (error) {
                console.error("Unexpected error:", error);
                res
                    .status(500)
                    .json({ status: false, message: "An unexpected error occurred" });
            }
            finally {
                if (connection)
                    connection.end();
            }
        });
    }
    getSearchTagDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                const { taskTagTableId } = req.params;
                // Attempt to create a database connection
                try {
                    connection = yield mysql.createConnection(keys_1.default.database);
                }
                catch (connError) {
                    console.error("Database connection error:", connError);
                    return res.status(500).json({
                        status: false,
                        message: "Failed to connect to the database",
                    });
                }
                // Fetch task tag details data
                let result;
                try {
                    [result] = yield connection.execute("SELECT taskTagDetailsData from TaskTagDetails WHERE taskTagTableId = ?", [taskTagTableId]);
                }
                catch (queryError) {
                    console.error("Error executing task tag details query:", queryError);
                    return res.status(500).json({
                        status: false,
                        message: "Failed to fetch task tag details data",
                    });
                }
                // Construct and send the response
                if (result[0]) {
                    const taskTagDetailsData = JSON.parse(result[0].taskTagDetailsData);
                    res.json({
                        status: true,
                        message: "Success",
                        data: taskTagDetailsData,
                    });
                }
                else {
                    res.json({ status: true, message: "No data found", data: {} });
                }
            }
            catch (error) {
                console.error("Unexpected error:", error);
                res.status(500).json({
                    status: false,
                    message: "An unexpected error occurred",
                });
            }
            finally {
                if (connection)
                    connection.end();
            }
        });
    }
}
exports.taskTagDetailController = new TaskTagDetails();
//# sourceMappingURL=TaskTagDetails.js.map