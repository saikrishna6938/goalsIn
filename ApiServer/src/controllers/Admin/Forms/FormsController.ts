import { Request, Response } from "express";
import mysql from "mysql2/promise";
import keys from "../../../keys";

export class FormController {
  constructor() {}

  // 📄 Get all DocumentTypeObject entries
  async getAll(req: Request, res: Response) {
    const connection = await mysql.createConnection(keys.database);
    try {
      const [rows] = await connection.execute(
        `SELECT documentTypeObjectId, name, description, created, updated FROM DocumentTypeObject ORDER BY documentTypeObjectId ASC`
      );

      res.status(200).json({
        message: "DocumentTypeObjects retrieved successfully",
        data: rows,
        status: true,
      });
    } catch (error) {
      console.error("Error fetching DocumentTypeObjects:", error);
      res.status(500).json({
        message: "Failed to retrieve DocumentTypeObjects",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  // 📄 Get a single DocumentTypeObject by ID
  async getById(req: Request, res: Response) {
    const { documentTypeObjectId } = req.params;

    if (!documentTypeObjectId) {
      return res.status(400).json({
        message: "'documentTypeObjectId' is required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM DocumentTypeObject WHERE documentTypeObjectId = ?`,
        [documentTypeObjectId]
      );

      if (Array.isArray(rows) && rows.length === 0) {
        return res.status(404).json({
          message: "DocumentTypeObject not found",
          status: false,
        });
      }

      const item = rows[0];
      let parsed;
      try {
        parsed = JSON.parse(item.documentTypeObject);
      } catch (e) {
        parsed = null;
      }

      res.status(200).json({
        message: "DocumentTypeObject retrieved successfully",
        data: {
          ...item,
          documentTypeObject: parsed,
        },
        status: true,
      });
    } catch (error) {
      console.error("Error fetching DocumentTypeObject:", error);
      res.status(500).json({
        message: "Failed to retrieve DocumentTypeObject",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  // ➕ Create a new DocumentTypeObject
  async create(req: Request, res: Response) {
    const { documentTypeObject, name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "'name' is required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const [result] = await connection.execute(
        `INSERT INTO DocumentTypeObject (
          documentTypeObject,
          name,
          description,
          created,
          updated
        ) VALUES (?, ?, ?, NOW(), NOW())`,
        [documentTypeObject, name, description]
      );

      res.status(201).json({
        message: "DocumentTypeObject created successfully",
        insertedId: result["insertId"],
        status: true,
      });
    } catch (error) {
      console.error("Error creating DocumentTypeObject:", error);
      res.status(500).json({
        message: "Failed to create DocumentTypeObject",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  // ✏️ Update an existing DocumentTypeObject
  async update(req: Request, res: Response) {
    const { documentTypeObjectId, documentTypeObject, name, description } =
      req.body;

    if (!documentTypeObjectId) {
      return res.status(400).json({
        message: "'documentTypeObjectId' is required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const existingRowQuery = `SELECT * FROM DocumentTypeObject WHERE documentTypeObjectId = ?`;
      const [existingRows] = await connection.execute(existingRowQuery, [
        documentTypeObjectId,
      ]);

      if (!Array.isArray(existingRows) || existingRows.length === 0) {
        return res.status(404).json({
          message: "DocumentTypeObject not found",
          status: false,
        });
      }

      const existing: any = existingRows[0];

      const updatedQuery = `
        UPDATE DocumentTypeObject SET
          documentTypeObject = ?,
          name = ?,
          description = ?,
          updated = NOW()
        WHERE documentTypeObjectId = ?`;

      const [result] = await connection.execute(updatedQuery, [
        documentTypeObject ?? existing.documentTypeObject,
        name ?? existing.name,
        description ?? existing.description,
        documentTypeObjectId,
      ]);

      res.status(200).json({
        message: "DocumentTypeObject updated successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error updating DocumentTypeObject:", error);
      res.status(500).json({
        message: "Failed to update DocumentTypeObject",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  // ❌ Delete a DocumentTypeObject
  async delete(req: Request, res: Response) {
    const { documentTypeObjectId } = req.body;

    if (!documentTypeObjectId) {
      return res.status(400).json({
        message: "'documentTypeObjectId' is required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const [result] = await connection.execute(
        `DELETE FROM DocumentTypeObject WHERE documentTypeObjectId = ?`,
        [documentTypeObjectId]
      );

      res.status(200).json({
        message: "DocumentTypeObject deleted successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error deleting DocumentTypeObject:", error);
      res.status(500).json({
        message: "Failed to delete DocumentTypeObject",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }
}
