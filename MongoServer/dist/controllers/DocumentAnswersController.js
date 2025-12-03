"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentAnswers = void 0;
const mongo_1 = require("../config/mongo");
const groupIndexType_1 = require("./Tasks/groupIndexType");
const toNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value.trim());
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};
const parseCsvNumbers = (value) => {
    if (!value)
        return [];
    return value
        .split(",")
        .map((token) => Number(token.trim()))
        .filter((num) => Number.isFinite(num));
};
const periodStartDate = (value) => {
    const normalized = toNumber(value);
    if (!normalized)
        return undefined;
    const allowed = new Set([3, 6, 9, 12]);
    if (!allowed.has(normalized))
        return undefined;
    const date = new Date();
    date.setMonth(date.getMonth() - normalized);
    return date;
};
const parseDocumentTypeObject = (value) => {
    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        }
        catch {
            return value;
        }
    }
    return value;
};
class DocumentAnswersController {
    constructor() {
        this.addDocumentAnswerObject = (req, res) => this.createDocumentAnswer(req, res);
        this.indexDocumentAnswerObject = (req, res) => this.createDocumentAnswer(req, res);
        this.updateDocumentAnswerObject = async (req, res) => {
            try {
                const documentTypeAnswersId = toNumber(req.body?.documentTypeAnswersId);
                if (documentTypeAnswersId === null) {
                    return res.status(400).json({ status: false, message: "documentTypeAnswersId is required" });
                }
                const updates = {};
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
                updates.updatedDate = new Date();
                const answers = await this.documentTypeAnswers();
                const result = await answers.updateOne({ documentTypeAnswersId }, { $set: updates });
                if (!result.matchedCount) {
                    return res.status(404).json({ status: false, message: "Document answer not found" });
                }
                return res.json({ status: true, message: "Updated Successfully" });
            }
            catch (error) {
                console.error("updateDocumentAnswerObject error", error);
                return res.status(500).json({ status: false, message: "Failed to update document answer" });
            }
        };
        this.getDocumentAnswerObject = async (req, res) => {
            try {
                const taskId = toNumber(req.body?.taskId);
                if (taskId === null) {
                    return res.status(400).json({ status: false, message: "taskId is required" });
                }
                const tasks = await this.tasks();
                const task = await tasks.findOne({ taskId }, {
                    projection: {
                        _id: 0,
                        documentTypeAnswersId: 1,
                        documentTypeId: 1,
                        userId: 1,
                    },
                });
                if (!task?.documentTypeAnswersId) {
                    return res.status(404).json({ status: false, message: "Task not found", data: {} });
                }
                const indexType = await (0, groupIndexType_1.getIndexName)(taskId);
                if (indexType === "Index") {
                    const tagAnswers = await this.documentTagAnswers();
                    const doc = await tagAnswers.findOne({ documentTagAnswersId: task.documentTypeAnswersId }, { projection: { _id: 0 } });
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
                const doc = await answers.findOne({ documentTypeAnswersId: task.documentTypeAnswersId }, { projection: { _id: 0 } });
                if (!doc) {
                    return res.json({ status: false, message: "No records found", data: {} });
                }
                return res.json({ status: true, message: "Success", data: doc });
            }
            catch (error) {
                console.error("getDocumentAnswerObject error", error);
                return res.status(500).json({ status: false, message: "Failed to get object" });
            }
        };
        this.getUserAndDocumentDetailsByAnswerId = async (req, res) => {
            try {
                const documentTypeAnswersId = toNumber(req.body?.documentTypeAnswersId);
                if (documentTypeAnswersId === null) {
                    return res.status(400).json({ status: false, message: "documentTypeAnswersId is required" });
                }
                const db = await (0, mongo_1.getMongoDb)();
                const pipeline = [
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
            }
            catch (error) {
                console.error("getUserAndDocumentDetailsByAnswerId error", error);
                return res.status(500).json({
                    status: false,
                    message: "Failed to get user and document details",
                });
            }
        };
        this.getApplications = async (req, res) => {
            try {
                const userId = toNumber(req.body?.userId ?? req.query?.userId);
                const entityId = toNumber(req.body?.entityId ?? req.query?.entityId);
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
                const startDate = periodStartDate(req.query?.period ?? req.body?.period) ??
                    undefined;
                const answers = await this.documentTypeAnswers();
                const pipeline = [
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
            }
            catch (error) {
                console.error("getApplications error", error);
                return res.status(500).json({
                    status: false,
                    message: "Failed to get user and document details",
                });
            }
        };
    }
    async documentTypeAnswers() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("DocumentTypeAnswers");
    }
    async documentTagAnswers() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("DocumentTagAnswers");
    }
    async tasks() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("Tasks");
    }
    async users() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("Users");
    }
    async documentTypes() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("DocumentType");
    }
    async documentGroups() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("DocumentGroup");
    }
    async documentGroupTypes() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("DocumentGroupType");
    }
    async documentTypeObjects() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("DocumentTypeObject");
    }
    async userDocumentsPermission() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("UserDocumentsPermission");
    }
    async nextId(collection, field) {
        const doc = await collection.find().project({ [field]: 1 }).sort({ [field]: -1 }).limit(1).next();
        return (doc?.[field] ?? 0) + 1;
    }
    async createDocumentAnswer(req, res) {
        try {
            const documentTypeId = toNumber(req.body?.documentTypeId);
            const userId = toNumber(req.body?.userId);
            if (documentTypeId === null || userId === null) {
                return res.status(400).json({ status: false, message: "documentTypeId and userId are required" });
            }
            const answers = await this.documentTypeAnswers();
            const documentTypeAnswersId = toNumber(req.body?.documentTypeAnswersId) ?? (await this.nextId(answers, "documentTypeAnswersId"));
            const now = new Date();
            const doc = {
                documentTypeAnswersId,
                documentTypeId,
                userId,
                documentTypeAnswersObject: req.body?.documentTypeAnswersObject,
                createdDate: now,
                updatedDate: now,
            };
            await answers.insertOne(doc);
            return res.json({ status: true, message: "Added Successfully", documentTypeAnswersId });
        }
        catch (error) {
            console.error("createDocumentAnswer error", error);
            return res.status(500).json({ status: false, message: "Failed to add document answer" });
        }
    }
    async accessibleDocumentTypes(userId) {
        const users = await this.users();
        const user = await users.findOne({ userId }, { projection: { roles: 1 } });
        if (!user)
            return [];
        const userRoles = parseCsvNumbers(user.roles);
        if (!userRoles.length)
            return [];
        const documentTypes = await this.documentTypes();
        const docs = await documentTypes
            .find({}, { projection: { documentTypeId: 1, documentTypeRoles: 1, _id: 0 } })
            .toArray();
        return docs
            .filter((doc) => {
            if (typeof doc.documentTypeId !== "number")
                return false;
            const roles = parseCsvNumbers(doc.documentTypeRoles);
            return roles.some((role) => userRoles.includes(role));
        })
            .map((doc) => doc.documentTypeId);
    }
}
exports.documentAnswers = new DocumentAnswersController();
