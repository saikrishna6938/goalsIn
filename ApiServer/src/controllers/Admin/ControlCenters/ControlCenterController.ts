import { Request, Response } from "express";
import mysql from "mysql2/promise";
import keys from "../../../keys";

export class ControlCenterController {
  constructor() {}

  // 📄 Get all ControlCenters
  async getAll(req: Request, res: Response) {
    const connection = await mysql.createConnection(keys.database);
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM ControlCenters ORDER BY controlCenterId ASC`
      );

      res.status(200).json({
        message: "ControlCenters retrieved successfully",
        data: rows,
        status: true,
      });
    } catch (error) {
      console.error("Error fetching ControlCenters:", error);
      res.status(500).json({
        message: "Failed to retrieve ControlCenters",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  // 📄 Get a single ControlCenter by ID
  async getById(req: Request, res: Response) {
    const { controlCenterId } = req.params;

    if (!controlCenterId) {
      return res.status(400).json({
        message: "'controlCenterId' is required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM ControlCenters WHERE controlCenterId = ?`,
        [controlCenterId]
      );

      if (Array.isArray(rows) && rows.length === 0) {
        return res.status(404).json({
          message: "ControlCenter not found",
          status: false,
        });
      }

      const item = rows[0];
      let parsed;
      try {
        parsed = JSON.parse(item.jsonObject);
      } catch (e) {
        parsed = null;
      }

      res.status(200).json({
        message: "ControlCenter retrieved successfully",
        data: {
          ...item,
          jsonObject: parsed,
        },
        status: true,
      });
    } catch (error) {
      console.error("Error fetching ControlCenter:", error);
      res.status(500).json({
        message: "Failed to retrieve ControlCenter",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  // ➕ Create a new ControlCenter
  async create(req: Request, res: Response) {
    const { name, description, jsonObject, enabled = 1 } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "'name' is required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const [result] = await connection.execute(
        `INSERT INTO ControlCenters (
          name,
          description,
          jsonObject,
          created,
          updated,
          enabled
        ) VALUES (?, ?, ?, NOW(), NOW(), ?)`,
        [name, description, jsonObject, enabled]
      );

      res.status(201).json({
        message: "ControlCenter created successfully",
        insertedId: result["insertId"],
        status: true,
      });
    } catch (error) {
      console.error("Error creating ControlCenter:", error);
      res.status(500).json({
        message: "Failed to create ControlCenter",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  // ✏️ Update an existing ControlCenter
  async update(req: Request, res: Response) {
    const { controlCenterId, name, description, jsonObject, enabled } =
      req.body;

    if (!controlCenterId) {
      return res.status(400).json({
        message: "'controlCenterId' is required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const [existingRows] = await connection.execute(
        `SELECT * FROM ControlCenters WHERE controlCenterId = ?`,
        [controlCenterId]
      );

      if (!Array.isArray(existingRows) || existingRows.length === 0) {
        return res.status(404).json({
          message: "ControlCenter not found",
          status: false,
        });
      }

      const existing: any = existingRows[0];

      const [result] = await connection.execute(
        `UPDATE ControlCenters SET
          name = ?,
          description = ?,
          jsonObject = ?,
          updated = NOW(),
          enabled = ?
        WHERE controlCenterId = ?`,
        [
          name ?? existing.name,
          description ?? existing.description,
          jsonObject ?? existing.jsonObject,
          enabled ?? existing.enabled,
          controlCenterId,
        ]
      );

      res.status(200).json({
        message: "ControlCenter updated successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error updating ControlCenter:", error);
      res.status(500).json({
        message: "Failed to update ControlCenter",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  // ❌ Delete a ControlCenter
  async delete(req: Request, res: Response) {
    const { controlCenterId } = req.body;

    if (!controlCenterId) {
      return res.status(400).json({
        message: "'controlCenterId' is required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const [result] = await connection.execute(
        `DELETE FROM ControlCenters WHERE controlCenterId = ?`,
        [controlCenterId]
      );

      res.status(200).json({
        message: "ControlCenter deleted successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error deleting ControlCenter:", error);
      res.status(500).json({
        message: "Failed to delete ControlCenter",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }
}
