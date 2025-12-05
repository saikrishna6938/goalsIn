"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notesController = void 0;
const mongo_1 = require("../config/mongo");
const toNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value.trim());
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};
class NotesController {
    constructor() {
        this.addNote = async (req, res) => {
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
                    noteCreated: new Date(),
                });
                return res.status(200).json({ message: "Note added successfully", noteId });
            }
            catch (error) {
                console.error("addNote error", error);
                return res.status(500).json({ message: "Error adding the note", error });
            }
        };
        this.deleteNote = async (req, res) => {
            try {
                const noteId = toNumber(req.params?.noteId);
                if (noteId === null) {
                    return res.status(400).json({ message: "noteId is required" });
                }
                const collection = await this.notes();
                await collection.deleteOne({ noteId });
                return res.status(200).json({ message: "Note deleted successfully" });
            }
            catch (error) {
                console.error("deleteNote error", error);
                return res.status(500).json({ message: "Error deleting the note", error });
            }
        };
        this.MarkAllNotesAsRead = async (_req, res) => {
            return res.status(200).json({ status: true, message: "Success" });
        };
        this.getNotesByTaskId = async (req, res) => {
            try {
                const taskId = toNumber(req.params?.taskId);
                if (taskId === null) {
                    return res.status(400).json({ message: "taskId is required" });
                }
                const db = await (0, mongo_1.getMongoDb)();
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
            }
            catch (error) {
                console.error("getNotesByTaskId error", error);
                return res.status(500).json({ message: "Error fetching notes", error });
            }
        };
    }
    async notes() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("Notes");
    }
    async tasks() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("Tasks");
    }
    async users() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("Users");
    }
    async nextId() {
        const collection = await this.notes();
        const doc = await collection.find({}, { projection: { noteId: 1 } }).sort({ noteId: -1 }).limit(1).next();
        return (doc?.noteId ?? 0) + 1;
    }
}
exports.notesController = new NotesController();
