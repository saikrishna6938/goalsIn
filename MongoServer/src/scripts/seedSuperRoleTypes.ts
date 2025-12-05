import path from "path";
import { getMongoDb, closeMongo } from "../config/mongo";
import { readSqlFile } from "../services/sqlSchemaParser";
import { appConfig } from "../config/env";
import type { SuperRoleTypes } from "../types/jotbox";

const extractSuperRoleTypes = (sql: string): SuperRoleTypes[] => {
  const insertRegex = /INSERT INTO `SuperRoleTypes`[\s\S]*?VALUES\s*([\s\S]*?);/i;
  const match = sql.match(insertRegex);
  if (!match) {
    throw new Error("Could not find SuperRoleTypes INSERT statement in SQL file");
  }
  const valuesBlock = match[1];
  const rowRegex = /\(\s*(\d+)\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*\)/g;
  const docs: SuperRoleTypes[] = [];
  let row: RegExpExecArray | null;
  while ((row = rowRegex.exec(valuesBlock)) !== null) {
    const [, id, name, description, updated] = row;
    docs.push({
      roleTypeId: Number(id),
      roleTypeName: name,
      roleTypeDescription: description,
      updatedDate: new Date(updated) as any,
    });
  }
  if (!docs.length) {
    throw new Error("Failed to parse any SuperRoleTypes rows from SQL file");
  }
  return docs;
};

const seedSuperRoleTypes = async () => {
  const sqlPath = path.isAbsolute(appConfig.sqlFile)
    ? appConfig.sqlFile
    : path.resolve(process.cwd(), appConfig.sqlFile);
  console.log(`Reading SQL file from ${sqlPath}`);
  const sql = await readSqlFile(sqlPath);
  const docs = extractSuperRoleTypes(sql);

  const db = await getMongoDb();
  const collection = db.collection<SuperRoleTypes>("SuperRoleTypes");
  console.log(`Upserting ${docs.length} SuperRoleTypes documents...`);
  for (const doc of docs) {
    await collection.updateOne({ roleTypeId: doc.roleTypeId }, { $set: doc }, { upsert: true });
  }
  console.log("SuperRoleTypes seeding complete.");
};

seedSuperRoleTypes()
  .catch((error) => {
    console.error("Failed to seed SuperRoleTypes", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeMongo();
  });
