"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.frontEndPath = exports.pool = void 0;
const mysql2_1 = require("mysql2");
exports.pool = (0, mysql2_1.createPool)({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "jotdesk",
    connectionLimit: 10,
});
exports.frontEndPath = "http://gradwalk.us/";
//# sourceMappingURL=config.js.map