import { Request, Response } from "express";
import mysql from "mysql2/promise";
import keys from "../../../keys";

export class DocumentStatesApproversController {
  constructor() {}

  // 🔍 Get all approver role names for a given documentStateId
  async getApproversByDocumentState(req: Request, res: Response) {
    const { documentStateId } = req.params;

    if (!documentStateId) {
      return res.status(400).json({
        message: "documentStateId is required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const query = `
        SELECT 
          dsa.documentStatesApproversId,
          dsa.documentStatesId,
          dsa.roleNameId,
          srn.roleName
        FROM DocumentStatesApprovers dsa
        LEFT JOIN SuperRoleNames srn ON dsa.roleNameId = srn.roleNameId
        WHERE dsa.documentStatesId = ?
      `;

      const [rows] = await connection.execute(query, [documentStateId]);

      res.status(200).json({
        message: "Approvers retrieved successfully",
        data: rows,
        status: true,
      });
    } catch (error) {
      console.error("Error retrieving approvers:", error);
      res.status(500).json({
        message: "Failed to retrieve approvers",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  // ➕ Add new approvers to a document state
  async addApproversToDocumentState(req: Request, res: Response) {
    const { documentStatesId, roleNameIds } = req.body;

    if (
      !documentStatesId ||
      !Array.isArray(roleNameIds) ||
      roleNameIds.length === 0
    ) {
      return res.status(400).json({
        message: "documentStatesId and roleNameIds array are required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const insertQuery = `
        INSERT INTO DocumentStatesApprovers (documentStatesId, roleNameId)
        VALUES ?
      `;

      const values = roleNameIds.map((roleId: number) => [
        documentStatesId,
        roleId,
      ]);

      const [result] = await connection.query(insertQuery, [values]);

      res.status(201).json({
        message: "Approvers added successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error adding approvers:", error);
      res.status(500).json({
        message: "Failed to add approvers",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  // ❌ Delete approvers from a document state
  async deleteApproversFromDocumentState(req: Request, res: Response) {
    const { documentStatesId, roleNameIds } = req.body;

    if (
      !documentStatesId ||
      !Array.isArray(roleNameIds) ||
      roleNameIds.length === 0
    ) {
      return res.status(400).json({
        message: "documentStatesId and roleNameIds array are required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const placeholders = roleNameIds.map(() => "?").join(",");

      const deleteQuery = `
        DELETE FROM DocumentStatesApprovers
        WHERE documentStatesId = ? AND roleNameId IN (${placeholders})
      `;

      const [result] = await connection.execute(deleteQuery, [
        documentStatesId,
        ...roleNameIds,
      ]);

      res.status(200).json({
        message: "Approvers deleted successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error deleting approvers:", error);
      res.status(500).json({
        message: "Failed to delete approvers",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }
}
