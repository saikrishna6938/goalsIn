import path from "path";
import fs from "fs/promises";
import { appConfig } from "../config/env";
import { parseSqlSchema, readSqlFile } from "../services/sqlSchemaParser";

const sqlTypeToTs = (sqlType: string): string => {
  const normalized = sqlType.toLowerCase();

  if (normalized.startsWith("tinyint(1)")) return "boolean";
  if (
    normalized.startsWith("int") ||
    normalized.startsWith("smallint") ||
    normalized.startsWith("mediumint") ||
    normalized.startsWith("bigint") ||
    normalized.includes("decimal") ||
    normalized.includes("float") ||
    normalized.includes("double")
  ) {
    return "number";
  }
  if (normalized.includes("date") || normalized.includes("time")) {
    return "Date | string";
  }
  if (normalized.includes("json") || normalized.includes("longtext") || normalized.includes("blob")) {
    return "unknown";
  }
  return "string";
};

const toPascalCase = (value: string): string => {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
};

const shouldBeOptional = (isNullable: boolean, hasDefault: boolean): boolean => {
  return isNullable || hasDefault;
};

const formatPropertyName = (name: string): string => {
  const identifierRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;
  if (identifierRegex.test(name)) {
    return name;
  }
  return JSON.stringify(name);
};

async function generate() {
  const sqlPath = path.isAbsolute(appConfig.sqlFile)
    ? appConfig.sqlFile
    : path.resolve(process.cwd(), appConfig.sqlFile);
  const sql = await readSqlFile(sqlPath);
  const tables = parseSqlSchema(sql);
  if (tables.length === 0) {
    throw new Error("No tables discovered in SQL file");
  }

  const lines: string[] = [];
  lines.push("/* Auto-generated from jotbox.sql. Do not edit manually. */");
  lines.push("/* Run `npm run generate-types` to refresh. */", "");

  for (const table of tables) {
    const interfaceName = toPascalCase(table.name);
    lines.push(`export interface ${interfaceName} {`);
    if (table.columns.length === 0) {
      lines.push("  [key: string]: unknown;");
    } else {
      for (const column of table.columns) {
        const tsType = sqlTypeToTs(column.sqlType);
        const optional = shouldBeOptional(column.isNullable, column.hasDefault) ? "?" : "";
        const propName = formatPropertyName(column.name);
        lines.push(`  ${propName}${optional}: ${tsType}; // ${column.rawLine}`);
      }
    }
    lines.push("}", "");
  }

  const outputPath = path.resolve(process.cwd(), "src", "types", "jotbox.ts");
  await fs.writeFile(outputPath, lines.join("\n"), "utf8");
  console.log(`Generated ${tables.length} interfaces at ${outputPath}`);
}

generate().catch((error) => {
  console.error("Failed to generate types", error);
  process.exit(1);
});
