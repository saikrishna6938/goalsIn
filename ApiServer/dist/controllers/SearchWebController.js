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
exports.searchWebController = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../keys"));
class SearchWebController {
    SearchDocumentTable(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield mysql.createConnection(keys_1.default.database);
            try {
                const { dataTableId, search } = req.body;
                if (!dataTableId || !search) {
                    return res.status(400).send("Required parameters not provided");
                }
                // Retrieve the dataTableName and fields from DataTables based on dataTableId
                const [dataTableRows] = yield connection.execute("SELECT tableName, fields FROM DataTables WHERE tableId = ?", [dataTableId]);
                //@ts-ignore
                if (dataTableRows.length === 0) {
                    return res
                        .status(404)
                        .json({ status: false, message: "DataTable not found" });
                }
                const tableName = dataTableRows[0].tableName;
                const fields = JSON.parse(dataTableRows[0].fields);
                const conditions = Object.entries(search).map(([field, value]) => {
                    const fieldDefinition = fields.find((f) => f.name === field);
                    if (!fieldDefinition ||
                        value === null ||
                        value === undefined ||
                        value === "") {
                        return null;
                    }
                    const expression = fieldDefinition.expression;
                    switch (expression) {
                        case "equal":
                            return `${field} = ${mysql.escape(value)}`;
                        case "like":
                            return `${field} LIKE '%${mysql.escape(value).slice(1, -1)}%'`;
                        case "greater":
                            return `${field} >= ${mysql.escape(value)}`;
                        case "lesser":
                            return `${field} <= ${mysql.escape(value)}`;
                        default:
                            return null;
                    }
                });
                const validConditions = conditions.filter((condition) => condition !== null);
                let query = `SELECT * FROM ${tableName}`;
                if (validConditions.length > 0) {
                    query += ` WHERE ${validConditions.join(" AND ")}`;
                }
                query += " LIMIT 20";
                const [dataRows] = yield connection.execute(query);
                res.json({
                    status: true,
                    message: `Search results for ${tableName}`,
                    data: dataRows,
                    fields: fields,
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ status: false, message: "Internal server error" });
            }
            finally {
                // Close the connection
                yield connection.end();
            }
        });
    }
}
exports.searchWebController = new SearchWebController();
//# sourceMappingURL=SearchWebController.js.map