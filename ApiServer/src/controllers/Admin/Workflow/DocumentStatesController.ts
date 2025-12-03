import { Request, Response } from "express";
import mysql from "mysql2/promise";
import keys from "../../../keys";

export class DocumentStatesController {
  constructor() {}

  // 🔍 Get all document states by workflowID
  async getDocumentStatesByWorkflow(req: Request, res: Response) {
    const { workflowID } = req.params;

    if (!workflowID) {
      return res.status(400).json({
        message: "workflowID is required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const query = `
        SELECT 
          documentStateId,
          documentStateName,
          documentStateDescription,
          documentStateCreatedDate,
          documentStateUpdatedDate,
          WorkflowID,
          steps
        FROM DocumentStates
        WHERE WorkflowID = ?
        ORDER BY documentStateId ASC
      `;

      const [rows] = await connection.execute(query, [workflowID]);

      res.status(200).json({
        message: "Document states retrieved successfully",
        data: rows,
        status: true,
      });
    } catch (error) {
      console.error("Error retrieving document states:", error);
      res.status(500).json({
        message: "Failed to retrieve document states",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  // ➕ Create a new document state
  async createDocumentState(req: Request, res: Response) {
    const { documentStateName, documentStateDescription, WorkflowID, steps } =
      req.body;

    if (!documentStateName || !WorkflowID) {
      return res.status(400).json({
        message: "documentStateName and WorkflowID are required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const query = `
        INSERT INTO DocumentStates (
          documentStateName,
          documentStateDescription,
          documentStateCreatedDate,
          documentStateUpdatedDate,
          WorkflowID,
          steps
        ) VALUES (?, ?, NOW(), NOW(), ?, ?)
      `;

      const [result] = await connection.execute(query, [
        documentStateName,
        documentStateDescription,
        WorkflowID,
        steps,
      ]);

      res.status(201).json({
        message: "Document state created successfully",
        insertedId: result["insertId"],
        status: true,
      });
    } catch (error) {
      console.error("Error creating document state:", error);
      res.status(500).json({
        message: "Failed to create document state",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  // ✏️ Update an existing document state
  async updateDocumentState(req: Request, res: Response) {
    const {
      documentStateId,
      documentStateName,
      documentStateDescription,
      steps,
    } = req.body;

    if (!documentStateId || !documentStateName) {
      return res.status(400).json({
        message: "documentStateId and documentStateName are required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const query = `
        UPDATE DocumentStates
        SET documentStateName = ?,
            documentStateDescription = ?,
            documentStateUpdatedDate = NOW(),
            steps = ?
        WHERE documentStateId = ?
      `;

      const [result] = await connection.execute(query, [
        documentStateName,
        documentStateDescription,
        steps,
        documentStateId,
      ]);

      res.status(200).json({
        message: "Document state updated successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error updating document state:", error);
      res.status(500).json({
        message: "Failed to update document state",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  // ❌ Delete a document state
  async deleteDocumentState(req: Request, res: Response) {
    const { documentStateId } = req.body;

    if (!documentStateId) {
      return res.status(400).json({
        message: "documentStateId is required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const query = `
        DELETE FROM DocumentStates
        WHERE documentStateId = ?
      `;

      const [result] = await connection.execute(query, [documentStateId]);

      res.status(200).json({
        message: "Document state deleted successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error deleting document state:", error);
      res.status(500).json({
        message: "Failed to delete document state",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  async reorderDocumentStates(req: Request, res: Response) {
    const { workflowID, reorderedStates } = req.body;

    if (
      !workflowID ||
      !Array.isArray(reorderedStates) ||
      reorderedStates.length === 0
    ) {
      return res.status(400).json({
        message: "workflowID and reorderedStates array are required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      await connection.beginTransaction();

      const updatePromises = reorderedStates.map((item: any, index: number) => {
        return connection.execute(
          `UPDATE DocumentStates SET steps = ?, documentStateUpdatedDate = NOW() WHERE documentStateId = ? AND WorkflowID = ?`,
          [index + 1, item.documentStateId, workflowID]
        );
      });

      await Promise.all(updatePromises);
      await connection.commit();

      res.status(200).json({
        message: "Document states reordered successfully",
        status: true,
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error reordering document states:", error);
      res.status(500).json({
        message: "Failed to reorder document states",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }
}
