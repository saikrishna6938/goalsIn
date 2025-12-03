import type { Db, Document } from "mongodb";
import type { ColumnDefinition, TableDefinition } from "./sqlSchemaParser";

export interface CollectionResult {
  name: string;
  created?: boolean;
  updated?: boolean;
  skipped?: boolean;
  message?: string;
  required: string[];
}

const sqlToBsonType = (column: ColumnDefinition): string => {
  const normalized = column.sqlType.toLowerCase();
  const raw = column.rawLine.toLowerCase();

  if (normalized.startsWith("tinyint(1)")) {
    return "bool";
  }

  if (normalized.startsWith("bigint")) {
    return "long";
  }

  if (
    normalized.startsWith("int") ||
    normalized.startsWith("smallint") ||
    normalized.startsWith("mediumint")
  ) {
    return "int";
  }

  if (
    normalized.includes("decimal") ||
    normalized.includes("float") ||
    normalized.includes("double")
  ) {
    return "double";
  }

  if (normalized.includes("date") || normalized.includes("time")) {
    return "date";
  }

  if (normalized.includes("json") || raw.includes("json_valid")) {
    return "object";
  }

  if (
    normalized.includes("text") ||
    normalized.includes("varchar") ||
    normalized.includes("char") ||
    normalized.includes("enum")
  ) {
    return "string";
  }

  return "string";
};

const buildValidator = (table: TableDefinition): Document => {
  const required = table.columns
    .filter((column) => !column.isNullable && !column.hasDefault)
    .map((column) => column.name);

  const properties: Record<string, Document> = {};

  for (const column of table.columns) {
    properties[column.name] = {
      bsonType: sqlToBsonType(column),
      description: column.rawLine,
    };
  }

  const schema: Document = {
    bsonType: "object",
    title: table.name,
    properties,
  };

  if (required.length > 0) {
    schema.required = required;
  }

  return { $jsonSchema: schema };
};

export const ensureCollections = async (
  db: Db,
  tables: TableDefinition[]
): Promise<CollectionResult[]> => {
  const existingCollections = await db
    .listCollections({}, { nameOnly: true })
    .toArray();
  const existingNames = new Set(existingCollections.map((col) => col.name));

  const results: CollectionResult[] = [];

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
      } catch (error) {
        results.push({
          name: table.name,
          skipped: true,
          required: validator.$jsonSchema.required || [],
          message: (error as Error).message,
        });
      }
    } else {
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
