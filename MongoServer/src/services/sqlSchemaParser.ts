import fs from "fs/promises";

export interface ColumnDefinition {
  name: string;
  sqlType: string;
  isNullable: boolean;
  hasDefault: boolean;
  rawLine: string;
}

export interface TableDefinition {
  name: string;
  columns: ColumnDefinition[];
  rawBody: string;
}

const COLUMN_IGNORE_PREFIXES = [
  "primary key",
  "unique key",
  "key ",
  "constraint",
  "index ",
  "fulltext",
  "spatial",
];

export const readSqlFile = async (filePath: string): Promise<string> => {
  return fs.readFile(filePath, "utf8");
};

export const parseSqlSchema = (sql: string): TableDefinition[] => {
  const regex = /CREATE TABLE `([^`]+)` \(([^;]*?)\)\s*ENGINE/gi;
  const tables: TableDefinition[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(sql)) !== null) {
    const [, tableName, body] = match;
    const lines = body
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => Boolean(line));

    const columns: ColumnDefinition[] = [];

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
      if (!columnMatch) continue;

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
