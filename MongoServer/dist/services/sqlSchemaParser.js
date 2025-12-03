"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSqlSchema = exports.readSqlFile = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const COLUMN_IGNORE_PREFIXES = [
    "primary key",
    "unique key",
    "key ",
    "constraint",
    "index ",
    "fulltext",
    "spatial",
];
const readSqlFile = async (filePath) => {
    return promises_1.default.readFile(filePath, "utf8");
};
exports.readSqlFile = readSqlFile;
const parseSqlSchema = (sql) => {
    const regex = /CREATE TABLE `([^`]+)` \(([^;]*?)\)\s*ENGINE/gi;
    const tables = [];
    let match;
    while ((match = regex.exec(sql)) !== null) {
        const [, tableName, body] = match;
        const lines = body
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => Boolean(line));
        const columns = [];
        for (const line of lines) {
            const sanitizedLine = line.replace(/,+$/, "");
            if (!sanitizedLine.startsWith("`")) {
                const lower = sanitizedLine.toLowerCase();
                if (COLUMN_IGNORE_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
                    continue;
                }
                continue;
            }
            const columnMatch = sanitizedLine.match(/`([^`]+)`\s+([^\s]+)/);
            if (!columnMatch)
                continue;
            const [, columnName, columnType] = columnMatch;
            const isNullable = !/not null/i.test(sanitizedLine);
            const hasDefault = /default/i.test(sanitizedLine);
            columns.push({
                name: columnName,
                sqlType: columnType,
                isNullable,
                hasDefault,
                rawLine: sanitizedLine,
            });
        }
        tables.push({
            name: tableName,
            columns,
            rawBody: body,
        });
    }
    return tables;
};
exports.parseSqlSchema = parseSqlSchema;
