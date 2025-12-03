import { Request, Response } from "express";
import { Collection } from "mongodb";
import { getMongoDb } from "../config/mongo";
import type {
  Tasks,
  TaskEntities,
  TaskWorkflow,
  Notes,
  History,
  DocumentType,
  WorkflowDocumentTypes,
  DocumentStates,
  Users,
} from "../types/jotbox";

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const normalizeString = (value: any): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }
  return undefined;
};

const parseCsvNumbers = (value: string | undefined): number[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((token) => Number(token.trim()))
    .filter((num) => Number.isFinite(num));
};

const formatTaskUsers = (users: Array<number | string>): string => {
  return Array.from(
    new Set(
      users
        .map((user) => Number(user))
        .filter((num) => Number.isFinite(num) && num > 0)
    )
  ).join(",") || "1";
};

class TasksController {
  private async tasks(): Promise<Collection<Tasks>> {
    const db = await getMongoDb();
    return db.collection<Tasks>("Tasks");
  }

  private async taskEntities(): Promise<Collection<TaskEntities>> {
    const db = await getMongoDb();
    return db.collection<TaskEntities>("TaskEntities");
  }

  private async taskWorkflow(): Promise<Collection<TaskWorkflow>> {
    const db = await getMongoDb();
    return db.collection<TaskWorkflow>("TaskWorkflow");
  }

  private async notes(): Promise<Collection<Notes>> {
    const db = await getMongoDb();
    return db.collection<Notes>("Notes");
  }

  private async history(): Promise<Collection<History>> {
    const db = await getMongoDb();
    return db.collection<History>("History");
  }

  private async documentTypes(): Promise<Collection<DocumentType>> {
    const db = await getMongoDb();
    return db.collection<DocumentType>("DocumentType");
  }

  private async workflowDocumentTypes(): Promise<Collection<WorkflowDocumentTypes>> {
    const db = await getMongoDb();
    return db.collection<WorkflowDocumentTypes>("WorkflowDocumentTypes");
  }

  private async documentStates(): Promise<Collection<DocumentStates>> {
    const db = await getMongoDb();
    return db.collection<DocumentStates>("DocumentStates");
  }

  private async users(): Promise<Collection<Users>> {
    const db = await getMongoDb();
    return db.collection<Users>("Users");
  }

  private async nextId(collection: Collection<any>, field: string) {
    const doc = await collection.find({}, { projection: { [field]: 1 } }).sort({ [field]: -1 }).limit(1).next();
    return ((doc?.[field] as number | undefined) ?? 0) + 1;
  }

  private async defaultDocumentStateId(documentTypeId: number): Promise<number> {
    try {
      const workflowDocs = await this.workflowDocumentTypes();
      const mapping = await workflowDocs.findOne({ DocumentTypeID: documentTypeId });
      if (!mapping) return 1;
      const statesCollection = await this.documentStates();
      const state = await statesCollection.findOne(
        { workflowID: mapping.workflowID, steps: 1 },
        { projection: { documentStateId: 1 } }
      );
      return state?.documentStateId ?? 1;
    } catch {
      return 1;
    }
  }

  private async insertTaskTimeline(taskId: number, userId: number) {
    const now = new Date();
    const notesCollection = await this.notes();
    const historyCollection = await this.history();
    const workflowCollection = await this.taskWorkflow();
    await notesCollection.insertOne({
      noteId: await this.nextId(notesCollection, "noteId"),
      noteCreated: now as any,
      noteUserId: userId,
      noteComment: "",
      noteTypeId: 1,
      noteMentions: "",
      noteTaskId: taskId,
    } as Notes);
    await historyCollection.insertOne({
      historyId: await this.nextId(historyCollection, "historyId"),
      historyTypeId: 1,
      historyUserId: userId,
      historyCreatedDate: now as any,
      historyTaskId: taskId,
    } as History);
    await workflowCollection.insertOne({
      taskWorkflowId: await this.nextId(workflowCollection, "taskWorkflowId"),
      taskId,
      taskSelectedOption: "Workflow Started",
      taskNote: "Task Created",
      taskWorkflowDate: now as any,
      taskUserId: userId,
      taskActionId: 1,
    } as TaskWorkflow);
  }

  private async createTaskDocument(body: any, res: Response) {
    const documentTypeId = toNumber(body?.documentTypeId);
    const userId = toNumber(body?.userId);
    if (documentTypeId === null || userId === null) {
      return res.status(400).json({ success: false, message: "documentTypeId and userId are required" });
    }
    const taskName = normalizeString(body?.taskName) ?? "Task";
    const documentTypeAnswersId = toNumber(body?.answerObjectId);
    const taskTableId = toNumber(body?.taskTableId) ?? -1;
    const taskTagId = toNumber(body?.taskTagId) ?? -1;
    const entityId = toNumber(body?.entityId) ?? 1;
    const documentStateId = await this.defaultDocumentStateId(documentTypeId);
    const tasksCollection = await this.tasks();
    const taskId = await this.nextId(tasksCollection, "taskId");
    const doc: Tasks = {
      taskId,
      taskName,
      documentTypeAnswersId: documentTypeAnswersId ?? undefined,
      documentTypeId,
      userId,
      attachments: "",
      taskTableId,
      taskTagId,
      taskUsers: formatTaskUsers([userId]),
      documentStateId,
      createdDate: new Date() as any,
      updatedDate: new Date() as any,
    };
    await tasksCollection.insertOne(doc);
    const taskEntities = await this.taskEntities();
    await taskEntities.insertOne({
      id: await this.nextId(taskEntities, "id"),
      taskEntityId: entityId === -1 ? 1 : entityId,
      taskId,
    });
    await this.insertTaskTimeline(taskId, userId);
    return taskId;
  }

