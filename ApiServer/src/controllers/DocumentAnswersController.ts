import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../keys";
import fs from "fs/promises";
import path from "path";
import { sendEmail } from "../EmailHelper";
import { User } from "../modules/User";
import { getEntityRoleName } from "../helpers/RolesManager/AdminManager/UserManager/UserRolesManagerHelper";
import { getUserDocumentTypes } from "../helpers/RolesManager/AdminManager/DocumentRoles/SuperDocumentTypeRolesHelper";
import { addTask } from "../helpers/tasks/TaskHelpers";
import {
  getGroupIndexTypeByTaskId,
  getIndexName,
} from "./Tasks/groupIndexType";
class DocumentAnswersController {
  async getDocumentAnswerObject(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const { taskId } = req.body;
      connection = await mysql.createConnection(keys.database);
      // Fetch answer id plus helpful context so we can normalize shapes
      const [rows] = await connection.execute(
        `SELECT documentTypeAnswersId, documentTypeId, userId FROM Tasks WHERE taskId = ?`,
        [taskId]
      );
      if (rows[0]) {
        const documentTypeAnswersId = rows[0].documentTypeAnswersId;
        const taskDocumentTypeId = rows[0].documentTypeId;
        const taskUserId = rows[0].userId;
        const indexType = await getIndexName(taskId);
        if (indexType === "Index") {
          // Get DocumentTagAnswers then map keys to DocumentTypeAnswers-like keys
          const [result] = await connection.execute(
            `SELECT * FROM DocumentTagAnswers WHERE documentTagAnswersId = ?`,
            [documentTypeAnswersId]
          );
          //@ts-ignore
          const tagRow = result && result.length ? result[0] : null;
          if (!tagRow) {
            res.json({ status: false, message: "No records found", data: {} });
            return;
          }
          // Map to DocumentTypeAnswers shape
          const normalized = {
            documentTypeAnswersId: tagRow.documentTagAnswersId,
            documentTypeAnswersObject: tagRow.documentTagAnswersObject,
            documentTypeId: taskDocumentTypeId ?? null,
            userId: taskUserId ?? null,
            createdDate: tagRow.createdDate ?? null,
            updatedDate: tagRow.updatedDate ?? null,
          };
          res.json({ status: true, message: "Success", data: normalized });
        } else {
          const [result] = await connection.execute(
            `SELECT *  FROM  DocumentTypeAnswers WHERE documentTypeAnswersId = ?`,
            [documentTypeAnswersId]
          );
          res.json({ status: true, message: "Success", data: result[0] });
        }
      } else {
        res.json({ status: false, message: "Failed", data: {} });
      }
    } catch (error) {
      console.log(error);
      res.json({ status: false, message: "Failed to get object" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async getUserAndDocumentDetailsByAnswerId(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const { documentTypeAnswersId } = req.body; // Assuming you're getting documentTypeAnswersId from the request body.
      connection = await mysql.createConnection(keys.database);
      const [rows] = await connection.execute(
        `SELECT 
           Users.userId AS id,
           Users.userName,
           CONCAT(Users.userFirstName, ' ', Users.userLastName) AS Name,
           Users.userEnabled,
           Users.userLocked,
           Users.userEmail,
           Users.userImage,
           DocumentTypeAnswers.*,
           DocumentType.*,
           DocumentGroup.groupTypeId,
           DocumentTypeObject.documentTypeObject
         FROM DocumentTypeAnswers
         JOIN Users ON Users.userId = DocumentTypeAnswers.userId
         LEFT JOIN DocumentType ON DocumentTypeAnswers.documentTypeId = DocumentType.documentTypeId
         LEFT JOIN DocumentGroup ON DocumentGroup.documentGroupId = DocumentType.documentGroupId
         INNER JOIN DocumentTypeObject ON DocumentTypeObject.documentTypeObjectId = DocumentType.documentTypeObjectId
         WHERE DocumentTypeAnswers.documentTypeAnswersId = ?;`,
        [documentTypeAnswersId]
      );
      //@ts-ignore
      let parsedData = rows.map((item) => {
        // Parse the documentTypeObject string into a JavaScript object
        let documentTypeObject = JSON.parse(item.documentTypeObject);

        // Return a new object that includes the original data plus the parsed object
        return {
          ...item,
          documentTypeObject,
        };
      });
      //@ts-ignore
      if (rows && rows.length > 0) {
        res.json({ status: true, message: "Success", data: parsedData[0] });
      } else {
        res.json({ status: false, message: "No records found", data: {} });
      }
    } catch (error) {
      console.log(error);
      res.json({
        status: false,
        message: "Failed to get user and document details",
      });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async getApplications(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const userIdInput = (req.body as any)?.userId ?? req.query?.userId;
      const entityIdInput = (req.body as any)?.entityId ?? req.query?.entityId;
      const normalizeNumeric = (value: unknown): number | null => {
        if (typeof value === "number") {
          return Number.isNaN(value) ? null : value;
        }
        if (typeof value === "string") {
          const parsed = parseInt(value.trim(), 10);
          return Number.isNaN(parsed) ? null : parsed;
        }
        return null;
      };
      const userId = normalizeNumeric(userIdInput);
      const entityId = normalizeNumeric(entityIdInput);
      if (userId === null) {
        res.status(400).json({ status: false, message: "userId is required" });
        return;
      }
      if (entityId === null) {
        res
          .status(400)
          .json({ status: false, message: "entityId is required" });
        return;
      }
      const rawPeriod = (req.query.period ?? req.body.period) as
        | string
        | number
        | undefined;
      const periodValue = (() => {
        if (typeof rawPeriod === "number") return rawPeriod;
        if (typeof rawPeriod === "string") {
          const parsed = parseInt(rawPeriod, 10);
          return Number.isNaN(parsed) ? undefined : parsed;
        }
        return undefined;
      })();
      const allowedPeriods = new Set([3, 6, 9, 12]);
      let periodStartDate: string | null = null;
      if (periodValue && allowedPeriods.has(periodValue)) {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - periodValue);
        periodStartDate = startDate.toISOString().slice(0, 19).replace("T", " ");
      }
      connection = await mysql.createConnection(keys.database);
      const entityRoleName = await getEntityRoleName(connection, entityId);
      console.log(entityRoleName);
      const accessibleDocumentTypes = await getUserDocumentTypes(
        connection,
        userId
      );
      const documentTypeIds = accessibleDocumentTypes
        .map((doc) => doc.documentTypeId)
        .filter((id): id is number => typeof id === "number" && !Number.isNaN(id));
      if (documentTypeIds.length === 0) {
        res.json({ status: true, message: "No records", data: [] });
        return;
      }
      const periodFilterClause = periodStartDate
        ? " AND COALESCE(DocumentTypeAnswers.updatedDate, DocumentTypeAnswers.createdDate) >= ?"
        : "";
      const docTypePlaceholders = documentTypeIds.map(() => "?").join(", ");
      const docTypeFilterClause = ` AND DocumentType.documentTypeId IN (${docTypePlaceholders})`;
      const queryParams = [entityRoleName, ...documentTypeIds];
      if (periodStartDate) {
        queryParams.push(periodStartDate);
      }
      const [rows] = await connection.execute(
        `SELECT 
            Users.userId,
            Users.userName,
            CONCAT(Users.userFirstName, ' ', Users.userLastName) AS Name,
            Users.userEnabled,
            Users.userLocked,
            DocumentTypeAnswers.documentTypeAnswersId AS id,
            DocumentTypeAnswers.createdDate,
            DocumentTypeAnswers.updatedDate,
            dg.documentGroupName,
            DocumentType.documentTypeId,
            DocumentType.documentTypeName,
           DocumentType.documentTypeTableId
        FROM DocumentTypeAnswers
        LEFT JOIN DocumentType ON DocumentTypeAnswers.documentTypeId = DocumentType.documentTypeId
        LEFT JOIN DocumentGroup dg ON dg.documentGroupId = DocumentType.documentGroupId 
        JOIN SuperUserRoles sur ON sur.userRoleNameId = ?
        JOIN Users ON Users.userId = sur.userId
        WHERE Users.userId = DocumentTypeAnswers.userId AND dg.groupTypeId = 2${docTypeFilterClause}${periodFilterClause}`,
        queryParams
      );

      //@ts-ignore
      if (rows && rows.length > 0) {
        res.json({ status: true, message: "Success", data: rows });
      } else {
        res.json({ status: true, message: "No records", data: [] });
      }
    } catch (error) {
      console.log(error);
      res.json({
        status: false,
        message: "Failed to get user and document details",
      });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async indexDocumentAnswerObject(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const {
        documentTypeId,
        userId,
        documentTypeAnswersObject,
        tasks,
        entityId,
        notifyUserIds = [],
      } = req.body;
      connection = await mysql.createConnection(keys.database);

      const [result] = await connection.execute(
        "INSERT INTO DocumentTypeAnswers(documentTypeId,userId,documentTypeAnswersObject) VALUES (?,?,?)",
        [documentTypeId, userId, documentTypeAnswersObject]
      );

      //@ts-ignore
      const lastInsertId = result.insertId;

      const [rows] = await connection.execute(
        "SELECT U.userFirstName,U.userLastName,U.userEmail from Users as U WHERE userId = ?",
        [userId]
      );
      const user: User[] = Object.values(JSON.parse(JSON.stringify(rows)));

      try {
        const filePath = path.join(
          __dirname,
          "letters",
          "applicationSubmitted.html"
        );
        const searchStrings = [/{{USER_NAME}}/g];
        const replaceString = [
          `${user[0].userFirstName} ${user[0].userLastName}`,
        ];
        let emailTemplate = await fs.readFile(filePath, "utf8");
        searchStrings.map((r, i) => {
          emailTemplate = emailTemplate.replace(r, `${replaceString[i]}`);
        });
        const subject = "Profile Submitted Successfully";
        sendEmail(emailTemplate, user[0].userEmail, subject);
      } catch (e) {
        console.warn(
          "applicationSubmitted email template not sent:",
          (e as any)?.message || e
        );
      }
      res.json({ status: true, message: "Added Successfully" });
    } catch (error) {
      console.log(error);
      res.json({ status: false, message: "Failed to Add DocumentTypeObject" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async addDocumentAnswerObject(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const {
        documentTypeId,
        userId,
        documentTypeAnswersObject,
        tasks,
        entityId,
      } = req.body;
      connection = await mysql.createConnection(keys.database);

      const [result] = await connection.execute(
        "INSERT INTO DocumentTypeAnswers(documentTypeId,userId,documentTypeAnswersObject) VALUES (?,?,?)",
        [documentTypeId, userId, documentTypeAnswersObject]
      );

      //@ts-ignore
      const lastInsertId = result.insertId;
      const [rows] = await connection.execute(
        "SELECT U.userFirstName,U.userLastName,U.userEmail from Users as U WHERE userId = ?",
        [userId]
      );
      const user: User[] = Object.values(JSON.parse(JSON.stringify(rows)));
      const [docType] =
        (await connection.execute(
          "SELECT * from DocumentType WHERE documentTypeId = ?",
          [documentTypeId]
        )) ?? [];
      const taskAdded = addTask(connection, {
        taskName: `${user[0].userFirstName} ${user[0].userLastName} - ${docType[0].documentTypeName}`,
        answerObjectId: lastInsertId,
        documentTypeId,
        userId,
        taskTableId: -1,
        taskTagId: -1,
        entityId,
        notifyUserIds: [],
      });

      try {
        const filePath = path.join(
          __dirname,
          "letters",
          "applicationSubmitted.html"
        );
        const searchStrings = [/{{USER_NAME}}/g];
        const replaceString = [
          `${user[0].userFirstName} ${user[0].userLastName}`,
        ];
        let emailTemplate = await fs.readFile(filePath, "utf8");
        searchStrings.map((r, i) => {
          emailTemplate = emailTemplate.replace(r, `${replaceString[i]}`);
        });
        const subject = "Profile Submitted Successfully";
        sendEmail(emailTemplate, user[0].userEmail, subject);
      } catch (e) {
        console.warn(
          "applicationSubmitted email template not sent:",
          (e as any)?.message || e
        );
      }

      res.json({ status: true, message: "Added Successfully", taskAdded });
    } catch (error) {
      console.log(error);
      res.json({ status: false, message: "Failed to Add DocumentTypeObject" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async updateDocumentAnswerObject(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const { documentAnswerObject, documentTypeAnswerId } = req.body;

      if (
        documentAnswerObject === undefined ||
        documentAnswerObject === null ||
        !documentTypeAnswerId
      ) {
        return res.json({
          status: false,
          message:
            "Missing required fields: documentAnswerObject, documentTypeAnswerId",
        });
      }

      connection = await mysql.createConnection(keys.database);
      const [result] = await connection.execute(
        `UPDATE DocumentTypeAnswers 
         SET documentTypeAnswersObject = ?, updatedDate = CURRENT_TIMESTAMP 
         WHERE documentTypeAnswersId = ?`,
        [documentAnswerObject, documentTypeAnswerId]
      );

      // @ts-ignore - mysql2 result typing
      const { affectedRows } = result || {};

      if (!affectedRows) {
        return res.json({
          status: false,
          message: "No record updated. Invalid documentTypeAnswerId",
        });
      }

      return res.json({ status: true, message: "Updated Successfully" });
    } catch (error) {
      console.log(error);
      return res.json({
        status: false,
        message: "Failed to update DocumentAnswerObject",
      });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }
  async DeleteDocumentAnswerObject(req: Request, res: Response) {
    try {
      const connection = await mysql.createConnection(keys.database);
    } catch (error) {}
  }
}

export const documentAnswers: DocumentAnswersController =
  new DocumentAnswersController();
