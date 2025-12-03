import { Request, Response } from "express";
import mysql from "mysql2/promise";
import keys from "../../../keys";

export class AdminWorkflowController {
  constructor() {}

  async getAllWorkflows(req: Request, res: Response) {
    const connection = await mysql.createConnection(keys.database);
    try {
      const query = `
        SELECT 
          WorkflowID,
          WorkflowName,
          Description,
          CreatedAt
        FROM Workflow
        ORDER BY WorkflowID ASC
      `;

      const [rows] = await connection.execute(query);

      res.status(200).json({
        message: "Workflow data retrieved successfully",
        data: rows,
        status: true,
      });
    } catch (error) {
      console.error("Error retrieving workflow data:", error);
      res.status(500).json({
        message: "Failed to retrieve workflow data",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  async createWorkflow(req: Request, res: Response) {
    const { WorkflowName, Description } = req.body;

    if (!WorkflowName) {
      return res.status(400).json({
        message: "WorkflowName is required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const insertQuery = `
        INSERT INTO Workflow (WorkflowName, Description)
        VALUES (?, ?)
      `;
      const [result] = await connection.execute(insertQuery, [
        WorkflowName,
        Description,
      ]);

      res.status(201).json({
        message: "Workflow created successfully",
        insertedId: result["insertId"],
        status: true,
      });
    } catch (error) {
      console.error("Error creating workflow:", error);
      res.status(500).json({
        message: "Failed to create workflow",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  async updateWorkflow(req: Request, res: Response) {
    const { WorkflowID, WorkflowName, Description } = req.body;

    if (!WorkflowID || !WorkflowName) {
      return res.status(400).json({
        message: "WorkflowID and WorkflowName are required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const updateQuery = `
        UPDATE Workflow
        SET WorkflowName = ?, Description = ?
        WHERE WorkflowID = ?
      `;
      const [result] = await connection.execute(updateQuery, [
        WorkflowName,
        Description,
        WorkflowID,
      ]);

      res.status(200).json({
        message: "Workflow updated successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error updating workflow:", error);
      res.status(500).json({
        message: "Failed to update workflow",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  async deleteWorkflow(req: Request, res: Response) {
    const { WorkflowID } = req.body;

    if (!WorkflowID) {
      return res.status(400).json({
        message: "WorkflowID is required to delete",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const deleteQuery = `
        DELETE FROM Workflow WHERE WorkflowID = ?
      `;
      const [result] = await connection.execute(deleteQuery, [WorkflowID]);

      res.status(200).json({
        message: "Workflow deleted successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error deleting workflow:", error);
      res.status(500).json({
        message: "Failed to delete workflow",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  async getWorkflowDocumentTypes(req: Request, res: Response) {
    const { workflowID } = req.params;

    if (!workflowID) {
      return res.status(400).json({ message: "workflowID is required" });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const query = `
        SELECT 
          wdt.workflowDocumentTypeID,
          wdt.workflowID,
          dt.documentTypeId,
          dt.documentTypeName
        FROM WorkflowDocumentTypes wdt
        LEFT JOIN DocumentType dt ON wdt.DocumentTypeID = dt.documentTypeId
        WHERE wdt.workflowID = ?
      `;
      const [rows] = await connection.execute(query, [workflowID]);

      res.status(200).json({
        message: "Workflow document types retrieved successfully",
        data: rows,
        status: true,
      });
    } catch (error) {
      console.error("Error fetching workflow document types:", error);
      res.status(500).json({
        message: "Error retrieving data",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  async addWorkflowDocumentTypes(req: Request, res: Response) {
    const { workflowID, documentTypeIds } = req.body;
    const placeholders = documentTypeIds.map(() => "?").join(",");
    if (
      !workflowID ||
      !Array.isArray(documentTypeIds) ||
      documentTypeIds.length === 0
    ) {
      return res.status(400).json({
        message:
          "Invalid input: Provide workflowID and a non-empty array of documentTypeIds",
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      // Step 1: Validate conflicting assignments
      const checkQuery = `SELECT wdt.DocumentTypeID, dt.documentTypeName, wdt.workflowID FROM WorkflowDocumentTypes wdt JOIN DocumentType dt ON dt.documentTypeId = wdt.DocumentTypeID WHERE wdt.DocumentTypeID IN (${placeholders}) AND wdt.workflowID != ?`;

      const [conflicts] = await connection.execute(checkQuery, [
        ...documentTypeIds,
        workflowID,
      ]);

      if (Array.isArray(conflicts) && conflicts.length > 0) {
        const conflictNames = conflicts.map((row: any) => row.documentTypeName);
        return res.status(400).json({
          message:
            "Some document types are already assigned to a different workflow",
          conflictingDocuments: conflictNames,
          status: false,
        });
      }

      // Step 2: Proceed with insertion
      const insertQuery = `
        INSERT INTO WorkflowDocumentTypes (workflowID, DocumentTypeID)
        VALUES ?
      `;

      const values = documentTypeIds.map((docId: number) => [
        workflowID,
        docId,
      ]);

      const [result] = await connection.query(insertQuery, [values]);

      res.status(201).json({
        message: "Workflow document types added successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error adding workflow document types:", error);
      res.status(500).json({
        message: "Error inserting data",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  async deleteWorkflowDocumentTypes(req: Request, res: Response) {
    const { workflowID, documentTypeIds } = req.body;

    if (
      !workflowID ||
      !Array.isArray(documentTypeIds) ||
      documentTypeIds.length === 0
    ) {
      return res.status(400).json({
        message:
          "Invalid input: Provide workflowID and a non-empty array of documentTypeIds",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      // Create placeholders for each documentTypeId
      const placeholders = documentTypeIds.map(() => "?").join(",");

      const deleteQuery = `
        DELETE FROM WorkflowDocumentTypes
        WHERE workflowID = ?
        AND DocumentTypeID IN (${placeholders})
      `;

      const [result] = await connection.execute(deleteQuery, [
        workflowID,
        ...documentTypeIds,
      ]);

      res.status(200).json({
        message: "Workflow document types deleted successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error deleting workflow document types:", error);
      res.status(500).json({
        message: "Error deleting data",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }
}