  getTasksByDocumentType = async (req: Request, res: Response) => {
    try {
      const documentTypeId = toNumber(req.params.documentTypeId);
      if (documentTypeId === null) {
        return res.status(400).json({ status: false, message: "Invalid documentTypeId" });
      }
      const tasksCollection = await this.tasks();
      const data = await tasksCollection.find({ documentTypeId }, { projection: { _id: 0 } }).toArray();
      return res.json({ status: true, message: "Success", data });
    } catch (error) {
      console.error("getTasksByDocumentType error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  getTasksByUserId = async (req: Request, res: Response) => {
    try {
      const userId = toNumber(req.params.userId);
      const documentTypeId = toNumber(req.params.documentTypeId);
      if (userId === null || documentTypeId === null) {
        return res.status(400).json({ status: false, message: "Invalid parameters" });
      }
      const tasksCollection = await this.tasks();
      const data = await tasksCollection
        .find({ userId, documentTypeId }, { projection: { _id: 0, taskId: 1, taskName: 1, documentTypeId: 1 } })
        .toArray();
      return res.json({ status: true, message: "Success", data });
    } catch (error) {
      console.error("getTasksByUserId error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  getUserTasksFrontEnd = async (req: Request, res: Response) => {
    try {
      const userId = toNumber(req.params.userId);
      if (userId === null) {
        return res.status(400).json({ status: false, message: "Invalid userId" });
      }
      const tasksCollection = await this.tasks();
      const data = await tasksCollection.find({ userId }, { projection: { _id: 0 } }).toArray();
      return res.json({ status: true, message: "Success", data });
    } catch (error) {
      console.error("getUserTasksFrontEnd error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  getAssignTasksByUserId = async (req: Request, res: Response) => {
    try {
      const userId = toNumber(req.params.userId);
      if (userId === null) {
        return res.status(400).json({ status: false, message: "Invalid userId" });
      }
      const regex = new RegExp(`(^|,)${userId}(,|$)`);
      const tasksCollection = await this.tasks();
      const docs = await tasksCollection
        .find({ $or: [{ userId }, { taskUsers: { $regex: regex } }] }, { projection: { _id: 0 } })
        .toArray();
      const docTypes = await this.documentTypes();
      const typeMap = new Map<number, string>();
      const grouped: Record<string, Tasks[]> = {};
      for (const task of docs) {
        const typeId = task.documentTypeId ?? -1;
        if (!typeMap.has(typeId) && typeId !== -1) {
          const doc = await docTypes.findOne(
            { documentTypeId: typeId },
            { projection: { documentTypeName: 1 } }
          );
          typeMap.set(typeId, doc?.documentTypeName ?? "Unknown");
        }
        const key = typeMap.get(typeId) ?? "Unknown";
        grouped[key] = grouped[key] || [];
        grouped[key].push(task);
      }
      return res.json({ status: true, message: "Success", data: grouped });
    } catch (error) {
      console.error("getAssignTasksByUserId error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  getTaskByTaskId = async (req: Request, res: Response) => {
    try {
      const taskId = toNumber(req.params.taskId);
      if (taskId === null) {
        return res.status(400).json({ status: false, message: "Invalid taskId" });
      }
      const tasksCollection = await this.tasks();
      const task = await tasksCollection.findOne({ taskId }, { projection: { _id: 0 } });
      if (!task) {
        return res.json({ status: true, message: "Success", data: {} });
      }
      const usersCollection = await this.users();
      const userIds = parseCsvNumbers(task.taskUsers);
      const userDocs = userIds.length
        ? await usersCollection
            .find({ userId: { $in: userIds } }, { projection: { _id: 0, userId: 1, userFirstName: 1, userLastName: 1, entities: 1 } })
            .toArray()
        : [];
      const taskEntitiesCollection = await this.taskEntities();
      const entity = await taskEntitiesCollection.findOne({ taskId }, { projection: { taskEntityId: 1 } });
      return res.json({
        status: true,
        message: "Success",
        data: {
          ...task,
          taskUsers: userDocs,
          taskEntity: entity?.taskEntityId ?? null,
        },
      });
    } catch (error) {
      console.error("getTaskByTaskId error", error);
      return res.status(500).json({ status: false, message: "No Task Found" });
    }
  };

  checkUserAccess = async (req: Request, res: Response) => {
    try {
      const taskId = toNumber(req.body?.taskId);
      const userId = toNumber(req.body?.userId);
      if (taskId === null || userId === null) {
        return res.status(400).json({ success: false, message: "Both taskId and userId are required" });
      }
      const tasksCollection = await this.tasks();
      const task = await tasksCollection.findOne({ taskId }, { projection: { _id: 0 } });
      if (!task) {
        return res.status(404).json({ success: false, message: "Task not found" });
      }
      const allowed = task.userId === userId || parseCsvNumbers(task.taskUsers).includes(userId);
      if (!allowed) {
        return res.status(200).json({ status: false, message: "Access denied" });
      }
      return res.status(200).json({ status: true, message: "Access granted", data: task });
    } catch (error) {
      console.error("checkUserAccess error", error);
      return res.status(500).json({ status: false, message: "An error occurred while validating access" });
    }
  };

  getTasksByTaskIds = async (req: Request, res: Response) => {
    try {
      const ids: unknown[] = Array.isArray(req.body?.taskIds) ? req.body.taskIds : [];
      const taskIds = ids
        .map((value: unknown) => toNumber(value))
        .filter((value): value is number => value !== null);
      if (!taskIds.length) {
        return res.json({ status: true, message: "Success", data: [] });
      }
      const tasksCollection = await this.tasks();
      const data = await tasksCollection.find({ taskId: { $in: taskIds } }, { projection: { _id: 0 } }).toArray();
      return res.json({ status: true, message: "Success", data });
    } catch (error) {
      console.error("getTasksByTaskIds error", error);
      return res.status(500).json({ status: false, message: "No Task Found" });
    }
  };

  updateTaskUsers = async (req: Request, res: Response) => {
    try {
      const taskId = toNumber(req.body?.taskId);
      const taskUsers = req.body?.taskUsers;
      if (taskId === null || typeof taskUsers !== "string") {
        return res.status(400).json({ success: false, message: "taskId and taskUsers are required" });
      }
      const tasksCollection = await this.tasks();
      const result = await tasksCollection.updateOne({ taskId }, { $set: { taskUsers } });
      if (!result.matchedCount) {
        return res.status(404).json({ success: false, message: "Task not found" });
      }
      return res.json({ status: true, message: "Success", data: { taskId, taskUsers } });
    } catch (error) {
      console.error("updateTaskUsers error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  getTaskActions = async (_req: Request, res: Response) => {
    return res.json({ status: true, message: "Success", data: [] });
  };

  getTaskUsers = async (req: Request, res: Response) => {
    try {
      const taskId = toNumber(req.body?.taskId);
      if (taskId === null) {
        return res.status(400).json({ status: false, message: "taskId is required" });
      }
      const tasksCollection = await this.tasks();
      const task = await tasksCollection.findOne({ taskId }, { projection: { taskUsers: 1 } });
      if (!task) {
        return res.json({ status: true, message: "Success", data: [] });
      }
      const ids = parseCsvNumbers(task.taskUsers);
      if (!ids.length) {
        return res.json({ status: true, message: "Success", data: [] });
      }
      const usersCollection = await this.users();
      const docs = await usersCollection
        .find({ userId: { $in: ids } }, { projection: { _id: 0, userId: 1, userFirstName: 1, userLastName: 1 } })
        .toArray();
      return res.json({ status: true, message: "Success", data: docs });
    } catch (error) {
      console.error("getTaskUsers error", error);
      return res.status(500).json({ status: false, message: "Internal server error" });
    }
  };

  addTask = async (req: Request, res: Response) => {
    try {
      const taskId = await this.createTaskDocument(req.body, res);
      if (typeof taskId === "number") {
        return res.json({ success: true, message: "New task created successfully", taskId });
      }
    } catch (error) {
      console.error("addTask error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  indexDocument = async (req: Request, res: Response) => {
    try {
      const taskId = await this.createTaskDocument(req.body, res);
      if (typeof taskId === "number") {
        return res.json({ success: true, message: "New task created successfully", taskId });
      }
    } catch (error) {
      console.error("indexDocument error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  updateTask = async (req: Request, res: Response) => {
    try {
      const taskId = toNumber(req.params.taskId);
      if (taskId === null) {
        return res.status(400).json({ success: false, message: "Invalid taskId" });
      }
      const updates = req.body ?? {};
      const forbidden = new Set(["taskId", "_id", "createdDate"]);
      const payload: Record<string, any> = {};
      Object.entries(updates).forEach(([key, value]) => {
        if (!forbidden.has(key) && value !== undefined && value !== null) {
          payload[key] = value;
        }
      });
      if (!Object.keys(payload).length) {
        return res.status(400).json({ success: false, message: "No valid fields to update" });
      }
      payload.updatedDate = new Date() as any;
      const tasksCollection = await this.tasks();
      const result = await tasksCollection.updateOne({ taskId }, { $set: payload });
      if (!result.matchedCount) {
        return res.status(404).json({ success: false, message: "Task not found" });
      }
      return res.json({ success: true, message: "Task updated successfully", taskId });
    } catch (error) {
      console.error("updateTask error", error);
      return res.status(500).json({ success: false, message: "Error updating task" });
    }
  };
}

export const tasksController = new TasksController();
