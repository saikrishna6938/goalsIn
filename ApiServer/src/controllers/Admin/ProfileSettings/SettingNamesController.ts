import { Request, Response } from "express";
import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import keys from "../../../keys";

// Create a single shared pool for better perf & connection hygiene
const pool = mysql.createPool(keys.database);

// --- Types ---
export interface UserSettingsType extends RowDataPacket {
  Id: number;
  Name: string;
}

export class AdminUserSettingsTypesController {
  constructor() {}

  // CREATE
  async addUserSettingsType(req: Request, res: Response): Promise<void> {
    try {
      const { Name } = req.body as Partial<UserSettingsType>;

      if (!Name || typeof Name !== "string" || !Name.trim()) {
        res.status(400).json({ message: "Name is required", status: false });
        return;
      }

      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO UserSettingsTypes (Name) VALUES (?)`,
        [Name.trim()]
      );

      res.status(201).json({
        message: "UserSettingsType added successfully",
        id: result.insertId,
        status: true,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error adding UserSettingsType",
          error,
          status: false,
        });
    }
  }

  // UPDATE
  async editUserSettingsType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { Name } = req.body as Partial<UserSettingsType>;

      if (Name !== undefined && (!Name || typeof Name !== "string")) {
        res.status(400).json({ message: "Name must be a non-empty string" });
        return;
      }

      // Build dynamic update but only allow Name for now
      const fields: string[] = [];
      const values: any[] = [];
      if (Name !== undefined) {
        fields.push(`Name = ?`);
        values.push(Name.trim());
      }

      if (fields.length === 0) {
        res.status(400).json({ message: "No valid fields to update" });
        return;
      }

      values.push(id);
      const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE UserSettingsTypes SET ${fields.join(", ")} WHERE Id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        res
          .status(404)
          .json({ message: "UserSettingsType not found", status: false });
        return;
      }

      res
        .status(200)
        .json({
          message: "UserSettingsType updated successfully",
          status: true,
        });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error updating UserSettingsType",
          error,
          status: false,
        });
    }
  }

  // DELETE
  async deleteUserSettingsType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const [result] = await pool.execute<ResultSetHeader>(
        `DELETE FROM UserSettingsTypes WHERE Id = ?`,
        [id]
      );

      if (result.affectedRows === 0) {
        res
          .status(404)
          .json({ message: "UserSettingsType not found", status: false });
        return;
      }

      res
        .status(200)
        .json({
          message: "UserSettingsType deleted successfully",
          status: true,
        });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error deleting UserSettingsType",
          error,
          status: false,
        });
    }
  }

  // READ (all)
  async getAllUserSettingsTypes(req: Request, res: Response): Promise<void> {
    try {
      const [rows] = await pool.query<UserSettingsType[]>(
        `SELECT Id, Name FROM UserSettingsTypes ORDER BY Id ASC`
      );
      res.status(200).json(rows);
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error fetching UserSettingsTypes",
          error,
          status: false,
        });
    }
  }

  // READ (single)
  async getSingleUserSettingsType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const [rows] = await pool.query<UserSettingsType[]>(
        `SELECT Id, Name FROM UserSettingsTypes WHERE Id = ?`,
        [id]
      );

      if (!rows || rows.length === 0) {
        res
          .status(404)
          .json({ message: "UserSettingsType not found", status: false });
        return;
      }

      res.status(200).json(rows[0]);
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error fetching UserSettingsType",
          error,
          status: false,
        });
    }
  }
}
