"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
const mongo_1 = require("../config/mongo");
const mongoSchemaBuilder_1 = require("../services/mongoSchemaBuilder");
const sqlSchemaParser_1 = require("../services/sqlSchemaParser");
const bootstrap = async () => {
    const sqlPath = path_1.default.isAbsolute(env_1.appConfig.sqlFile)
        ? env_1.appConfig.sqlFile
        : path_1.default.resolve(process.cwd(), env_1.appConfig.sqlFile);
    console.log(`Reading SQL schema from ${sqlPath}`);
    const sql = await (0, sqlSchemaParser_1.readSqlFile)(sqlPath);
    const tables = (0, sqlSchemaParser_1.parseSqlSchema)(sql);
    if (tables.length === 0) {
        throw new Error("No CREATE TABLE statements were discovered in the SQL file.");
    }
    console.log(`Discovered ${tables.length} tables. Creating MongoDB collections...`);
    const db = await (0, mongo_1.getMongoDb)();
    const results = await (0, mongoSchemaBuilder_1.ensureCollections)(db, tables);
    console.table(results.map((result) => ({
        table: result.name,
        created: Boolean(result.created),
        updated: Boolean(result.updated),
        skipped: Boolean(result.skipped),
        required: result.required.length,
    })));
    const skipped = results.filter((res) => res.skipped);
    if (skipped.length > 0) {
        console.warn("Some collections could not be modified:");
        skipped.forEach((res) => console.warn(` - ${res.name}: ${res.message}`));
    }
};
bootstrap()
    .catch((error) => {
    console.error("Mongo bootstrap failed", error);
    process.exitCode = 1;
})
    .finally(async () => {
    await (0, mongo_1.closeMongo)();
});
