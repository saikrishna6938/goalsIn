import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../keys";
import { verifyJWT } from "../utils/jwt.utils";
import fs from "fs/promises";
import path from "path";
import { User } from "../modules/User";
import { sendEmail } from "../EmailHelper";
import {
  Permissions,
  getDocumentTypeRoles,
  getTaskDetails,
  taskEntity,
  taskUsers,
} from "../helpers/tasks/TaskHelpers";
import {
  getRoleTypesFromUserRoles,
  getUsersByUserIds,
} from "../helpers/user/UserHelprs";
import {
  checkPermission,
  getTaskPermissions,
} from "../helpers/tasks/TaskPermissions";
import { getCurrentDocumentStateActions } from "../helpers/documents/DocumentTypeHelpers";
import {
  getTaskEntityId,
  validateUserAccess,
} from "../helpers/RolesManager/AdminManager/DocumentRoles/SuperDocumentTypeRolesHelper";
import { getTasksByIds } from "../helpers/dashboard/dashboard";
import { notifyUsers } from "../socket";
import { notifyUsersByDb } from "../helpers/socketNotify";
class TasksController {
  async getTasksByUserId(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const userId = req.params.userId;
      const documentTypeId = req.params.documentTypeId; // Assuming documentTypeId is passed as a parameter
      connection = await mysql.createConnection(keys.database);

      const [result] = await connection.execute(
        `
          SELECT *, Tasks.taskId as id 
          FROM Tasks 
          WHERE Tasks.userId = ? AND Tasks.documentTypeId = ?
        `,
        [userId, documentTypeId]
      );
      res.json({ status: true, message: "Success", data: result });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async getUserTasksFrontEnd(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const userId = req.params.userId;
      connection = await mysql.createConnection(keys.database);

      // Step 1: Fetch tasks for the given user
      const [tasks] = await connection.execute(
        "SELECT *, Tasks.taskId as id FROM Tasks WHERE userId = ?",
        [userId]
      );

      // Prepare a variable to store the final result
      let tasksWithTags = [];

      //@ts-ignore
      for (let task of tasks) {
        const [dataTable] = await connection.execute(
          "SELECT tableName FROM DataTables WHERE tableId = ?",
          [task.taskTableId]
        );
        let lastWorkflowItem = {};
        //@ts-ignore
        if (dataTable.length > 0) {
          const tableName = dataTable[0].tableName;

          const [tagData] = await connection.execute(
            `SELECT * FROM ${tableName} WHERE Id = ?`,
            [task.taskTagId]
          );

          const workflowQuery = `
          SELECT TW.*, U.userFirstName, U.userLastName, A.actionName 
          FROM TaskWorkflow TW
          INNER JOIN Users U ON TW.taskUserId = U.userId
          INNER JOIN Actions A ON TW.taskActionId = A.actionId
          WHERE TW.taskId = ?
          ORDER BY TW.taskWorkflowDate DESC LIMIT 1
        `;
          const [workflowRows] = await connection.execute(workflowQuery, [
            task.taskId,
          ]);

          //@ts-ignore
          lastWorkflowItem = workflowRows.length > 0 ? workflowRows[0] : null;

          tasksWithTags.push({
            ...task,
            ...lastWorkflowItem, //@ts-ignore
            tags: tagData.length > 0 ? tagData[0] : null,
          });
        } else {
          tasksWithTags.push({
            ...task,
            ...lastWorkflowItem,
            tags: null,
          });
        }
      }
      // Step 5: Send the final response with tasks and tags
      res.json({
        status: true,
        message: "Success",
        data: tasksWithTags,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async getTaskUsers(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const { taskId, entities } = req.body;
      connection = await mysql.createConnection(keys.database);
      const userIds = await taskUsers(connection, taskId);
      const result = await getUsersByUserIds(connection, userIds);
      res.json({ status: true, message: "Success", data: result });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }
  async getTaskActions(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const { taskId, userRoles, userId } = req.body;
      connection = await mysql.createConnection(keys.database);

      const details = await getTaskPermissions(connection, taskId, userRoles);

      const hasActionPermission = true;

      // checkPermission(
      //   Permissions.Action,
      //   details[0].permissions
      // );
      if (hasActionPermission) {
        const result = await getCurrentDocumentStateActions(
          connection,
          details[0].task.documentStateId
        );
        console.log(result);
        if (!result) res.json({ status: false, message: "Failed", data: [] });
        else {
          const actions = result[0].documentActions;
          if (actions.length > 0) {
            //@ts-ignore
            const parsedRows = actions.map((row) => {
              if (row.options) {
                try {
                  // Parse the options JSON string
                  row.options = JSON.parse(row.options);
                } catch (error) {
                  console.error("Error parsing options JSON:", error);
                  row.options = null; // or however you want to handle the parse error
                }
              }
              return row;
            });

            res.json({ status: true, message: "Success", data: parsedRows });
          } else {
            res.json({ status: false, message: "Failed", data: [] });
          }
        }
      } else {
        res.json({ status: true, message: "Success", data: [] });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async getAssignTasksByUserId(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const userId = req.params.userId;
      connection = await mysql.createConnection(keys.database);
      const [result] = await connection.execute(
        `SELECT T.*, T.taskId as id, DT.* from Tasks as T LEFT JOIN DocumentType DT ON T.documentTypeId = DT.documentTypeId WHERE FIND_IN_SET(?, T.taskUsers) > 0 OR T.userId = ${userId}`,
        [userId]
      );
      // Process the result to create a map
      const taskMap = new Map();
      //@ts-ignore
      result.forEach((task) => {
        const typeName = task.documentTypeName;
        if (taskMap.has(typeName)) {
          taskMap.get(typeName).push(task);
        } else {
          taskMap.set(typeName, [task]);
        }
      });

      // Convert the map to the desired object format
      const taskMapObject = {};
      taskMap.forEach((value, key) => {
        taskMapObject[key] = value;
      });

      res.json({ status: true, message: "Success", data: taskMapObject });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async checkUserAccess(req: Request, res: Response): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const { taskId, userId } = req.body;

      if (!taskId || !userId) {
        res.status(400).json({
          success: false,
          message: "Both taskId and userId are required",
        });
        return;
      }
      const entities = await getTaskEntityId(connection, +taskId);
      const entity = entities.length > 0 ? entities[0] : 1;
      const result = await validateUserAccess(
        connection,
        taskId,
        userId,
        entity
      );
      if (!result.accessGranted) {
        res.status(200).json({
          status: false,
          message: result.message,
        });
      } else {
        res.status(200).json({
          status: true,
          message: result.message,
          data: {
            ...result.taskDetails,
            taskUsers: result.taskUsers,
            taskEntity: entity,
            taskApprovers: result.taskApprovers,
          },
        });
      }
    } catch (err) {
      console.error("Error validating user access:", err);
      res.status(500).json({
        status: false,
        message: "An error occurred while validating access",
        error: err.message,
      });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async getTasksByTaskIds(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const { taskIds } = req.body;
      connection = await mysql.createConnection(keys.database);
      const tasks = await getTasksByIds(connection, taskIds);
      if (tasks.length > 0) {
        res.json({ status: true, message: "Success", data: tasks });
      } else res.json({ status: true, message: "Success", data: [] });
    } catch (err) {
      console.log(err);
      res.json({ status: false, message: "No Task Found" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async getTaskByTaskId(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const { taskId } = req.params;
      connection = await mysql.createConnection(keys.database);
      const [result] = await connection.execute(
        "SELECT * from Tasks WHERE taskId = ?",
        [taskId]
      );
      const entity = await taskEntity(connection, +taskId);
      const userIds = await taskUsers(connection, +taskId);
      const users = await getUsersByUserIds(connection, userIds);
      const entityUsers = users.filter((user) => {
        const userEntities = user.entities.split(",").map(Number);
        return userEntities.includes(+entity) || userEntities.includes(1);
      });
      if (result[0]) {
        const taskDetails = {
          ...result[0],
          taskUsers: entityUsers,
          taskEntity: entity,
        };

        res.json({ status: true, message: "Success", data: taskDetails });
      } else res.json({ status: true, message: "Success", data: {} });
    } catch (error) {
      console.log(error);
      res.json({ status: false, message: "No Task Found" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async updateTaskUsers(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const { taskId, taskUsers } = req.body;
      connection = await mysql.createConnection(keys.database);

      // Corrected query with parameterized inputs
      const [result] = await connection.execute(
        `UPDATE Tasks SET taskUsers = ? WHERE taskId = ?`,
        [taskUsers, taskId]
      );
      if (result[0])
        res.json({ status: true, message: "Success", data: result[0] });
      else res.json({ status: true, message: "Success", data: {} });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async getTasksByDocumentType(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const documentTypeId = req.params.documentTypeId;
      connection = await mysql.createConnection(keys.database);
      const [result] =
        (await connection.execute(
          "SELECT * from Tasks WHERE documentTypeId = ?",
          [documentTypeId]
        )) ?? [];

      res.json({ status: true, message: "Success", data: result });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async addTask(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const {
        taskName,
        answerObjectId,
        documentTypeId,
        userId,
        taskTableId = -1,
        taskTagId = -1,
        entityId = 1,
        notifyUserIds = [],
      } = req.body;
      let documentStateId = 1;

      const [workflow] = await connection.execute(
        `SELECT WorkflowID FROM WorkflowDocumentTypes WHERE DocumentTypeID = ?`,
        [documentTypeId]
      );
      //@ts-ignore
      if (workflow.length === 0) {
        throw new Error("No workflow found for the given documentTypeId");
      }

      const workflowId = workflow[0].WorkflowID;

      const [states] = await connection.execute(
        `SELECT * FROM DocumentStates WHERE WorkflowID = ? AND steps = 1`,
        [workflowId]
      );

      //@ts-ignore
      if (states.length) {
        documentStateId = states[0].documentStateId;
      }

      const [taskResult] = await connection.execute(
        "INSERT INTO Tasks(taskName, documentTypeAnswersId, documentTypeId, userId,attachments,taskTableId,taskTagId,taskUsers,documentStateId) VALUES (?,?,?,?,?,?,?,?,?)",
        [
          taskName,
          answerObjectId,
          documentTypeId,
          userId,
          "",
          taskTableId,
          taskTagId,
          userId,
          documentStateId,
        ]
      );
      //@ts-ignore
      const taskId = taskResult.insertId;
      await connection.execute(
        "INSERT INTO TaskEntities(taskEntityId, taskId) VALUES (?,?)",
        [entityId === -1 ? 1 : entityId, taskId]
      );
      const now = new Date();
      // Insert into Notes
      await connection.execute(
        "INSERT INTO Notes(noteCreated, noteUserId, noteComment, noteTypeId, noteMentions, noteTaskId) VALUES (?,?,?,?,?,?)",
        [now, userId, "", "1", "", taskId]
      );

      // Insert into History
      await connection.execute(
        "INSERT INTO History(historyTypeId, historyUserId, historyCreatedDate, historyTaskId) VALUES (?,?,?,?)",
        ["1", userId, now, taskId]
      );
      const query = `
      INSERT INTO TaskWorkflow (taskId, taskSelectedOption, taskNote, taskWorkflowDate, taskUserId, taskActionId)
      VALUES (?, ?, ?, NOW(), ?, ?)
    `;
      const [result] = await connection.execute(query, [
        taskId,
        "Workflow Started",
        "Task Created",
        userId,
        1,
      ]);

      const [rows] = await connection.execute(
        "SELECT U.userFirstName,U.userLastName,U.userEmail from Users as U WHERE userId = ?",
        [userId]
      );
      const user: User[] = Object.values(JSON.parse(JSON.stringify(rows)));
      //@ts-ignore

      try {
        const filePath = path.join(
          __dirname,
          "letters",
          "taskCreated.html"
        );
        const searchStrings = [/{{TASK_NAME}}/g, /{{USER_NAME}}/g];
        const replaceString = [
          taskName,
          `${user[0].userFirstName} ${user[0].userLastName}`,
        ];
        let emailTemplate = await fs.readFile(filePath, "utf8");
        searchStrings.map((r, i) => {
          emailTemplate = emailTemplate.replace(r, `${replaceString[i]}`);
        });
        const subject = `Confirmation: ${taskName} Has Been Created For Your Application`;
        sendEmail(emailTemplate, user[0].userEmail, subject);
      } catch (e) {
        console.warn(
          "taskCreated email template not sent:",
          (e as any)?.message || e
        );
      }

      // Real-time notify creator (and optionally watchers)
      try {
        const recipients = new Set<number>();
        recipients.add(Number(userId));
        if (Array.isArray(notifyUserIds)) {
          for (const uid of notifyUserIds) {
            const n = Number(uid);
            if (Number.isFinite(n)) recipients.add(n);
          }
        }
        // Optionally include watchers
        // const watcherIds = await taskUsers(connection, taskId);
        // for (const uid of watcherIds) recipients.add(Number(uid));
        const payload = { type: "task_created", taskId, taskName, documentTypeId };
        notifyUsers(Array.from(recipients), "notification", payload);
        await notifyUsersByDb(Array.from(recipients), "notification", payload, connection);
      } catch {}
      res.json({
        success: true,
        message: "New task created successfully",
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async indexDocument(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const {
        taskName,
        answerObjectId,
        documentTypeId,
        userId,
        taskTableId = -1,
        taskTagId = -1,
        entityId = 1,
        notifyUserIds = [],
      } = req.body;
      let documentStateId = 1;

      const [workflow] = await connection.execute(
        `SELECT WorkflowID FROM WorkflowDocumentTypes WHERE DocumentTypeID = ?`,
        [documentTypeId]
      );
      //@ts-ignore
      if (workflow.length === 0) {
        throw new Error("No workflow found for the given documentTypeId");
      }

      const workflowId = workflow[0].WorkflowID;

      const [states] = await connection.execute(
        `SELECT * FROM DocumentStates WHERE WorkflowID = ? AND steps = 1`,
        [workflowId]
      );

      //@ts-ignore
      if (states.length) {
        documentStateId = states[0].documentStateId;
      }

      const [taskResult] = await connection.execute(
        "INSERT INTO Tasks(taskName, documentTypeAnswersId, documentTypeId, userId,attachments,taskTableId,taskTagId,taskUsers,documentStateId) VALUES (?,?,?,?,?,?,?,?,?)",
        [
          taskName,
          answerObjectId,
          documentTypeId,
          userId,
          "",
          taskTableId,
          taskTagId,
          userId,
          documentStateId,
        ]
      );
      //@ts-ignore
      const taskId = taskResult.insertId;
      await connection.execute(
        "INSERT INTO TaskEntities(taskEntityId, taskId) VALUES (?,?)",
        [entityId === -1 ? 1 : entityId, taskId]
      );
      const now = new Date();
      // Insert into Notes
      await connection.execute(
        "INSERT INTO Notes(noteCreated, noteUserId, noteComment, noteTypeId, noteMentions, noteTaskId) VALUES (?,?,?,?,?,?)",
        [now, userId, "", "1", "", taskId]
      );

      // Insert into History
      await connection.execute(
        "INSERT INTO History(historyTypeId, historyUserId, historyCreatedDate, historyTaskId) VALUES (?,?,?,?)",
        ["1", userId, now, taskId]
      );
      const query = `
      INSERT INTO TaskWorkflow (taskId, taskSelectedOption, taskNote, taskWorkflowDate, taskUserId, taskActionId)
      VALUES (?, ?, ?, NOW(), ?, ?)
    `;
      const [result] = await connection.execute(query, [
        taskId,
        "Workflow Started",
        "Task Created",
        userId,
        1,
      ]);

      const [rows] = await connection.execute(
        "SELECT U.userFirstName,U.userLastName,U.userEmail from Users as U WHERE userId = ?",
        [userId]
      );
      const user: User[] = Object.values(JSON.parse(JSON.stringify(rows)));
      //@ts-ignore

      try {
        const filePath = path.join(
          __dirname,
          "letters",
          "taskCreated.html"
        );
        const searchStrings = [/{{TASK_NAME}}/g, /{{USER_NAME}}/g];
        const replaceString = [
          taskName,
          `${user[0].userFirstName} ${user[0].userLastName}`,
        ];
        let emailTemplate = await fs.readFile(filePath, "utf8");
        searchStrings.map((r, i) => {
          emailTemplate = emailTemplate.replace(r, `${replaceString[i]}`);
        });
        const subject = `Confirmation: ${taskName} Has Been Created For Your Application`;
        sendEmail(emailTemplate, user[0].userEmail, subject);
      } catch (e) {
        console.warn(
          "taskCreated email template not sent:",
          (e as any)?.message || e
        );
      }
      // Real-time notify creator (and optionally watchers)
      try {
        const recipients = new Set<number>();
        recipients.add(Number(userId));
        if (Array.isArray(notifyUserIds)) {
          for (const uid of notifyUserIds) {
            const n = Number(uid);
            if (Number.isFinite(n)) recipients.add(n);
          }
        }
        // Optionally include watchers
        // const watcherIds = await taskUsers(connection, taskId);
        // for (const uid of watcherIds) recipients.add(Number(uid));
        const payload = { type: "task_created", taskId, taskName, documentTypeId };
        notifyUsers(Array.from(recipients), "notification", payload);
        await notifyUsersByDb(Array.from(recipients), "notification", payload, connection);
      } catch {}

      res.json({
        success: true,
        message: "New task created successfully",
        taskId: taskId,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }
  async updateTask(req: Request, res: Response) {
    const connection = await mysql.createConnection(keys.database);
    try {
      const { taskId } = req.params;
      const updates = req.body ?? {};

      // Validate taskId
      const id = Number(taskId);
      if (!Number.isFinite(id) || id <= 0) {
        res.status(400).json({ success: false, message: "Invalid taskId" });
        return;
      }

      // Build dynamic SET clause from body (skip forbidden/undefined/null)
      const disallowed = new Set(["taskId", "created", "updated"]); // don't allow PK/timestamps
      const fields: string[] = [];
      const values: any[] = [];

      for (const [key, value] of Object.entries(updates)) {
        if (disallowed.has(key)) continue;
        if (value === undefined || value === null) continue; // avoid nulling unintentionally
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

      const [result] = await connection.execute<mysql.ResultSetHeader>(
        sql,
        values
      );

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
    } catch (error: any) {
      console.error("updateTask error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating task",
        error: String(error?.message ?? error),
      });
    } finally {
      await connection.end();
    }
  }
  async deleteTask(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
    } catch (error) {
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }
}

export const tasksController: TasksController = new TasksController();
