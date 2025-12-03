import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../../../keys";

export class AdminDocumentTagController {
  // Create a new document tag object
  async createDocumentTag(req: Request, res: Response) {
    const { name, description, documentTagObject } = req.body;

    if (!name || !documentTagObject) {
      return res.status(400).json({
        success: false,
        message: "Required fields: name, documentTagObject",
      });
    }

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const [result] = await connection.execute(
        `INSERT INTO DocumentTagObject (name, description, documentTagObject)
         VALUES (?, ?, ?)`,
        [name, description || null, JSON.stringify(documentTagObject)]
      );
      

      res.status(201).json({
        success: true,
        message: "Document tag created successfully.",
        insertId: (result as any).insertId,
      });
    } catch (error) {
      console.error("Error creating document tag:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create document tag.",
      });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  // Get all document tag objects
  async getAllDocumentTags(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const [rows] = await connection.execute(
        `SELECT documentTagObjectId, name, description, updated, created 
       FROM DocumentTagObject`
      );
      

      const parsedRows = (rows as any[]).map((row) => ({
        ...row,
      }));

      res.json({ success: true, data: parsedRows });
    } catch (error) {
      console.error("Error fetching document tags:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch document tags.",
      });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  // Update a document tag object
  async updateDocumentTag(req: Request, res: Response) {
    const { id } = req.params;
    const { name, description, documentTagObject } = req.body;

    if (!name || !documentTagObject) {
      return res.status(400).json({
        success: false,
        message: "Required fields: name, documentTagObject",
      });
    }

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const [result] = await connection.execute(
        `UPDATE DocumentTagObject
         SET name = ?, description = ?, documentTagObject = ?, updated = CURRENT_TIMESTAMP
         WHERE documentTagObjectId = ?`,
        [name, description || null, JSON.stringify(documentTagObject), id]
      );
      

      if ((result as any).affectedRows > 0) {
        res.json({
          success: true,
          message: "Document tag updated successfully.",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Document tag not found.",
        });
      }
    } catch (error) {
      console.error("Error updating document tag:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update document tag.",
      });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  // Delete a document tag object
  async deleteDocumentTag(req: Request, res: Response) {
    const { id } = req.params;

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const [result] = await connection.execute(
        `DELETE FROM DocumentTagObject WHERE documentTagObjectId = ?`,
        [id]
      );
      

      if ((result as any).affectedRows > 0) {
        res.json({
          success: true,
          message: "Document tag deleted successfully.",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Document tag not found.",
        });
      }
    } catch (error) {
      console.error("Error deleting document tag:", error);
      res.status(500).json({
        success: false,
        message:
          "Failed to delete document tag. check if any document type is using this",
      });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  async getDocumentTagById(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: id",
      });
    }

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const [rows] = await connection.execute(
        "SELECT * FROM DocumentTagObject WHERE documentTagObjectId = ?",
        [id]
      );
      

      if ((rows as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: "Document tag not found.",
        });
      }

      const row = rows[0] as any;

      res.json({
        success: true,
        data: {
          documentTagObjectId: row.documentTagObjectId,
          name: row.name,
          description: row.description,
          created: row.created,
          updated: row.updated,
          documentTagObject: JSON.parse(row.documentTagObject),
        },
      });
    } catch (error) {
      console.error("Error fetching document tag by ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch document tag by ID.",
      });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
}

export const adminDocumentTagController = new AdminDocumentTagController();
