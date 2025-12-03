import { Request, Response } from "express";
import mysql from "mysql2/promise";
import keys from "../../../keys";

export class StateActionsController {
  constructor() {}

  // 🔍 Get all actions for a given documentStateId
  async getActionsByDocumentState(req: Request, res: Response) {
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
          actionId,
          documentStateId,
          actionName,
          actionDescription,
          actionCreatedDate,
          actionUpdatedDate,
          optionId
        FROM Actions
        WHERE documentStateId = ?
        ORDER BY actionId ASC
      `;

      const [rows] = await connection.execute(query, [documentStateId]);

      res.status(200).json({
        message: "Actions retrieved successfully",
        data: rows,
        status: true,
      });
    } catch (error) {
      console.error("Error retrieving actions:", error);
      res.status(500).json({
        message: "Failed to retrieve actions",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  // ➕ Add a new action to a document state
  async addAction(req: Request, res: Response) {
    const { documentStateId, actionName, actionDescription, optionId } =
      req.body;

    if (!documentStateId || !actionName) {
      return res.status(400).json({
        message: "documentStateId and actionName are required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const insertQuery = `
        INSERT INTO Actions (
          documentStateId,
          actionName,
          actionDescription,
          actionCreatedDate,
          actionUpdatedDate,
          optionId
        ) VALUES (?, ?, ?, NOW(), NOW(), ?)
      `;

      const [result] = await connection.execute(insertQuery, [
        documentStateId,
        actionName,
        actionDescription,
        optionId,
      ]);

      res.status(201).json({
        message: "Action added successfully",
        insertedId: result["insertId"],
        status: true,
      });
    } catch (error) {
      console.error("Error adding action:", error);
      res.status(500).json({
        message: "Failed to add action",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  // ❌ Delete an action
  async deleteAction(req: Request, res: Response) {
    const { actionId } = req.body;

    if (!actionId) {
      return res.status(400).json({
        message: "actionId is required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const deleteQuery = `
        DELETE FROM Actions WHERE actionId = ?
      `;

      const [result] = await connection.execute(deleteQuery, [actionId]);

      res.status(200).json({
        message: "Action deleted successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error deleting action:", error);
      res.status(500).json({
        message: "Failed to delete action",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  // ✏️ Update an action
  async updateAction(req: Request, res: Response) {
    const { actionId, actionName, actionDescription, optionId } = req.body;

    if (!actionId || !actionName) {
      return res.status(400).json({
        message: "actionId and actionName are required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const updateQuery = `
        UPDATE Actions
        SET actionName = ?,
            actionDescription = ?,
            actionUpdatedDate = NOW(),
            optionId = ?
        WHERE actionId = ?
      `;

      const [result] = await connection.execute(updateQuery, [
        actionName,
        actionDescription,
        optionId,
        actionId,
      ]);

      res.status(200).json({
        message: "Action updated successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error updating action:", error);
      res.status(500).json({
        message: "Failed to update action",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }
}
