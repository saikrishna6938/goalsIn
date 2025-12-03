import { Request, Response } from "express";
import mysql from "mysql2/promise";
import keys from "../../../keys";

export class AdminDocumentTypesRolesController {
  constructor() {}

  async getDocumentTypeRoles(req: Request, res: Response) {
    const { documentTypeId } = req.params;

    const connection = await mysql.createConnection(keys.database);
    try {
      const query = `
        SELECT 
          dtr.documentSecurity,
          dtr.roleNameId,
          srn.roleName
        FROM SuperDocumentTypeRoles dtr
        LEFT JOIN SuperRoleNames srn ON dtr.roleNameId = srn.roleNameId
        WHERE dtr.documentTypeId = ?
      `;
      const [rows] = await connection.execute(query, [documentTypeId]);

      res.status(200).json({ rows, status: true });
    } catch (error) {
      console.error("Error fetching DocumentTypeRoles:", error);
      res.status(500).json({
        message: "Error fetching DocumentTypeRoles",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  async addDocumentTypeRoles(req: Request, res: Response) {
    const roles = req.body;

    if (!Array.isArray(roles) || roles.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid input: must be a non-empty array" });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const insertQuery = `
        INSERT INTO SuperDocumentTypeRoles (
          documentTypeId,
          documentSecurity,
          roleNameId
        ) VALUES ?
      `;

      const values = roles.map((role) => [
        role.documentTypeId,
        role.documentSecurity || "1", // assuming 'permissions' maps to documentSecurity
        role.roleNameId,
      ]);

      const [result] = await connection.query(insertQuery, [values]);

      res.status(201).json({
        message: "Roles added successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error adding roles:", error);
      res
        .status(500)
        .json({ message: "Error adding roles", error, status: false });
    } finally {
      await connection.end();
    }
  }

  async deleteDocumentTypeRoles(req: Request, res: Response) {
    const { roleIds, documentTypeId } = req.body;

    if (!Array.isArray(roleIds) || roleIds.length === 0 || !documentTypeId) {
      return res
        .status(400)
        .json({ message: "Invalid input: Provide roleIds and documentTypeId" });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const deleteQuery = `
        DELETE FROM SuperDocumentTypeRoles 
        WHERE roleNameId IN (?) AND documentTypeId = ?
      `;
      const [result] = await connection.query(deleteQuery, [
        roleIds,
        documentTypeId,
      ]);

      res.status(200).json({
        message: "Roles deleted successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error deleting roles:", error);
      res
        .status(500)
        .json({ message: "Error deleting roles", error, status: false });
    } finally {
      await connection.end();
    }
  }
}
