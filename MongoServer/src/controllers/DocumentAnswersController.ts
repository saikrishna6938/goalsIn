import { Request, Response } from "express";
import type { Collection } from "mongodb";
import { getMongoDb } from "../config/mongo";
import type {
  DocumentType,
  DocumentTypeAnswers,
  DocumentTagAnswers,
  DocumentTypeObject,
  DocumentGroup,
  DocumentGroupType,
  Tasks,
  Users,
  UserDocumentsPermission,
} from "../types/jotbox";
import { getIndexName } from "./Tasks/groupIndexType";

type DocumentTypeAnswersDoc = DocumentTypeAnswers & {
  documentTypeAnswersObject?: unknown;
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const parseCsvNumbers = (value: string | undefined): number[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((token) => Number(token.trim()))
    .filter((num) => Number.isFinite(num));
};

const periodStartDate = (value: unknown): Date | undefined => {
  const normalized = toNumber(value);
  if (!normalized) return undefined;
  const allowed = new Set([3, 6, 9, 12]);
  if (!allowed.has(normalized)) return undefined;
  const date = new Date();
  date.setMonth(date.getMonth() - normalized);
  return date;
};

const parseDocumentTypeObject = (value: unknown): unknown => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

class DocumentAnswersController {
  private async documentTypeAnswers(): Promise<Collection<DocumentTypeAnswersDoc>> {
    const db = await getMongoDb();
    return db.collection<DocumentTypeAnswersDoc>("DocumentTypeAnswers");
  }

  private async documentTagAnswers(): Promise<Collection<DocumentTagAnswers>> {
    const db = await getMongoDb();
    return db.collection<DocumentTagAnswers>("DocumentTagAnswers");
  }

  private async tasks(): Promise<Collection<Tasks>> {
    const db = await getMongoDb();
    return db.collection<Tasks>("Tasks");
  }

  private async users(): Promise<Collection<Users>> {
    const db = await getMongoDb();
    return db.collection<Users>("Users");
  }

  private async documentTypes(): Promise<Collection<DocumentType>> {
    const db = await getMongoDb();
    return db.collection<DocumentType>("DocumentType");
  }

  private async documentGroups(): Promise<Collection<DocumentGroup>> {
    const db = await getMongoDb();
    return db.collection<DocumentGroup>("DocumentGroup");
  }

  private async documentGroupTypes(): Promise<Collection<DocumentGroupType>> {
    const db = await getMongoDb();
    return db.collection<DocumentGroupType>("DocumentGroupType");
  }

  private async documentTypeObjects(): Promise<Collection<DocumentTypeObject>> {
    const db = await getMongoDb();
    return db.collection<DocumentTypeObject>("DocumentTypeObject");
  }

  private async userDocumentsPermission(): Promise<Collection<UserDocumentsPermission>> {
    const db = await getMongoDb();
    return db.collection<UserDocumentsPermission>("UserDocumentsPermission");
  }

  private async nextId(collection: Collection<any>, field: string): Promise<number> {
    const doc = await collection.find().project({ [field]: 1 }).sort({ [field]: -1 }).limit(1).next();
    return (doc?.[field] ?? 0) + 1;
  }

  private async createDocumentAnswer(req: Request, res: Response) {
    try {
      const documentTypeId = toNumber(req.body?.documentTypeId);
      const userId = toNumber(req.body?.userId);
      if (documentTypeId === null || userId === null) {
        return res.status(400).json({ status: false, message: "documentTypeId and userId are required" });
      }
      const answers = await this.documentTypeAnswers();
      const documentTypeAnswersId =
        toNumber(req.body?.documentTypeAnswersId) ?? (await this.nextId(answers, "documentTypeAnswersId"));
      const now = new Date();
      const doc: DocumentTypeAnswersDoc = {
        documentTypeAnswersId,
        documentTypeId,
        userId,
        documentTypeAnswersObject: req.body?.documentTypeAnswersObject,
        createdDate: now as any,
        updatedDate: now as any,
      };
      await answers.insertOne(doc);
      return res.json({ status: true, message: "Added Successfully", documentTypeAnswersId });
    } catch (error) {
      console.error("createDocumentAnswer error", error);
      return res.status(500).json({ status: false, message: "Failed to add document answer" });
    }
  }

  addDocumentAnswerObject = (req: Request, res: Response) => this.createDocumentAnswer(req, res);

  indexDocumentAnswerObject = (req: Request, res: Response) => this.createDocumentAnswer(req, res);

  updateDocumentAnswerObject = async (req: Request, res: Response) => {
    try {
      const documentTypeAnswersId = toNumber(req.body?.documentTypeAnswersId);
      if (documentTypeAnswersId === null) {
        return res.status(400).json({ status: false, message: "documentTypeAnswersId is required" });
      }
      const updates: Partial<DocumentTypeAnswersDoc> = {};
      if (req.body?.documentTypeAnswersObject !== undefined) {
        updates.documentTypeAnswersObject = req.body.documentTypeAnswersObject;
      }
      if (req.body?.documentTypeId !== undefined) {
        const documentTypeId = toNumber(req.body.documentTypeId);
        if (documentTypeId !== null) {
          updates.documentTypeId = documentTypeId;
        }
      }
      if (req.body?.userId !== undefined) {
        const userId = toNumber(req.body.userId);
        if (userId !== null) {
          updates.userId = userId;
        }
      }
      updates.updatedDate = new Date() as any;
      const answers = await this.documentTypeAnswers();
      const result = await answers.updateOne({ documentTypeAnswersId }, { $set: updates });
      if (!result.matchedCount) {
        return res.status(404).json({ status: false, message: "Document answer not found" });
      }
      return res.json({ status: true, message: "Updated Successfully" });
    } catch (error) {
      console.error("updateDocumentAnswerObject error", error);
      return res.status(500).json({ status: false, message: "Failed to update document answer" });
    }
  };

  getDocumentAnswerObject = async (req: Request, res: Response) => {
    try {
      const taskId = toNumber(req.body?.taskId);
      if (taskId === null) {
        return res.status(400).json({ status: false, message: "taskId is required" });
      }
      const tasks = await this.tasks();
      const task = await tasks.findOne(
        { taskId },
        {
          projection: {
            _id: 0,
            documentTypeAnswersId: 1,
            documentTypeId: 1,
            userId: 1,
          },
        }
      );
      if (!task?.documentTypeAnswersId) {
        return res.status(404).json({ status: false, message: "Task not found", data: {} });
      }
      const indexType = await getIndexName(taskId);
      if (indexType === "Index") {
        const tagAnswers = await this.documentTagAnswers();
        const doc = await tagAnswers.findOne(
          { documentTagAnswersId: task.documentTypeAnswersId },
          { projection: { _id: 0 } }
        );
        if (!doc) {
          return res.json({ status: false, message: "No records found", data: {} });
        }
        return res.json({
          status: true,
          message: "Success",
          data: {
            documentTypeAnswersId: doc.documentTagAnswersId,
            documentTypeAnswersObject: doc.documentTagAnswersObject,
            documentTypeId: task.documentTypeId ?? null,
            userId: task.userId ?? null,
            createdDate: doc.created ?? null,
            updatedDate: doc.updated ?? null,
          },
        });
      }
      const answers = await this.documentTypeAnswers();
      const doc = await answers.findOne(
        { documentTypeAnswersId: task.documentTypeAnswersId },
        { projection: { _id: 0 } }
      );
      if (!doc) {
        return res.json({ status: false, message: "No records found", data: {} });
      }
      return res.json({ status: true, message: "Success", data: doc });
    } catch (error) {
      console.error("getDocumentAnswerObject error", error);
      return res.status(500).json({ status: false, message: "Failed to get object" });
    }
  };

  getUserAndDocumentDetailsByAnswerId = async (req: Request, res: Response) => {
    try {
      const documentTypeAnswersId = toNumber(req.body?.documentTypeAnswersId);
      if (documentTypeAnswersId === null) {
        return res.status(400).json({ status: false, message: "documentTypeAnswersId is required" });
      }
      const db = await getMongoDb();
      const pipeline: any[] = [
        { $match: { documentTypeAnswersId } },
        {
          $lookup: {
            from: "Users",
            localField: "userId",
            foreignField: "userId",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "DocumentType",
            localField: "documentTypeId",
            foreignField: "documentTypeId",
            as: "documentType",
          },
        },
        { $unwind: { path: "$documentType", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "DocumentGroup",
            localField: "documentType.documentGroupId",
            foreignField: "documentGroupId",
            as: "documentGroup",
          },
        },
        { $unwind: { path: "$documentGroup", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "DocumentTypeObject",
            localField: "documentType.documentTypeObjectId",
            foreignField: "documentTypeObjectId",
            as: "documentTypeObject",
          },
        },
        { $unwind: { path: "$documentTypeObject", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            documentTypeAnswersId: 1,
            documentTypeAnswersObject: 1,
            documentTypeId: "$documentType.documentTypeId",
            documentTypeName: "$documentType.documentTypeName",
            documentTypeDescription: "$documentType.documentTypeDescription",
            documentGroupId: "$documentGroup.documentGroupId",
            groupTypeId: "$documentGroup.groupTypeId",
            documentTypeObject: "$documentTypeObject.documentTypeObject",
            userId: "$user.userId",
            userName: "$user.userName",
            Name: {
              $trim: {
                input: {
                  $concat: [
                    { $ifNull: ["$user.userFirstName", ""] },
                    " ",
                    { $ifNull: ["$user.userLastName", ""] },
                  ],
                },
              },
            },
            userEnabled: "$user.userEnabled",
            userLocked: "$user.userLocked",
            userEmail: "$user.userEmail",
            userImage: "$user.userImage",
            createdDate: "$createdDate",
            updatedDate: "$updatedDate",
          },
        },
      ];
      const doc = await db.collection("DocumentTypeAnswers").aggregate(pipeline).next();
      if (!doc) {
        return res.status(404).json({ status: false, message: "No records found", data: {} });
      }
      const parsed = {
        ...doc,
        documentTypeObject: parseDocumentTypeObject(doc.documentTypeObject),
      };
      return res.json({ status: true, message: "Success", data: parsed });
    } catch (error) {
      console.error("getUserAndDocumentDetailsByAnswerId error", error);
      return res.status(500).json({
        status: false,
        message: "Failed to get user and document details",
      });
    }
  };

  private async accessibleDocumentTypes(userId: number): Promise<number[]> {
    const users = await this.users();
    const user = await users.findOne({ userId }, { projection: { roles: 1 } });
    if (!user) return [];
    const userRoles = parseCsvNumbers(user.roles);
    if (!userRoles.length) return [];
    const documentTypes = await this.documentTypes();
    const docs = await documentTypes
      .find({}, { projection: { documentTypeId: 1, documentTypeRoles: 1, _id: 0 } })
      .toArray();
    return docs
      .filter((doc) => {
        if (typeof doc.documentTypeId !== "number") return false;
        const roles = parseCsvNumbers(doc.documentTypeRoles as unknown as string);
        return roles.some((role) => userRoles.includes(role));
      })
      .map((doc) => doc.documentTypeId as number);
  }

  getApplications = async (req: Request, res: Response) => {
    try {
      const userId = toNumber((req.body as any)?.userId ?? req.query?.userId);
      const entityId = toNumber((req.body as any)?.entityId ?? req.query?.entityId);
      if (userId === null) {
        return res.status(400).json({ status: false, message: "userId is required" });
      }
      if (entityId === null) {
        return res.status(400).json({ status: false, message: "entityId is required" });
      }
      const users = await this.users();
      const userDoc = await users.findOne({ userId }, { projection: { entities: 1 } });
      const userEntities = parseCsvNumbers(userDoc?.entities);
      if (!userEntities.includes(entityId)) {
        return res.status(403).json({ status: false, message: "User not associated with entity" });
      }
      const documentTypeIds = await this.accessibleDocumentTypes(userId);
      if (!documentTypeIds.length) {
        return res.json({ status: true, message: "No records", data: [] });
      }
      const startDate =
        periodStartDate(req.query?.period ?? (req.body as any)?.period) ??
        undefined;
      const answers = await this.documentTypeAnswers();
      const pipeline: any[] = [
        { $match: { documentTypeId: { $in: documentTypeIds } } },
        {
          $lookup: {
            from: "DocumentType",
            localField: "documentTypeId",
            foreignField: "documentTypeId",
            as: "documentType",
          },
        },
        { $unwind: "$documentType" },
        {
          $lookup: {
            from: "DocumentGroup",
            localField: "documentType.documentGroupId",
            foreignField: "documentGroupId",
            as: "documentGroup",
          },
        },
        { $unwind: "$documentGroup" },
        { $match: { "documentGroup.groupTypeId": 2 } },
        {
          $lookup: {
            from: "Users",
            localField: "userId",
            foreignField: "userId",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $addFields: {
            effectiveDate: { $ifNull: ["$updatedDate", "$createdDate"] },
          },
        },
      ];
      if (startDate) {
        pipeline.push({ $match: { effectiveDate: { $gte: startDate } } });
      }
      pipeline.push({
        $project: {
          _id: 0,
          userId: "$user.userId",
          userName: "$user.userName",
          Name: {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: ["$user.userFirstName", ""] },
                  " ",
                  { $ifNull: ["$user.userLastName", ""] },
                ],
              },
            },
          },
          userEnabled: "$user.userEnabled",
          userLocked: "$user.userLocked",
          id: "$documentTypeAnswersId",
          createdDate: "$createdDate",
          updatedDate: "$updatedDate",
          documentGroupName: "$documentGroup.documentGroupName",
          documentTypeId: "$documentType.documentTypeId",
          documentTypeName: "$documentType.documentTypeName",
          documentTypeTableId: "$documentType.documentTypeTableId",
        },
      });
      const rows = await answers.aggregate(pipeline).toArray();
      return res.json({
        status: true,
        message: rows.length ? "Success" : "No records",
        data: rows,
      });
    } catch (error) {
      console.error("getApplications error", error);
      return res.status(500).json({
        status: false,
        message: "Failed to get user and document details",
      });
    }
  };
}

export const documentAnswers = new DocumentAnswersController();
