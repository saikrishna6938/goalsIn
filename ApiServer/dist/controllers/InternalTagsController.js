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
exports.internalTagsController = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const keys_1 = __importDefault(require("../keys"));
class InternalTagsController {
    updateRecord(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tableId, id } = req.params;
            const body = req.body;
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                // Get the table name from DataTables
                const [tableResult] = yield connection.execute(`SELECT tableName FROM DataTables WHERE tableId = ?`, [tableId]);
                if (tableResult.length === 0) {
                    res.status(404).json({ success: false, message: "Table not found" });
                    return;
                }
                const tableName = tableResult[0].tableName;
                // Construct update query dynamically
                const fields = Object.keys(body)
                    .map((key) => `${key} = ?`)
                    .join(", ");
                const values = Object.values(body);
                const updateQuery = `UPDATE \`${tableName}\` SET ${fields} WHERE id = ?`;
                yield connection.execute(updateQuery, [...values, id]);
                res.json({ success: true, message: "Record updated successfully" });
            }
            catch (error) {
                console.error(error);
                res
                    .status(500)
                    .json({ success: false, message: "Failed to update record" });
            }
            finally {
                yield connection.end();
            }
        });
    }
    createRecord(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tableId } = req.params;
            const body = req.body;
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                // Get the table name from DataTables
                const [tableResult] = yield connection.execute(`SELECT tableName FROM DataTables WHERE tableId = ?`, [tableId]);
                if (tableResult.length === 0) {
                    res.status(404).json({ success: false, message: "Table not found" });
                    return;
                }
                const tableName = tableResult[0].tableName;
                // Construct insert query dynamically
                const fields = Object.keys(body).join(", ");
                const placeholders = Object.keys(body)
                    .map(() => "?")
                    .join(", ");
                const values = Object.values(body);
                const insertQuery = `INSERT INTO \`${tableName}\` (${fields}) VALUES (${placeholders})`;
                yield connection.execute(insertQuery, values);
                res.json({ success: true, message: "Record created successfully" });
            }
            catch (error) {
                console.error(error);
                res
                    .status(500)
                    .json({ success: false, message: "Failed to create record" });
            }
            finally {
                yield connection.end();
            }
        });
    }
}
exports.internalTagsController = new InternalTagsController();
//# sourceMappingURL=InternalTagsController.js.map