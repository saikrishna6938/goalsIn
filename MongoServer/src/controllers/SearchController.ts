import { Request, Response } from "express";
import { getMongoDb } from "../config/mongo";
import type { DocumentType, DataTables, Tasks } from "../types/jotbox";

interface FieldDefinition {
  name: string;
  expression?: string;
}

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const parseFields = (fields: string): FieldDefinition[] => {
  try {
    const parsed = JSON.parse(fields);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    return [];
  }
  return [];
};

class SearchController {
  private async documentTypes() {
    const db = await getMongoDb();
    return db.collection<DocumentType>("DocumentType");
  }

  private async dataTables() {
    const db = await getMongoDb();
    return db.collection<DataTables>("DataTables");
  }

  private async tasks() {
    const db = await getMongoDb();
    return db.collection<Tasks>("Tasks");
  }

  private tableCollectionName(tableName: string) {
    return `datatable_${tableName.replace(/[^a-zA-Z0-9_]/g, "")}`;
  }

  SearchDocumentTable = async (req: Request, res: Response) => {
    try {
      const documentTypeId = toNumber(req.body?.documentTypeId);
      const search = typeof req.body?.search === "object" && req.body.search ? req.body.search : {};
      const userId = toNumber(req.body?.userId);
      if (documentTypeId === null || userId === null) {
        return res.status(400).json({ status: false, message: "Required parameters not provided" });
      }
      const documentTypes = await this.documentTypes();
      const docType = await documentTypes.findOne(
        { documentTypeId },
        { projection: { documentTypeTableId: 1 } }
      );
      const dataTableId = docType?.documentTypeTableId;
      if (typeof dataTableId !== "number") {
        return res.status(404).json({ status: false, message: "Document type not found" });
      }
      const dataTables = await this.dataTables();
      const dataTable = await dataTables.findOne(
        { tableId: dataTableId },
        { projection: { tableName: 1, fields: 1 } }
      );
      if (!dataTable) {
        return res.status(404).json({ status: false, message: "DataTable not found" });
      }
      const fields = parseFields(dataTable.fields);
      const filters: Record<string, unknown>[] = [];
      for (const [field, value] of Object.entries(search)) {
        const definition = fields.find((f) => f.name === field);
        if (!definition) continue;
        const expression = definition.expression || "equal";
        if (expression === "like") {
          filters.push({ [field]: { $regex: String(value), $options: "i" } });
        } else if (expression === "greater") {
          filters.push({ [field]: { $gte: value } });
        } else if (expression === "lesser") {
          filters.push({ [field]: { $lte: value } });
        } else {
          filters.push({ [field]: value });
        }
      }
      const db = await getMongoDb();
      const tableCollection = db.collection(this.tableCollectionName(dataTable.tableName));
      const query = filters.length ? { $and: filters } : {};
      const rows = await tableCollection.find(query, { projection: { _id: 0 } }).toArray();
      const tasksCollection = await this.tasks();
      const taskDocs = await tasksCollection.find({ userId }, { projection: { taskTagId: 1 } }).toArray();
      const excludedIds = new Set(
        taskDocs
          .map((doc) => toNumber(doc.taskTagId))
          .filter((value): value is number => value !== null)
      );
      const data = rows.filter((row: any) => {
        if (!("Id" in row)) return true;
        const rowId = toNumber(row.Id);
        if (rowId === null) return true;
        return !excludedIds.has(rowId);
      });
      return res.json({
        status: true,
        message: `Search results for ${dataTable.tableName}`,
        data,
        fields,
      });
    } catch (error) {
      console.error("SearchDocumentTable error", error);
      return res.status(500).json({ status: false, message: "Internal server error" });
    }
  };
}

export const searchController = new SearchController();
