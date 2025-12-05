import { Request, Response } from "express";
import { getMongoDb } from "../config/mongo";
import type { Notes, Tasks, Users } from "../types/jotbox";

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

class NotesController {
  private async notes() {
    const db = await getMongoDb();
    return db.collection<Notes>("Notes");
  }

  private async tasks() {
    const db = await getMongoDb();
    return db.collection<Tasks>("Tasks");
  }

  private async users() {
    const db = await getMongoDb();
    return db.collection<Users>("Users");
  }

  private async nextId() {
    const collection = await this.notes();
    const doc = await collection.find({}, { projection: { noteId: 1 } }).sort({ noteId: -1 }).limit(1).next();
    return ((doc?.noteId as number | undefined) ?? 0) + 1;
  }

  addNote = async (req: Request, res: Response) => {
    try {
      const noteUserId = toNumber(req.body?.noteUserId);
      const noteTaskId = toNumber(req.body?.noteTaskId);
      if (noteUserId === null || noteTaskId === null) {
        return res.status(400).json({ message: "noteUserId and noteTaskId are required" });
      }
      const noteTypeId = toNumber(req.body?.noteTypeId) ?? 1;
      const noteComment = typeof req.body?.noteComment === "string" ? req.body.noteComment : "";
      const noteMentions = req.body?.noteMentions ?? [];
      const collection = await this.notes();
      const noteId = await this.nextId();
      await collection.insertOne({
        noteId,
        noteUserId,
        noteComment,
        noteTypeId,
        noteMentions: JSON.stringify(noteMentions),
        noteTaskId,
        noteCreated: new Date() as any,
      } as Notes);
      return res.status(200).json({ message: "Note added successfully", noteId });
    } catch (error) {
      console.error("addNote error", error);
      return res.status(500).json({ message: "Error adding the note", error });
    }
  };

  deleteNote = async (req: Request, res: Response) => {
    try {
      const noteId = toNumber(req.params?.noteId);
      if (noteId === null) {
        return res.status(400).json({ message: "noteId is required" });
      }
      const collection = await this.notes();
      await collection.deleteOne({ noteId });
      return res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
      console.error("deleteNote error", error);
      return res.status(500).json({ message: "Error deleting the note", error });
    }
  };

  MarkAllNotesAsRead = async (_req: Request, res: Response) => {
    return res.status(200).json({ status: true, message: "Success" });
  };

  getNotesByTaskId = async (req: Request, res: Response) => {
    try {
      const taskId = toNumber(req.params?.taskId);
      if (taskId === null) {
        return res.status(400).json({ message: "taskId is required" });
      }
      const db = await getMongoDb();
      const pipeline = [
        { $match: { noteTaskId: taskId } },
        {
          $lookup: {
            from: "Users",
            localField: "noteUserId",
            foreignField: "userId",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            noteId: 1,
            noteUserId: 1,
            noteComment: 1,
            noteTypeId: 1,
            noteMentions: 1,
            noteTaskId: 1,
            noteCreated: 1,
            userFirstName: "$user.userFirstName",
            userLastName: "$user.userLastName",
          },
        },
      ];
      const docs = await db.collection("Notes").aggregate(pipeline).toArray();
      return res.status(200).json({ status: true, message: "Success", data: docs });
    } catch (error) {
      console.error("getNotesByTaskId error", error);
      return res.status(500).json({ message: "Error fetching notes", error });
    }
  };
}

export const notesController = new NotesController();
