"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksController = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../keys"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const EmailHelper_1 = require("../EmailHelper");
const TaskHelpers_1 = require("../helpers/tasks/TaskHelpers");
const UserHelprs_1 = require("../helpers/user/UserHelprs");
const TaskPermissions_1 = require("../helpers/tasks/TaskPermissions");
const DocumentTypeHelpers_1 = require("../helpers/documents/DocumentTypeHelpers");
const SuperDocumentTypeRolesHelper_1 = require("../helpers/RolesManager/AdminManager/DocumentRoles/SuperDocumentTypeRolesHelper");
const dashboard_1 = require("../helpers/dashboard/dashboard");
const socket_1 = require("../socket");
const socketNotify_1 = require("../helpers/socketNotify");
class TasksController {
    getTasksByUserId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const userId = req.params.userId;
                const documentTypeId = req.params.documentTypeId; // Assuming documentTypeId is passed as a parameter
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute(`
          SELECT *, Tasks.taskId as id 
          FROM Tasks 
          WHERE Tasks.userId = ? AND Tasks.documentTypeId = ?
        `, [userId, documentTypeId]);
                res.json({ status: true, message: "Success", data: result });
            }
            catch (error) {
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    getUserTasksFrontEnd(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const userId = req.params.userId;
                connection = yield mysql.createConnection(keys_1.default.database);
                // Step 1: Fetch tasks for the given user
                const [tasks] = yield connection.execute("SELECT *, Tasks.taskId as id FROM Tasks WHERE userId = ?", [userId]);
                // Prepare a variable to store the final result
                let tasksWithTags = [];
                //@ts-ignore
                for (let task of tasks) {
                    const [dataTable] = yield connection.execute("SELECT tableName FROM DataTables WHERE tableId = ?", [task.taskTableId]);
                    let lastWorkflowItem = {};
                    //@ts-ignore
                    if (dataTable.length > 0) {
                        const tableName = dataTable[0].tableName;
                        const [tagData] = yield connection.execute(`SELECT * FROM ${tableName} WHERE Id = ?`, [task.taskTagId]);
                        const workflowQuery = `
          SELECT TW.*, U.userFirstName, U.userLastName, A.actionName 
          FROM TaskWorkflow TW
          INNER JOIN Users U ON TW.taskUserId = U.userId
          INNER JOIN Actions A ON TW.taskActionId = A.actionId
          WHERE TW.taskId = ?
          ORDER BY TW.taskWorkflowDate DESC LIMIT 1
        `;
                        const [workflowRows] = yield connection.execute(workflowQuery, [
                            task.taskId,
                        ]);
                        //@ts-ignore
                        lastWorkflowItem = workflowRows.length > 0 ? workflowRows[0] : null;
                        tasksWithTags.push(Object.assign(Object.assign(Object.assign({}, task), lastWorkflowItem), { tags: tagData.length > 0 ? tagData[0] : null }));
                    }
                    else {
                        tasksWithTags.push(Object.assign(Object.assign(Object.assign({}, task), lastWorkflowItem), { tags: null }));
                    }
                }
                // Step 5: Send the final response with tasks and tags
                res.json({
                    status: true,
                    message: "Success",
                    data: tasksWithTags,
                });
            }
            catch (error) {
                console.log(error);
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    getTaskUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { taskId, entities } = req.body;
                connection = yield mysql.createConnection(keys_1.default.database);
                const userIds = yield (0, TaskHelpers_1.taskUsers)(connection, taskId);
                const result = yield (0, UserHelprs_1.getUsersByUserIds)(connection, userIds);
                res.json({ status: true, message: "Success", data: result });
            }
            catch (error) {
                console.log(error);
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    getTaskActions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { taskId, userRoles, userId } = req.body;
                connection = yield mysql.createConnection(keys_1.default.database);
                const details = yield (0, TaskPermissions_1.getTaskPermissions)(connection, taskId, userRoles);
                const hasActionPermission = true;
                // checkPermission(
                //   Permissions.Action,
                //   details[0].permissions
                // );
                if (hasActionPermission) {
                    const result = yield (0, DocumentTypeHelpers_1.getCurrentDocumentStateActions)(connection, details[0].task.documentStateId);
                    console.log(result);
                    if (!result)
                        res.json({ status: false, message: "Failed", data: [] });
                    else {
                        const actions = result[0].documentActions;
                        if (actions.length > 0) {
                            //@ts-ignore
                            const parsedRows = actions.map((row) => {
                                if (row.options) {
                                    try {
                                        // Parse the options JSON string
                                        row.options = JSON.parse(row.options);
                                    }
                                    catch (error) {
                                        console.error("Error parsing options JSON:", error);
                                        row.options = null; // or however you want to handle the parse error
                                    }
                                }
                                return row;
                            });
                            res.json({ status: true, message: "Success", data: parsedRows });
                        }
                        else {
                            res.json({ status: false, message: "Failed", data: [] });
                        }
                    }
                }
                else {
                    res.json({ status: true, message: "Success", data: [] });
                }
            }
            catch (error) {
                console.log(error);
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    getAssignTasksByUserId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const userId = req.params.userId;
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute(`SELECT T.*, T.taskId as id, DT.* from Tasks as T LEFT JOIN DocumentType DT ON T.documentTypeId = DT.documentTypeId WHERE FIND_IN_SET(?, T.taskUsers) > 0 OR T.userId = ${userId}`, [userId]);
                // Process the result to create a map
                const taskMap = new Map();
                //@ts-ignore
                result.forEach((task) => {
                    const typeName = task.documentTypeName;
                    if (taskMap.has(typeName)) {
                        taskMap.get(typeName).push(task);
                    }
                    else {
                        taskMap.set(typeName, [task]);
                    }
                });
                // Convert the map to the desired object format
                const taskMapObject = {};
                taskMap.forEach((value, key) => {
                    taskMapObject[key] = value;
                });
                res.json({ status: true, message: "Success", data: taskMapObject });
            }
            catch (error) {
                console.log(error);
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    checkUserAccess(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const { taskId, userId } = req.body;
                if (!taskId || !userId) {
                    res.status(400).json({
                        success: false,
                        message: "Both taskId and userId are required",
                    });
                    return;
                }
                const entities = yield (0, SuperDocumentTypeRolesHelper_1.getTaskEntityId)(connection, +taskId);
                const entity = entities.length > 0 ? entities[0] : 1;
                const result = yield (0, SuperDocumentTypeRolesHelper_1.validateUserAccess)(connection, taskId, userId, entity);
                if (!result.accessGranted) {
                    res.status(200).json({
                        status: false,
                        message: result.message,
                    });
                }
                else {
                    res.status(200).json({
                        status: true,
                        message: result.message,
                        data: Object.assign(Object.assign({}, result.taskDetails), { taskUsers: result.taskUsers, taskEntity: entity, taskApprovers: result.taskApprovers }),
                    });
                }
            }
            catch (err) {
                console.error("Error validating user access:", err);
                res.status(500).json({
                    status: false,
                    message: "An error occurred while validating access",
                    error: err.message,
                });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    getTasksByTaskIds(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { taskIds } = req.body;
                connection = yield mysql.createConnection(keys_1.default.database);
                const tasks = yield (0, dashboard_1.getTasksByIds)(connection, taskIds);
                if (tasks.length > 0) {
                    res.json({ status: true, message: "Success", data: tasks });
                }
                else
                    res.json({ status: true, message: "Success", data: [] });
            }
            catch (err) {
                console.log(err);
                res.json({ status: false, message: "No Task Found" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    getTaskByTaskId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { taskId } = req.params;
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute("SELECT * from Tasks WHERE taskId = ?", [taskId]);
                const entity = yield (0, TaskHelpers_1.taskEntity)(connection, +taskId);
                const userIds = yield (0, TaskHelpers_1.taskUsers)(connection, +taskId);
                const users = yield (0, UserHelprs_1.getUsersByUserIds)(connection, userIds);
                const entityUsers = users.filter((user) => {
                    const userEntities = user.entities.split(",").map(Number);
                    return userEntities.includes(+entity) || userEntities.includes(1);
                });
                if (result[0]) {
                    const taskDetails = Object.assign(Object.assign({}, result[0]), { taskUsers: entityUsers, taskEntity: entity });
                    res.json({ status: true, message: "Success", data: taskDetails });
                }
                else
                    res.json({ status: true, message: "Success", data: {} });
            }
            catch (error) {
                console.log(error);
                res.json({ status: false, message: "No Task Found" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    updateTaskUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { taskId, taskUsers } = req.body;
                connection = yield mysql.createConnection(keys_1.default.database);
                // Corrected query with parameterized inputs
                const [result] = yield connection.execute(`UPDATE Tasks SET taskUsers = ? WHERE taskId = ?`, [taskUsers, taskId]);
                if (result[0])
                    res.json({ status: true, message: "Success", data: result[0] });
                else
                    res.json({ status: true, message: "Success", data: {} });
            }
            catch (error) {
                console.log(error);
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    getTasksByDocumentType(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const documentTypeId = req.params.documentTypeId;
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = (_a = (yield connection.execute("SELECT * from Tasks WHERE documentTypeId = ?", [documentTypeId]))) !== null && _a !== void 0 ? _a : [];
                res.json({ status: true, message: "Success", data: result });
            }
            catch (error) {
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_b) { }
                }
            }
        });
    }
    addTask(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const { taskName, answerObjectId, documentTypeId, userId, taskTableId = -1, taskTagId = -1, entityId = 1, notifyUserIds = [], } = req.body;
                let documentStateId = 1;
                const [workflow] = yield connection.execute(`SELECT WorkflowID FROM WorkflowDocumentTypes WHERE DocumentTypeID = ?`, [documentTypeId]);
                //@ts-ignore
                if (workflow.length === 0) {
                    throw new Error("No workflow found for the given documentTypeId");
                }
                const workflowId = workflow[0].WorkflowID;
                const [states] = yield connection.execute(`SELECT * FROM DocumentStates WHERE WorkflowID = ? AND steps = 1`, [workflowId]);
                //@ts-ignore
                if (states.length) {
                    documentStateId = states[0].documentStateId;
                }
                const [taskResult] = yield connection.execute("INSERT INTO Tasks(taskName, documentTypeAnswersId, documentTypeId, userId,attachments,taskTableId,taskTagId,taskUsers,documentStateId) VALUES (?,?,?,?,?,?,?,?,?)", [
                    taskName,
                    answerObjectId,
                    documentTypeId,
                    userId,
                    "",
                    taskTableId,
                    taskTagId,
                    userId,
                    documentStateId,
                ]);
                //@ts-ignore
                const taskId = taskResult.insertId;
                yield connection.execute("INSERT INTO TaskEntities(taskEntityId, taskId) VALUES (?,?)", [entityId === -1 ? 1 : entityId, taskId]);
                const now = new Date();
                // Insert into Notes
                yield connection.execute("INSERT INTO Notes(noteCreated, noteUserId, noteComment, noteTypeId, noteMentions, noteTaskId) VALUES (?,?,?,?,?,?)", [now, userId, "", "1", "", taskId]);
                // Insert into History
                yield connection.execute("INSERT INTO History(historyTypeId, historyUserId, historyCreatedDate, historyTaskId) VALUES (?,?,?,?)", ["1", userId, now, taskId]);
                const query = `
      INSERT INTO TaskWorkflow (taskId, taskSelectedOption, taskNote, taskWorkflowDate, taskUserId, taskActionId)
      VALUES (?, ?, ?, NOW(), ?, ?)
    `;
                const [result] = yield connection.execute(query, [
                    taskId,
                    "Workflow Started",
                    "Task Created",
                    userId,
                    1,
                ]);
                const [rows] = yield connection.execute("SELECT U.userFirstName,U.userLastName,U.userEmail from Users as U WHERE userId = ?", [userId]);
                const user = Object.values(JSON.parse(JSON.stringify(rows)));
                //@ts-ignore
                try {
                    const filePath = path_1.default.join(__dirname, "letters", "taskCreated.html");
                    const searchStrings = [/{{TASK_NAME}}/g, /{{USER_NAME}}/g];
                    const replaceString = [
                        taskName,
                        `${user[0].userFirstName} ${user[0].userLastName}`,
                    ];
                    let emailTemplate = yield promises_1.default.readFile(filePath, "utf8");
                    searchStrings.map((r, i) => {
                        emailTemplate = emailTemplate.replace(r, `${replaceString[i]}`);
                    });
                    const subject = `Confirmation: ${taskName} Has Been Created For Your Application`;
                    (0, EmailHelper_1.sendEmail)(emailTemplate, user[0].userEmail, subject);
                }
                catch (e) {
                    console.warn("taskCreated email template not sent:", (e === null || e === void 0 ? void 0 : e.message) || e);
                }
                // Real-time notify creator (and optionally watchers)
                try {
                    const recipients = new Set();
                    recipients.add(Number(userId));
                    if (Array.isArray(notifyUserIds)) {
                        for (const uid of notifyUserIds) {
                            const n = Number(uid);
                            if (Number.isFinite(n))
                                recipients.add(n);
                        }
                    }
                    // Optionally include watchers
                    // const watcherIds = await taskUsers(connection, taskId);
                    // for (const uid of watcherIds) recipients.add(Number(uid));
                    const payload = { type: "task_created", taskId, taskName, documentTypeId };
                    (0, socket_1.notifyUsers)(Array.from(recipients), "notification", payload);
                    yield (0, socketNotify_1.notifyUsersByDb)(Array.from(recipients), "notification", payload, connection);
                }
                catch (_a) { }
                res.json({
                    success: true,
                    message: "New task created successfully",
                });
            }
            catch (error) {
                console.log(error);
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_b) { }
                }
            }
        });
    }
    indexDocument(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const { taskName, answerObjectId, documentTypeId, userId, taskTableId = -1, taskTagId = -1, entityId = 1, notifyUserIds = [], } = req.body;
                let documentStateId = 1;
                const [workflow] = yield connection.execute(`SELECT WorkflowID FROM WorkflowDocumentTypes WHERE DocumentTypeID = ?`, [documentTypeId]);
                //@ts-ignore
                if (workflow.length === 0) {
                    throw new Error("No workflow found for the given documentTypeId");
                }
                const workflowId = workflow[0].WorkflowID;
                const [states] = yield connection.execute(`SELECT * FROM DocumentStates WHERE WorkflowID = ? AND steps = 1`, [workflowId]);
                //@ts-ignore
                if (states.length) {
                    documentStateId = states[0].documentStateId;
                }
                const [taskResult] = yield connection.execute("INSERT INTO Tasks(taskName, documentTypeAnswersId, documentTypeId, userId,attachments,taskTableId,taskTagId,taskUsers,documentStateId) VALUES (?,?,?,?,?,?,?,?,?)", [
                    taskName,
                    answerObjectId,
                    documentTypeId,
                    userId,
                    "",
                    taskTableId,
                    taskTagId,
                    userId,
                    documentStateId,
                ]);
                //@ts-ignore
                const taskId = taskResult.insertId;
                yield connection.execute("INSERT INTO TaskEntities(taskEntityId, taskId) VALUES (?,?)", [entityId === -1 ? 1 : entityId, taskId]);
                const now = new Date();
                // Insert into Notes
                yield connection.execute("INSERT INTO Notes(noteCreated, noteUserId, noteComment, noteTypeId, noteMentions, noteTaskId) VALUES (?,?,?,?,?,?)", [now, userId, "", "1", "", taskId]);
                // Insert into History
                yield connection.execute("INSERT INTO History(historyTypeId, historyUserId, historyCreatedDate, historyTaskId) VALUES (?,?,?,?)", ["1", userId, now, taskId]);
                const query = `
      INSERT INTO TaskWorkflow (taskId, taskSelectedOption, taskNote, taskWorkflowDate, taskUserId, taskActionId)
      VALUES (?, ?, ?, NOW(), ?, ?)
    `;
                const [result] = yield connection.execute(query, [
                    taskId,
                    "Workflow Started",
                    "Task Created",
                    userId,
                    1,
                ]);
                const [rows] = yield connection.execute("SELECT U.userFirstName,U.userLastName,U.userEmail from Users as U WHERE userId = ?", [userId]);
                const user = Object.values(JSON.parse(JSON.stringify(rows)));
                //@ts-ignore
                try {
                    const filePath = path_1.default.join(__dirname, "letters", "taskCreated.html");
                    const searchStrings = [/{{TASK_NAME}}/g, /{{USER_NAME}}/g];
                    const replaceString = [
                        taskName,
                        `${user[0].userFirstName} ${user[0].userLastName}`,
                    ];
                    let emailTemplate = yield promises_1.default.readFile(filePath, "utf8");
                    searchStrings.map((r, i) => {
                        emailTemplate = emailTemplate.replace(r, `${replaceString[i]}`);
                    });
                    const subject = `Confirmation: ${taskName} Has Been Created For Your Application`;
                    (0, EmailHelper_1.sendEmail)(emailTemplate, user[0].userEmail, subject);
                }
                catch (e) {
                    console.warn("taskCreated email template not sent:", (e === null || e === void 0 ? void 0 : e.message) || e);
                }
                // Real-time notify creator (and optionally watchers)
                try {
                    const recipients = new Set();
                    recipients.add(Number(userId));
                    if (Array.isArray(notifyUserIds)) {
                        for (const uid of notifyUserIds) {
                            const n = Number(uid);
                            if (Number.isFinite(n))
                                recipients.add(n);
                        }
                    }
                    // Optionally include watchers
                    // const watcherIds = await taskUsers(connection, taskId);
                    // for (const uid of watcherIds) recipients.add(Number(uid));
                    const payload = { type: "task_created", taskId, taskName, documentTypeId };
                    (0, socket_1.notifyUsers)(Array.from(recipients), "notification", payload);
                    yield (0, socketNotify_1.notifyUsersByDb)(Array.from(recipients), "notification", payload, connection);
                }
                catch (_a) { }
                res.json({
                    success: true,
                    message: "New task created successfully",
                    taskId: taskId,
                });
            }
            catch (error) {
                console.log(error);
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_b) { }
                }
            }
        });
    }
    updateTask(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield mysql.createConnection(keys_1.default.database);
            try {
                const { taskId } = req.params;
                const updates = (_a = req.body) !== null && _a !== void 0 ? _a : {};
                // Validate taskId
                const id = Number(taskId);
                if (!Number.isFinite(id) || id <= 0) {
                    res.status(400).json({ success: false, message: "Invalid taskId" });
                    return;
                }
                // Build dynamic SET clause from body (skip forbidden/undefined/null)
                const disallowed = new Set(["taskId", "created", "updated"]); // don't allow PK/timestamps
                const fields = [];
                const values = [];
                for (const [key, value] of Object.entries(updates)) {
                    if (disallowed.has(key))
                        continue;
                    if (value === undefined || value === null)
                        continue; // avoid nulling unintentionally
                    fields.push(`${key} = ?`);
                    values.push(value);
                }
                if (fields.length === 0) {
                    res
                        .status(400)
                        .json({ success: false, message: "No valid fields to update" });
                    return;
                }
                // Finalize query
                values.push(id);
                const sql = `UPDATE Tasks SET ${fields.join(", ")} WHERE taskId = ?`;
                const [result] = yield connection.execute(sql, values);
                if (result.affectedRows === 0) {
                    res.status(404).json({ success: false, message: "Task not found" });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Task updated successfully",
                    taskId: id,
                    affectedRows: result.affectedRows,
                });
            }
            catch (error) {
                console.error("updateTask error:", error);
                res.status(500).json({
                    success: false,
                    message: "Error updating task",
                    error: String((_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : error),
                });
            }
            finally {
                yield connection.end();
            }
        });
    }
    deleteTask(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
            }
            catch (error) {
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
}
exports.tasksController = new TasksController();
//# sourceMappingURL=TaskController.js.map