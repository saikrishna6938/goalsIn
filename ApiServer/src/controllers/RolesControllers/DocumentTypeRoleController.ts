import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../../keys";
import {
  deleteDocumentTypeRole,
  getDocumentTypeRoles,
  getFilteredDocumentTypes,
  getUserDocumentTypes,
  insertDocumentTypeRole,
  updateDocumentTypeRole,
} from "../../helpers/RolesManager/AdminManager/DocumentRoles/SuperDocumentTypeRolesHelper";

class DocumentTypeRoleController {
  async getDocumentTypeRoles(req: Request, res: Response): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const condition = req.query.documentTypeId
        ? `documentTypeId = ${req.query.documentTypeId}`
        : undefined;

      const roles = await getDocumentTypeRoles(connection, condition);

      res.status(200).json({
        success: true,
        data: roles,
      });
    } catch (err) {
      console.error("Error fetching document type roles:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching document type roles",
        error: err.message,
      });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  async insertDocumentTypeRole(req: Request, res: Response): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const body = req.body;

      await insertDocumentTypeRole(connection, body);

      res.status(201).json({
        success: true,
        message: "Document type role inserted successfully",
      });
    } catch (err) {
      console.error("Error inserting document type role:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while inserting document type role",
        error: err.message,
      });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
  async updateDocumentTypeRole(req: Request, res: Response): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const body = req.body;

      if (!body.documentTypeRoleId) {
        res.status(400).json({
          success: false,
          message:
            "documentTypeRoleId is required to update a document type role",
        });
        return;
      }

      await updateDocumentTypeRole(connection, body);

      res.status(200).json({
        success: true,
        message: "Document type role updated successfully",
      });
    } catch (err) {
      console.error("Error updating document type role:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while updating document type role",
        error: err.message,
      });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
  async deleteDocumentTypeRole(req: Request, res: Response): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const { documentTypeRoleId } = req.params;

      if (!documentTypeRoleId) {
        res.status(400).json({
          success: false,
          message:
            "documentTypeRoleId is required to delete a document type role",
        });
        return;
      }

      await deleteDocumentTypeRole(
        connection,
        parseInt(documentTypeRoleId, 10)
      );

      res.status(200).json({
        success: true,
        message: "Document type role deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting document type role:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while deleting document type role",
        error: err.message,
      });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  async getUserDocumentTypes(req: Request, res: Response): Promise<void> {
    try {
      const connection = await mysql.createConnection(keys.database);

      const { userId, typeId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: "userId is required to fetch document types",
        });
        return;
      }

      const documentTypes = await getUserDocumentTypes(
        connection,
        parseInt(userId, 10),
        parseInt(typeId, 10)
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
    }
  }

  async getFilteredDocumentTypes(req: Request, res: Response): Promise<void> {
    try {
      const connection = await mysql.createConnection(keys.database);

      const { userId, roleTypeId } = req.params;

      if (!userId || !roleTypeId) {
        res.status(400).json({
          success: false,
          message:
            "Both userId and roleTypeId are required to fetch filtered document types",
        });
        return;
      }

      const documentTypes = await getFilteredDocumentTypes(
        connection,
        parseInt(userId, 10),
        parseInt(roleTypeId, 10)
      );

      res.status(200).json({
        success: true,
        data: documentTypes,
      });
    } catch (err) {
      console.error("Error fetching filtered document types:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching filtered document types",
        error: err.message,
      });
    }
  }
}
export const documentTypeRoleController: DocumentTypeRoleController =
  new DocumentTypeRoleController();
