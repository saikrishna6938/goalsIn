import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../keys";
import { sendEmail } from "../EmailHelper";
import fs from "fs/promises";
import path from "path";
import { taskUsers } from "../helpers/tasks/TaskHelpers";
import { insertNotesView, updateMarkAsRead } from "../helpers/notes/TaskNotes";
class NotesController {
  async addNote(req: Request, res: Response) {
    const { noteUserId, noteComment, noteTypeId, noteMentions, noteTaskId } =
      req.body;

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const [result] = await connection.execute(
        `INSERT INTO Notes (noteUserId, noteComment, noteTypeId, noteMentions, noteTaskId) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          noteUserId,
          noteComment,
          noteTypeId,
          JSON.stringify(noteMentions),
          noteTaskId,
        ]
      );
      //@ts-ignore
      const lastInsertId = result.insertId;
      const [taskResult] = await connection.execute(
        `SELECT * from Tasks WHERE taskId = ?`,
        [noteTaskId]
      );
      const users = await taskUsers(connection, noteTaskId);
      //@ts-ignore
      const task = taskResult[0];

      const notesView = await insertNotesView(
        connection,
        users.filter((u) => u !== noteUserId),
        lastInsertId
      );

      users.map(async (u) => {
        const [userResult] = await connection.execute(
          `SELECT U.userId,U.userEmail,U.userFirstName,U.userLastName  FROM Users as U WHERE userId = ?`,
          [u]
        );
        const filePath = path.join(
          __dirname,
          "letters",
          "messageNotification.html"
        );
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
        let emailTemplate = await fs.readFile(filePath, "utf8");
        searchStrings.map((r, i) => {
          emailTemplate = emailTemplate.replace(r, `${replaceString[i]}`);
        });
        const subject = `New Message received on ${task.taskName}`;
        sendEmail(emailTemplate, userResult[0].userEmail, subject);
      });

      res
        .status(200)
        .send({ message: "Note added successfully", noteId: lastInsertId });
    } catch (error) {
      res.status(500).send({ message: "Error adding the note", error });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  async deleteNote(req: Request, res: Response) {
    const { noteId } = req.params;

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      await connection.execute(`DELETE FROM Notes WHERE noteId = ?`, [noteId]);
      res.status(200).send({ message: "Note deleted successfully" });
    } catch (error) {
      res.status(500).send({ message: "Error deleting the note", error });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }

  async MarkAllNotesAsRead(req: Request, res: Response) {
    const { noteUserId } = req.params;

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      await updateMarkAsRead(connection, +noteUserId);
      res.status(200).send({ status: true, message: "Success" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Error", error });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }

  async getNotesByTaskId(req: Request, res: Response) {
    const { taskId } = req.params;

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const [rows] = await connection.execute(
        `SELECT Notes.*, Users.userFirstName, Users.userLastName 
       FROM Notes 
       JOIN Users ON Notes.noteUserId = Users.userId 
       WHERE Notes.noteTaskId = ?`,
        [taskId]
      );
      res.status(200).send(rows);
    } catch (error) {
      res.status(500).send({ message: "Error fetching notes", error });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }
}

export const notesController: NotesController = new NotesController();
