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
exports.notesController = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../keys"));
const EmailHelper_1 = require("../EmailHelper");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const TaskHelpers_1 = require("../helpers/tasks/TaskHelpers");
const TaskNotes_1 = require("../helpers/notes/TaskNotes");
class NotesController {
    addNote(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { noteUserId, noteComment, noteTypeId, noteMentions, noteTaskId } = req.body;
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute(`INSERT INTO Notes (noteUserId, noteComment, noteTypeId, noteMentions, noteTaskId) 
         VALUES (?, ?, ?, ?, ?)`, [
                    noteUserId,
                    noteComment,
                    noteTypeId,
                    JSON.stringify(noteMentions),
                    noteTaskId,
                ]);
                //@ts-ignore
                const lastInsertId = result.insertId;
                const [taskResult] = yield connection.execute(`SELECT * from Tasks WHERE taskId = ?`, [noteTaskId]);
                const users = yield (0, TaskHelpers_1.taskUsers)(connection, noteTaskId);
                //@ts-ignore
                const task = taskResult[0];
                const notesView = yield (0, TaskNotes_1.insertNotesView)(connection, users.filter((u) => u !== noteUserId), lastInsertId);
                users.map((u) => __awaiter(this, void 0, void 0, function* () {
                    const [userResult] = yield connection.execute(`SELECT U.userId,U.userEmail,U.userFirstName,U.userLastName  FROM Users as U WHERE userId = ?`, [u]);
                    const filePath = path_1.default.join(__dirname, "letters", "messageNotification.html");
                    const searchStrings = [
                        /{{TASK_NAME}}/g,
                        /{{USER_NAME}}/g,
                        /{{MESSAGE}}/g,
                    ];
                    const replaceString = [
                        task.taskName,
                        `${userResult[0].userFirstName} ${userResult[0].userLastName}`,
                        noteComment,
                    ];
                    let emailTemplate = yield promises_1.default.readFile(filePath, "utf8");
                    searchStrings.map((r, i) => {
                        emailTemplate = emailTemplate.replace(r, `${replaceString[i]}`);
                    });
                    const subject = `New Message received on ${task.taskName}`;
                    (0, EmailHelper_1.sendEmail)(emailTemplate, userResult[0].userEmail, subject);
                }));
                res
                    .status(200)
                    .send({ message: "Note added successfully", noteId: lastInsertId });
            }
            catch (error) {
                res.status(500).send({ message: "Error adding the note", error });
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
    deleteNote(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { noteId } = req.params;
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                yield connection.execute(`DELETE FROM Notes WHERE noteId = ?`, [noteId]);
                res.status(200).send({ message: "Note deleted successfully" });
            }
            catch (error) {
                res.status(500).send({ message: "Error deleting the note", error });
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
    MarkAllNotesAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { noteUserId } = req.params;
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                yield (0, TaskNotes_1.updateMarkAsRead)(connection, +noteUserId);
                res.status(200).send({ status: true, message: "Success" });
            }
            catch (error) {
                console.log(error);
                res.status(500).send({ message: "Error", error });
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
    getNotesByTaskId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { taskId } = req.params;
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [rows] = yield connection.execute(`SELECT Notes.*, Users.userFirstName, Users.userLastName 
       FROM Notes 
       JOIN Users ON Notes.noteUserId = Users.userId 
       WHERE Notes.noteTaskId = ?`, [taskId]);
                res.status(200).send(rows);
            }
            catch (error) {
                res.status(500).send({ message: "Error fetching notes", error });
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
exports.notesController = new NotesController();
//# sourceMappingURL=NotesController.js.map