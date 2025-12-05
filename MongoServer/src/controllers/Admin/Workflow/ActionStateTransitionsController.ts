import { Request, Response } from "express";
import { getMongoDb } from "../../../config/mongo";
import type { ActionStateTransitions } from "../../../types/jotbox";

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
    .find({}, { projection: { transitionId: 1 } })
    .sort({ transitionId: -1 })
    .limit(1)
    .next();
  return ((doc?.transitionId as number | undefined) ?? 0) + 1;
};

export class ActionStateTransitionsController {
  private async collection() {
    const db = await getMongoDb();
    return db.collection<ActionStateTransitions>("ActionStateTransitions");
  }

  getTransitionsByAction = async (req: Request, res: Response) => {
    try {
      const actionId = toNumber(req.params?.actionId);
      if (actionId === null) {
        return res.status(400).json({ message: "actionId is required" });
      }
      const collection = await this.collection();
      const docs = await collection.find({ actionId }, { projection: { _id: 0 } }).toArray();
      return res.json(docs);
    } catch (error) {
      console.error("getTransitionsByAction error", error);
      return res.status(500).json({ message: "Failed to fetch transitions" });
    }
  };

  addTransition = async (req: Request, res: Response) => {
    try {
      const actionId = toNumber(req.body?.actionId);
      const fromStateId = toNumber(req.body?.fromStateId);
      const toStateId = toNumber(req.body?.toStateId);
      if (actionId === null || toStateId === null) {
        return res.status(400).json({ message: "actionId and toStateId are required" });
      }
      const collection = await this.collection();
      await collection.insertOne({
        transitionId: await nextId(collection),
        actionId,
        fromStateId: fromStateId ?? undefined,
        toStateId,
      } as ActionStateTransitions);
      return res.status(201).json({ message: "Transition added" });
    } catch (error) {
      console.error("addTransition error", error);
      return res.status(500).json({ message: "Failed to add transition" });
    }
  };

  updateTransition = async (req: Request, res: Response) => {
    try {
      const transitionId = toNumber(req.body?.transitionId);
      if (transitionId === null) {
        return res.status(400).json({ message: "transitionId is required" });
      }
      const updates: Partial<ActionStateTransitions> = {};
      const actionId = toNumber(req.body?.actionId);
      const fromStateId = toNumber(req.body?.fromStateId);
      const toStateId = toNumber(req.body?.toStateId);
      if (actionId !== null) updates.actionId = actionId;
      if (fromStateId !== null) updates.fromStateId = fromStateId;
      if (toStateId !== null) updates.toStateId = toStateId;
      if (!Object.keys(updates).length) {
        return res.status(400).json({ message: "No fields to update" });
      }
      const collection = await this.collection();
      const result = await collection.updateOne({ transitionId }, { $set: updates });
      if (!result.matchedCount) {
        return res.status(404).json({ message: "Transition not found" });
      }
      return res.json({ message: "Transition updated" });
    } catch (error) {
      console.error("updateTransition error", error);
      return res.status(500).json({ message: "Failed to update transition" });
    }
  };

  deleteTransition = async (req: Request, res: Response) => {
    try {
      const transitionId = toNumber(req.body?.transitionId);
      if (transitionId === null) {
        return res.status(400).json({ message: "transitionId is required" });
      }
      const collection = await this.collection();
      const result = await collection.deleteOne({ transitionId });
      if (!result.deletedCount) {
        return res.status(404).json({ message: "Transition not found" });
      }
      return res.json({ message: "Transition deleted" });
    } catch (error) {
      console.error("deleteTransition error", error);
      return res.status(500).json({ message: "Failed to delete transition" });
    }
  };
}
