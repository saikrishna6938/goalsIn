import path from "path";
import { appConfig } from "../config/env";
import { closeMongo, getMongoDb } from "../config/mongo";
import { ensureCollections } from "../services/mongoSchemaBuilder";
import { parseSqlSchema, readSqlFile } from "../services/sqlSchemaParser";

const bootstrap = async () => {
  const sqlPath = path.isAbsolute(appConfig.sqlFile)
    ? appConfig.sqlFile
    : path.resolve(process.cwd(), appConfig.sqlFile);

  console.log(`Reading SQL schema from ${sqlPath}`);
  const sql = await readSqlFile(sqlPath);
  const tables = parseSqlSchema(sql);

  if (tables.length === 0) {
    throw new Error("No CREATE TABLE statements were discovered in the SQL file.");
  }

  console.log(`Discovered ${tables.length} tables. Creating MongoDB collections...`);
  const db = await getMongoDb();
  const results = await ensureCollections(db, tables);

  console.table(
    results.map((result) => ({
      table: result.name,
      created: Boolean(result.created),
      updated: Boolean(result.updated),
      skipped: Boolean(result.skipped),
      required: result.required.length,
    }))
  );

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
    await closeMongo();
  });
