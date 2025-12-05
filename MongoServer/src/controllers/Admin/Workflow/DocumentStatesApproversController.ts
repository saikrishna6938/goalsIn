import { Request, Response } from "express";
import { getMongoDb } from "../../../config/mongo";
import type { DocumentStatesApprovers } from "../../../types/jotbox";

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const nextId = async (collection: any) => {
  const doc = await collection
    .find({}, { projection: { documentStatesApproversId: 1 } })
    .sort({ documentStatesApproversId: -1 })
    .limit(1)
    .next();
  return ((doc?.documentStatesApproversId as number | undefined) ?? 0) + 1;
};

export class DocumentStatesApproversController {
  private async collection() {
    const db = await getMongoDb();
    return db.collection<DocumentStatesApprovers>("DocumentStatesApprovers");
  }

  getApproversByDocumentState = async (req: Request, res: Response) => {
    try {
      const documentStateId = toNumber(req.params?.documentStateId);
      if (documentStateId === null) {
        return res.status(400).json({ message: "documentStateId is required" });
      }
      const collection = await this.collection();
      const docs = await collection.find({ documentStatesId: documentStateId }, { projection: { _id: 0 } }).toArray();
      return res.json(docs);
    } catch (error) {
      console.error("getApproversByDocumentState error", error);
      return res.status(500).json({ message: "Failed to fetch approvers" });
    }
  };

  addApproversToDocumentState = async (req: Request, res: Response) => {
    try {
      const documentStatesId = toNumber(req.body?.documentStatesId);
      const roleNameIds: number[] = Array.isArray(req.body?.roleNameIds)
        ? req.body.roleNameIds.map((id: any) => Number(id)).filter(Number.isFinite)
        : [];
      if (documentStatesId === null || !roleNameIds.length) {
        return res.status(400).json({ message: "documentStatesId and roleNameIds are required" });
      }
      const collection = await this.collection();
      const docs: DocumentStatesApprovers[] = [];
      for (const roleNameId of roleNameIds) {
        docs.push({
          documentStatesApproversId: await nextId(collection),
          documentStatesId,
          roleNameId,
        } as DocumentStatesApprovers);
      }
      await collection.insertMany(docs);
      return res.status(201).json({ message: "Approvers added" });
    } catch (error) {
      console.error("addApproversToDocumentState error", error);
      return res.status(500).json({ message: "Failed to add approvers" });
    }
  };

  deleteApproversFromDocumentState = async (req: Request, res: Response) => {
    try {
      const documentStatesId = toNumber(req.body?.documentStatesId);
      const roleNameIds: number[] = Array.isArray(req.body?.roleNameIds)
        ? req.body.roleNameIds.map((id: any) => Number(id)).filter(Number.isFinite)
        : [];
      if (documentStatesId === null || !roleNameIds.length) {
        return res.status(400).json({ message: "documentStatesId and roleNameIds are required" });
      }
      const collection = await this.collection();
      const result = await collection.deleteMany({
        documentStatesId,
        roleNameId: { $in: roleNameIds },
      });
      return res.json({ message: "Approvers deleted", deletedCount: result.deletedCount ?? 0 });
    } catch (error) {
      console.error("deleteApproversFromDocumentState error", error);
      return res.status(500).json({ message: "Failed to delete approvers" });
    }
  };
}
