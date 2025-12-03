import { Request, Response } from "express";
import { getMongoDb } from "../config/mongo";
import type {
  DataTables,
  DocumentGroup,
  DocumentGroupType,
  DocumentType,
} from "../types/jotbox";

const normalizeString = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.trim().length) {
    return value.trim();
  }
  return undefined;
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

class WebsiteController {
  getDocumentGroups = async (_req: Request, res: Response) => {
    try {
      const db = await getMongoDb();
      const [groups, types] = await Promise.all([
        db.collection<DocumentGroup>("DocumentGroup").find({}, { projection: { _id: 0 } }).toArray(),
        db.collection<DocumentGroupType>("DocumentGroupType").find({}, { projection: { _id: 0 } }).toArray(),
      ]);
      const typeMap = new Map(types.map((type) => [type.groupTypeId, type]));
      const data = groups.map((group) => ({
        ...group,
        groupType: group.groupTypeId ? typeMap.get(group.groupTypeId) ?? null : null,
      }));
      return res.json({ success: true, data });
    } catch (error) {
      console.error("getDocumentGroups error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  searchDetails = async (req: Request, res: Response) => {
    try {
      const { documentTypeId, search } = req.body || {};
      const numericDocTypeId = toNumber(documentTypeId);
      if (numericDocTypeId === null) {
        return res.status(400).json({ success: false, message: "documentTypeId is required" });
      }
      const db = await getMongoDb();
      const documentType = await db
        .collection<DocumentType>("DocumentType")
        .findOne({ documentTypeId: numericDocTypeId });
      if (!documentType?.documentTypeTableId) {
        return res.status(404).json({ success: false, message: "Document type table not configured" });
      }
      const dataTable = await db
        .collection<DataTables>("DataTables")
        .findOne({ tableId: documentType.documentTypeTableId });
      const tableName = dataTable?.tableName;
      if (!tableName) {
        return res.status(404).json({ success: false, message: "Data table not found" });
      }
      const query: Record<string, unknown> = {};
      if (search && typeof search === "object") {
        Object.entries(search).forEach(([key, value]) => {
          const normalized = normalizeString(value);
          if (normalized !== undefined) {
            query[key] = { $regex: normalized, $options: "i" };
          }
        });
      }
      const collection = db.collection(tableName);
      const items = await collection.find(query).limit(100).toArray();
      return res.json({ success: true, data: items });
    } catch (error) {
      console.error("searchDetails error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}

export const websiteController = new WebsiteController();
