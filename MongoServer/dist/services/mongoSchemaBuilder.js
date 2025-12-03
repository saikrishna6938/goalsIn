"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureCollections = void 0;
const sqlToBsonType = (column) => {
    const normalized = column.sqlType.toLowerCase();
    const raw = column.rawLine.toLowerCase();
    if (normalized.startsWith("tinyint(1)")) {
        return "bool";
    }
    if (normalized.startsWith("bigint")) {
        return "long";
    }
    if (normalized.startsWith("int") ||
        normalized.startsWith("smallint") ||
        normalized.startsWith("mediumint")) {
        return "int";
    }
    if (normalized.includes("decimal") ||
        normalized.includes("float") ||
        normalized.includes("double")) {
        return "double";
    }
    if (normalized.includes("date") || normalized.includes("time")) {
        return "date";
    }
    if (normalized.includes("json") || raw.includes("json_valid")) {
        return "object";
    }
    if (normalized.includes("text") ||
        normalized.includes("varchar") ||
        normalized.includes("char") ||
        normalized.includes("enum")) {
        return "string";
    }
    return "string";
};
const buildValidator = (table) => {
    const required = table.columns
        .filter((column) => !column.isNullable && !column.hasDefault)
        .map((column) => column.name);
    const properties = {};
    for (const column of table.columns) {
        properties[column.name] = {
            bsonType: sqlToBsonType(column),
            description: column.rawLine,
        };
    }
    const schema = {
        bsonType: "object",
        title: table.name,
        properties,
    };
    if (required.length > 0) {
        schema.required = required;
    }
    return { $jsonSchema: schema };
};
const ensureCollections = async (db, tables) => {
    const existingCollections = await db
        .listCollections({}, { nameOnly: true })
        .toArray();
    const existingNames = new Set(existingCollections.map((col) => col.name));
    const results = [];
    for (const table of tables) {
        const validator = buildValidator(table);
        if (existingNames.has(table.name)) {
            try {
                await db.command({
                    collMod: table.name,
                    validator,
                    validationLevel: "moderate",
                });
                results.push({
                    name: table.name,
                    updated: true,
                    required: validator.$jsonSchema.required || [],
                });
            }
            catch (error) {
                results.push({
                    name: table.name,
                    skipped: true,
                    required: validator.$jsonSchema.required || [],
                    message: error.message,
                });
            }
        }
        else {
            await db.createCollection(table.name, {
                validator,
                validationLevel: "moderate",
            });
            results.push({
                name: table.name,
                created: true,
                required: validator.$jsonSchema.required || [],
            });
        }
    }
    return results;
};
exports.ensureCollections = ensureCollections;
