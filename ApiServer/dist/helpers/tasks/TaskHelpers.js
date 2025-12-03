"use strict";
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
exports.Permissions = exports.taskUsers = exports.taskEntity = exports.updateTaskUsers = exports.taskRoles = exports.getDocumentTypeRoles = exports.addTask = exports.getTaskDetails = void 0;
const EmailHelper_1 = require("../../EmailHelper");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const socket_1 = require("../../socket");
const socketNotify_1 = require("../socketNotify");
function getTaskDetails(connection, taskId) {
    return __awaiter(this, void 0, void 0, function* () {
        const [result] = yield connection.execute("SELECT *,Tasks.taskId as id from Tasks WHERE taskId = ?", [taskId]);
        return result;
    });
}
exports.getTaskDetails = getTaskDetails;
function addTask(connection, details) {
    return __awaiter(this, void 0, void 0, function* () {
        const { taskName, answerObjectId, documentTypeId, userId, taskTableId = -1, taskTagId = -1, entityId = 1, notifyUserIds = [], } = details;
        let documentStateId = 1;
        try {
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
            // Try to send email; do not fail task creation if template is missing
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
            // Push real-time notifications to connected recipients
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
                // If you want to also notify role-based participants, uncomment below:
                // const watcherIds = await taskUsers(connection, taskId);
                // for (const uid of watcherIds) recipients.add(Number(uid));
                const payload = {
                    type: "task_created",
                    taskId,
                    taskName,
                    documentTypeId,
                };
                (0, socket_1.notifyUsers)(Array.from(recipients), "notification", payload);
                // Also emit directly via socketIds stored in Users table (fallback)
                yield (0, socketNotify_1.notifyUsersByDb)(Array.from(recipients), "notification", payload, connection);
            }
            catch (_a) { }
            connection.end();
            return true;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    });
}
exports.addTask = addTask;
//get documentType Roles by DocumentTypeId
function getDocumentTypeRoles(connection, documentTypeId) {
    return __awaiter(this, void 0, void 0, function* () {
        return [];
        const [result] = yield connection.execute(`SELECT * FROM DocumentTypeRoles WHERE documentTypeId = ?`, [documentTypeId]);
        return result;
    });
}
exports.getDocumentTypeRoles = getDocumentTypeRoles;
function taskRoles(connection, documentTypeRoleIds) {
    return __awaiter(this, void 0, void 0, function* () {
        const roleIds = [];
        for (const documentTypeRoleId of documentTypeRoleIds) {
            const query = `
      SELECT DISTINCT roleId
      FROM Roles
      WHERE (
        roles IS NOT NULL AND
        roles != '' AND
        FIND_IN_SET(?, roles) > 0
      )
    `;
            const [result] = yield connection.execute(query, [documentTypeRoleId]);
            //@ts-ignore
            const documentTypeRoleIds = result.map((row) => row.roleId);
            // Add the roleIds to the final array
            roleIds.push(...documentTypeRoleIds);
        }
        return Array.from(new Set(roleIds));
    });
}
exports.taskRoles = taskRoles;
function updateTaskUsers(connection, taskId, taskUsers) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Corrected query with parameterized inputs
            const [result] = yield connection.execute(`UPDATE Tasks SET taskUsers = ? WHERE taskId = ?`, [taskUsers, taskId]);
            connection.end();
            if (result[0])
                return result[0];
            else
                return null;
        }
        catch (error) {
            console.log(error);
            return null;
        }
    });
}
exports.updateTaskUsers = updateTaskUsers;
function taskEntity(connection, taskId) {
    return __awaiter(this, void 0, void 0, function* () {
        const [result] = yield connection.execute(`SELECT U.entities FROM Tasks T INNER JOIN Users U ON U.userId = T.userId WHERE taskId = ?`, [taskId]);
        //@ts-ignore
        if (result.length > 0) {
            return result[0].entities;
        }
        else {
            return "";
        }
    });
}
exports.taskEntity = taskEntity;
function taskUsers(connection, taskId) {
    return __awaiter(this, void 0, void 0, function* () {
        const taskDetails = yield getTaskDetails(connection, taskId);
        const userIds = [];
        if (taskDetails.length > 0) {
            const documentTypeRoles = yield getDocumentTypeRoles(connection, taskDetails[0].documentTypeId);
            const documentTypeRoleIds = Array.from(new Set(documentTypeRoles.map((item) => item.documentTypeRoleId)));
            const roleIds = yield taskRoles(connection, documentTypeRoleIds);
            for (const roleId of roleIds) {
                const query = `
      SELECT DISTINCT userId,userFirstName,userLastName,userEmail
      FROM Users
      WHERE (
        roles IS NOT NULL AND
        roles != '' AND
        FIND_IN_SET(?, roles) > 0
      )
    `;
                const [result] = yield connection.execute(query, [roleId]);
                //@ts-ignore
                const users = result.map((row) => row.userId);
                // Add the roleIds to the final array
                userIds.push(...users);
            }
            return Array.from(new Set(userIds));
        }
        else {
            return [];
        }
    });
}
exports.taskUsers = taskUsers;
var Permissions;
(function (Permissions) {
    Permissions[Permissions["Edit"] = 1] = "Edit";
    Permissions[Permissions["Delete"] = 2] = "Delete";
    Permissions[Permissions["Create"] = 3] = "Create";
    Permissions[Permissions["View"] = 4] = "View";
    Permissions[Permissions["Action"] = 5] = "Action";
})(Permissions || (exports.Permissions = Permissions = {}));
//# sourceMappingURL=TaskHelpers.js.map