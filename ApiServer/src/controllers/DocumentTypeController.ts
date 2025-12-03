import { Request, Response, response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../keys";
import { getUserDocumentTypes } from "../helpers/RolesManager/AdminManager/DocumentRoles/SuperDocumentTypeRolesHelper";
class DocumentTypeController {
  async addDocumentType(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const {
        documentTypeName,
        documentTypeDescription,
        documentTypeObjectId,
      } = req.body;
      connection = await mysql.createConnection(keys.database);
      await connection.execute(
        "INSERT INTO DocumentType(documentTypeName, documentTypeDescription, documentTypeObjectId) VALUES (?,?,?)",
        [documentTypeName, documentTypeDescription, documentTypeObjectId]
      );
      res.json({ status: true, message: "Added Successfully" });
    } catch (error) {
      res.json({ status: false, message: "Failed" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  async updateDocumentType(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const documentTypeId = req.params.documentTypeId;
      const {
        documentTypeName,
        documentTypeDescription,
        documentTypeObjectId,
      } = req.body;
      connection = await mysql.createConnection(keys.database);
      await connection.execute(
        "UPDATE DocumentType SET documentTypeName = ?, documentTypeDescription = ?, documentTypeObjectId = ? WHERE documentTypeId = ?",
        [
          documentTypeName,
          documentTypeDescription,
          documentTypeObjectId,
          documentTypeId,
        ]
      );
      res.json({ status: true, message: "Updated Successfully" });
    } catch (error) {
      console.log(error);
      res.json({ status: false, message: "Failed" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
  async deleteDocumentType(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const documentTypeId = req.params.documentTypeId;
      connection = await mysql.createConnection(keys.database);
      await connection.execute(
        "DELETE from DocumentType WHERE documentTypeId = ?",
        [documentTypeId]
      );
      res.json({ status: true, message: "Deleted Successfully" });
    } catch (error) {
      res.json({ status: false, message: "Failed" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  async getDocumentType(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const documentTypeId = req.params.documentTypeId;
      connection = await mysql.createConnection(keys.database);
      const [result] =
        (await connection.execute(
          "SELECT * from DocumentType WHERE documentTypeId = ?",
          [documentTypeId]
        )) ?? [];
      res.json({ status: true, message: "Success", data: result });
    } catch (error) {
      res.json({ status: false, message: "Failed", data: [] });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
  async getTaskUserEntity(taskId) {
    try {
      const connection = await mysql.createConnection(keys.database);

      // First, check if the DocumentType exists
      const [entities] =
        (await connection.execute(
          "SELECT u.entities FROM Tasks t JOIN Users u ON u.userId = t.userId WHERE t.taskId = ?",
          [taskId]
        )) ?? [];
      return entities;
    } catch (error) {
      return "";
    }
  }
  async getDocumentTypeUsers(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const { documentTypeId, isAdminEntity, taskId } = req.body;
      connection = await mysql.createConnection(keys.database);

      // First, check if the DocumentType exists
      const [documentTypeResult] =
        (await connection.execute(
          "SELECT * FROM DocumentType WHERE documentTypeId = ?",
          [documentTypeId]
        )) ?? [];
      //@ts-ignore
      if (documentTypeResult.length === 0) {
        throw new Error("DocumentType not found");
      }
      const [row] =
        (await connection.execute(
          "SELECT u.entities FROM Tasks t JOIN Users u ON u.userId = t.userId WHERE t.taskId = ?",
          [taskId]
        )) ?? [];
      let entities = "";
      //@ts-ignore
      if (row.length > 0) {
        entities = row[0].entities;
      }
      if (isAdminEntity) {
        entities = entities + "," + "1";
      }
      let usersQuery = `
    SELECT DISTINCT u.userId, u.userName, u.userEmail, u.userFirstName, u.userLastName
    FROM Users u
    JOIN Roles r ON FIND_IN_SET(r.roleId, u.roles)
    JOIN RoleTypes rt ON FIND_IN_SET(rt.roleTypeId, r.roles)
    JOIN DocumentTypeRoles dtr ON rt.roleTypeId = dtr.documentTypeRoleId
    WHERE dtr.documentTypeId = ? AND (
        ${entities
          .split(",")
          .map((entity) => `FIND_IN_SET(${entity}, u.entities) > 0`)
          .join(" OR ")}
    )
`;
      const [usersResult] = await connection.execute(usersQuery, [
        documentTypeId,
      ]);

      res.json({ status: true, message: "Success", data: usersResult });
    } catch (error) {
      console.error(error); // Logging the error for debugging purposes
      res.json({ status: false, message: "Failed", data: [] });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  async getDocumentTypeByRoles(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: "userId is required to fetch document types",
        });
        return;
      }

      const documentTypes = await getUserDocumentTypes(
        connection,
        parseInt(userId, 10)
      );

      res.status(200).json({
        success: true,
        data: documentTypes,
      });
    } catch (err) {
      console.error("Error fetching document types for user:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching document types",
        error: err.message,
      });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  async addDocumentTypeObject(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const { documentTypeObject } = req.body;
      connection = await mysql.createConnection(keys.database);
      await connection.execute(
        "INSERT INTO DocumentTypeObject(documentTypeObject) VALUES (?)",
        [documentTypeObject]
      );
      res.json({ status: true, message: "Added Successfully" });
    } catch (error) {
      res.json({ status: false, message: "Failed to Add DocumentTypeObject" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
  async updateDocumentTypeObject(req: Request, res: Response) {
    const documentTypeObjectId = req.params.documentTypeObjectId;
    const { documentTypeObject } = req.body;
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      await connection.execute(
        "UPDATE DocumentTypeObject SET documentTypeObject = ? WHERE documentTypeObjectId = ?",
        [documentTypeObject, documentTypeObjectId]
      );
      res.json({ status: true, message: "Updated Successfully" });
    } catch (error) {
      res.json({ status: false, message: "Failed to update" });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }
  async getDocumentTypeObjectById(req: Request, res: Response) {
    const documentTypeId = req.params.documentTypeId;
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const query =
        "SELECT documentTypeObjectId FROM DocumentType WHERE documentTypeId = ?";
      const params = [documentTypeId];
      const [types] = await connection.execute(query, params);

      //@ts-ignore
      const documentTypeObjectId = types[0].documentTypeObjectId ?? -1;
      const result =
        (await connection.execute(
          "SELECT * from DocumentTypeObject WHERE documentTypeObjectId = ?",
          [documentTypeObjectId]
        )) ?? [];
      const response: any = result[0];
      let parsedData = response.map((item) => {
        // Parse the documentTypeObject string into a JavaScript object
        let documentTypeObject = JSON.parse(item.documentTypeObject);

        // Return a new object that includes the original data plus the parsed object
        return {
          ...item,
          documentTypeObject,
        };
      });
      res.json({
        status: true,
        message: "success",
        data: parsedData,
      });
    } catch (error) {
      res.json({ status: false, message: "failed" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  async getDocumentTypesByUserType(req: Request, res: Response) {
    const userType = req.params.userTypeId;
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const dataObj: any =
        (await connection.execute(
          "SELECT * FROM `UserDocumentsPermission` WHERE `userType`=?",
          [userType]
        )) ?? [];
      const documentTypes: any[] = dataObj[0];
      let userDocuments = [];
      await Promise.all(
        await documentTypes.map(async (r) => {
          const types: any =
            (await connection.execute(
              "SELECT * FROM `DocumentType` WHERE `documentTypeId`=?",
              [r.documentTypeId]
            )) ?? [];
          userDocuments = [...userDocuments, ...types[0]];
        })
      );
      res.json({ status: true, message: "success", data: userDocuments });
    } catch (error) {
      res.json({ status: false, message: "failed" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
  async deleteDocumentTypeObject(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const documentTypeObjectId = req.params.documentTypeObjectId;
      connection = await mysql.createConnection(keys.database);
      await connection.execute(
        "DELETE FROM DocumentTypeObject WHERE documentTypeObjectId = ?",
        [documentTypeObjectId]
      );

      res.json({ status: true, message: "Deleted Successfully" });
    } catch (error) {
      res.json({ status: false, message: "Failed to delete" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
}

export const documentController: DocumentTypeController =
  new DocumentTypeController();
