"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionsController = void 0;
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
class ActionsController {
    constructor() {
        this.getDocumentStateName = async (req, res) => {
            try {
                const documentStateId = toNumber(req.body?.documentStateId);
                if (documentStateId === null) {
                    return res.status(400).json({ status: false, message: "documentStateId is required" });
                }
                const collection = await this.documentStates();
                const doc = await collection.findOne({ documentStateId }, { projection: { _id: 0, documentStateName: 1 } });
                if (!doc) {
                    return res.json({ status: false, message: "Failed", data: "" });
                }
                return res.json({ status: true, message: "Success", data: doc.documentStateName });
            }
            catch (error) {
                console.error("getDocumentStateName error", error);
                return res.status(500).json({ status: false, message: "Failed to get object" });
            }
        };
        this.getTaskWorkflowByTaskId = async (req, res) => {
            try {
                const taskId = toNumber(req.params?.taskId);
                if (taskId === null) {
                    return res.status(400).json({ status: false, message: "taskId is required" });
                }
                const db = await (0, mongo_1.getMongoDb)();
                const pipeline = [
                    { $match: { taskId } },
                    {
                        $lookup: {
                            from: "Users",
                            localField: "taskUserId",
                            foreignField: "userId",
                            as: "user",
                        },
                    },
                    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "Actions",
                            localField: "taskActionId",
                            foreignField: "actionId",
                            as: "action",
                        },
                    },
                    { $unwind: { path: "$action", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            _id: 0,
                            taskWorkflowId: 1,
                            taskId: 1,
                            taskSelectedOption: 1,
                            taskNote: 1,
                            taskWorkflowDate: 1,
                            taskUserId: 1,
                            taskActionId: 1,
                            userFirstName: "$user.userFirstName",
                            userLastName: "$user.userLastName",
                            actionName: "$action.actionName",
                        },
                    },
                ];
                const docs = await db.collection("TaskWorkflow").aggregate(pipeline).toArray();
                if (!docs.length) {
                    return res.json({ status: false, message: "No task workflow found for the given Task ID", data: [] });
                }
                return res.json({ status: true, message: "Success", data: docs });
            }
            catch (error) {
                console.error("getTaskWorkflowByTaskId error", error);
                return res.status(500).json({ status: false, message: "Failed to get task workflow details" });
            }
        };
        this.insertTaskWorkflow = async (req, res) => {
            try {
                const taskId = toNumber(req.body?.taskId);
                const taskSelectedOption = req.body?.taskSelectedOption;
                const taskNote = req.body?.taskNote;
                const taskUserId = toNumber(req.body?.taskUserId);
                const taskActionId = toNumber(req.body?.taskActionId);
                if (taskId === null ||
                    taskUserId === null ||
                    taskActionId === null ||
                    typeof taskSelectedOption !== "string" ||
                    typeof taskNote !== "string") {
                    return res.status(400).json({ status: false, message: "Invalid task workflow payload" });
                }
                const collection = await this.taskWorkflow();
                await collection.insertOne({
                    taskWorkflowId: await this.nextId(collection),
                    taskId,
                    taskSelectedOption,
                    taskNote,
                    taskWorkflowDate: new Date(),
                    taskUserId,
                    taskActionId,
                });
                return res.json({ status: true, message: "TaskWorkflow added successfully" });
            }
            catch (error) {
                console.error("insertTaskWorkflow error", error);
                return res.status(500).json({ status: false, message: "Failed to insert task workflow data" });
            }
        };
        this.updateDocumentStateByAction = async (req, res) => {
            try {
                const actionId = toNumber(req.body?.actionId);
                const taskId = toNumber(req.body?.taskId);
                if (actionId === null || taskId === null) {
                    return res.status(400).json({ status: false, message: "actionId and taskId are required" });
                }
                const transitions = await this.actionStateTransitions();
                const transition = await transitions.findOne({ actionId }, { projection: { fromStateId: 1, toStateId: 1 } });
                if (!transition) {
                    return res.json({ status: false, message: "Action not found" });
                }
                const { fromStateId, toStateId } = transition;
                if (fromStateId === toStateId) {
                    return res.json({ status: true, message: "Task updated successfully" });
                }
                const tasksCollection = await this.tasks();
                const result = await tasksCollection.updateOne({ taskId }, { $set: { documentStateId: toStateId } });
                if (!result.matchedCount) {
                    return res.json({ status: false, message: "Failed to update task" });
                }
                return res.json({ status: true, message: "Task updated successfully" });
            }
            catch (error) {
                console.error("updateDocumentStateByAction error", error);
                return res.status(500).json({ status: false, message: "Failed to process action" });
            }
        };
        this.geDocumentActions = async (req, res) => {
            try {
                const documentStateId = toNumber(req.body?.documentStateId);
                if (documentStateId === null) {
                    return res.status(400).json({ status: false, message: "documentStateId is required" });
                }
                const actionsCollection = await this.actions();
                const docs = await actionsCollection
                    .find({ documentStateId }, { projection: { _id: 0 } })
                    .toArray();
                const data = docs.map((doc) => {
                    if (typeof doc.actionDescription === "string") {
                        try {
                            doc.actionDescription = JSON.parse(doc.actionDescription);
                        }
                        catch {
                            // ignore parsing errors
                        }
                    }
                    return doc;
                });
                return res.json({ status: true, message: "Success", data });
            }
            catch (error) {
                console.error("geDocumentActions error", error);
                return res.status(500).json({ status: false, message: "Failed to get object" });
            }
        };
    }
    async actions() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("Actions");
    }
    async actionStateTransitions() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("ActionStateTransitions");
    }
    async documentStates() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("DocumentStates");
    }
    async tasks() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("Tasks");
    }
    async taskWorkflow() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("TaskWorkflow");
    }
    async users() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("Users");
    }
    async nextId(collection) {
        const doc = await collection.find({}, { projection: { taskWorkflowId: 1 } }).sort({ taskWorkflowId: -1 }).limit(1).next();
        return (doc?.taskWorkflowId ?? 0) + 1;
    }
}
exports.actionsController = new ActionsController();
