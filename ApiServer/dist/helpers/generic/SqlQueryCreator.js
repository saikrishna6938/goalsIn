"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSQLQuery = void 0;
function generateSQLQuery(type, tableName, body, interfaceType, condition, exclude) {
    switch (type) {
        case "INSERT": {
            const columns = Object.keys(body)
                .filter((key) => interfaceType[key] !== undefined)
                .join(", ");
            const values = Object.keys(body)
                .filter((key) => interfaceType[key] !== undefined)
                .map(() => "?")
                .join(", ");
            return `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;
        }
        case "UPDATE": {
            const updates = Object.keys(body)
                .filter((key) => interfaceType[key] !== undefined && key !== exclude)
                .map((key) => `${key} = ?`)
                .join(", ");
            if (!condition)
                throw new Error("Condition is required for UPDATE");
            return `UPDATE ${tableName} SET ${updates} WHERE ${condition}`;
        }
        case "DELETE": {
            if (!condition)
                throw new Error("Condition is required for DELETE");
            return `DELETE FROM ${tableName} WHERE ${condition}`;
        }
        case "SELECT": {
            const columns = Object.keys(interfaceType).join(", ");
            return `SELECT ${columns} FROM ${tableName} ${condition ? `WHERE ${condition}` : ""}`;
        }
        default:
            throw new Error("Unsupported query type");
    }
}
exports.generateSQLQuery = generateSQLQuery;
//# sourceMappingURL=SqlQueryCreator.js.map