import * as mysql from "mysql2/promise";
import { sendEmail } from "../../EmailHelper";
import { User } from "../../modules/User";
import fs from "fs/promises";
import path from "path";
import { notifyUsers } from "../../socket";
import { notifyUsersByDb } from "../socketNotify";
export async function getTaskDetails(
  connection: mysql.Connection,
  taskId: number
) {
  const [result] = await connection.execute(
    "SELECT *,Tasks.taskId as id from Tasks WHERE taskId = ?",
    [taskId]
  );
  return result as any;
}

export async function addTask(connection: mysql.Connection, details: any) {
  const {
    taskName,
    answerObjectId,
    documentTypeId,
    userId,
    taskTableId = -1,
    taskTagId = -1,
    entityId = 1,
    notifyUserIds = [],
  } = details;
  let documentStateId = 1;
  try {
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
    // Try to send email; do not fail task creation if template is missing
    try {
      const filePath = path.join(__dirname, "letters", "taskCreated.html");
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
      console.warn("taskCreated email template not sent:", (e as any)?.message || e);
    }

    // Push real-time notifications to connected recipients
    try {
      const recipients = new Set<number>();
      recipients.add(Number(userId));
      if (Array.isArray(notifyUserIds)) {
        for (const uid of notifyUserIds) {
          const n = Number(uid);
          if (Number.isFinite(n)) recipients.add(n);
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
      notifyUsers(Array.from(recipients), "notification", payload);
      // Also emit directly via socketIds stored in Users table (fallback)
      await notifyUsersByDb(Array.from(recipients), "notification", payload, connection);
    } catch {}
    connection.end();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
//get documentType Roles by DocumentTypeId
export async function getDocumentTypeRoles(
  connection: mysql.Connection,
  documentTypeId: number
) {
  return [];
  const [result] = await connection.execute(
    `SELECT * FROM DocumentTypeRoles WHERE documentTypeId = ?`,
    [documentTypeId]
  );
  return result as any;
}

export async function taskRoles(
  connection: mysql.Connection,
  documentTypeRoleIds: any[]
) {
  const roleIds: number[] = [];

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

    const [result] = await connection.execute(query, [documentTypeRoleId]);

    //@ts-ignore
    const documentTypeRoleIds = result.map((row: any) => row.roleId);

    // Add the roleIds to the final array
    roleIds.push(...documentTypeRoleIds);
  }
  return Array.from(new Set(roleIds));
}

export async function updateTaskUsers(
  connection: mysql.Connection,
  taskId,
  taskUsers
) {
  try {
    // Corrected query with parameterized inputs
    const [result] = await connection.execute(
      `UPDATE Tasks SET taskUsers = ? WHERE taskId = ?`,
      [taskUsers, taskId]
    );

    connection.end();
    if (result[0]) return result[0];
    else return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function taskEntity(connection: mysql.Connection, taskId: number) {
  const [result] = await connection.execute(
    `SELECT U.entities FROM Tasks T INNER JOIN Users U ON U.userId = T.userId WHERE taskId = ?`,
    [taskId]
  );
  //@ts-ignore
  if (result.length > 0) {
    return result[0].entities as any;
  } else {
    return "";
  }
}

export async function taskUsers(connection: mysql.Connection, taskId: number) {
  const taskDetails = await getTaskDetails(connection, taskId);
  const userIds: number[] = [];
  if (taskDetails.length > 0) {
    const documentTypeRoles = await getDocumentTypeRoles(
      connection,
      taskDetails[0].documentTypeId
    );

    const documentTypeRoleIds = Array.from(
      new Set(documentTypeRoles.map((item) => item.documentTypeRoleId))
    );
    const roleIds = await taskRoles(connection, documentTypeRoleIds);
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
      const [result] = await connection.execute(query, [roleId]);
      //@ts-ignore
      const users = result.map((row: any) => row.userId);

      // Add the roleIds to the final array
      userIds.push(...users);
    }
    return Array.from(new Set(userIds));
  } else {
    return [];
  }
}

export enum Permissions {
  "Edit" = 1,
  "Delete" = 2,
  "Create" = 3,
  "View" = 4,
  "Action" = 5,
}
