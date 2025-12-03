import { Request, Response } from "express";
import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import keys from "../../../keys";
import { getSettingNamesBySubProfileId } from "../../../helpers/user/UserHelprs";

// Use a shared pool for connection management
const pool = mysql.createPool(keys.database);

// --- Types ---
export interface SubProfileType extends RowDataPacket {
  subProfileId: number;
  subProfileName: string;
}

export class AdminSubProfileTypesController {
  constructor() {}

  // CREATE
  async addSubProfileType(req: Request, res: Response): Promise<void> {
    try {
      const { subProfileName } = req.body as Partial<SubProfileType>;

      if (
        !subProfileName ||
        typeof subProfileName !== "string" ||
        !subProfileName.trim()
      ) {
        res
          .status(400)
          .json({ message: "subProfileName is required", status: false });
        return;
      }

      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO SubProfileTypes (subProfileName) VALUES (?)`,
        [subProfileName.trim()]
      );

      res.status(201).json({
        message: "SubProfileType added successfully",
        id: result.insertId,
        status: true,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error adding SubProfileType", error, status: false });
    }
  }

  // UPDATE
  async editSubProfileType(req: Request, res: Response): Promise<void> {
    try {
      const { subProfileId } = req.params;
      const { subProfileName } = req.body as Partial<SubProfileType>;

      if (
        subProfileName !== undefined &&
        (!subProfileName || typeof subProfileName !== "string")
      ) {
        res
          .status(400)
          .json({ message: "subProfileName must be a non-empty string" });
        return;
      }

      const fields: string[] = [];
      const values: any[] = [];

      if (subProfileName !== undefined) {
        fields.push(`subProfileName = ?`);
        values.push(subProfileName.trim());
      }

      if (fields.length === 0) {
        res.status(400).json({ message: "No valid fields to update" });
        return;
      }

      values.push(subProfileId);
      const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE SubProfileTypes SET ${fields.join(
          ", "
        )} WHERE subProfileId = ?`,
        values
      );

      if (result.affectedRows === 0) {
        res
          .status(404)
          .json({ message: "SubProfileType not found", status: false });
        return;
      }

      res
        .status(200)
        .json({ message: "SubProfileType updated successfully", status: true });
    } catch (error) {
      res.status(500).json({
        message: "Error updating SubProfileType",
        error,
        status: false,
      });
    }
  }

  // DELETE
  async deleteSubProfileType(req: Request, res: Response): Promise<void> {
    try {
      const { subProfileId } = req.params;
      const [result] = await pool.execute<ResultSetHeader>(
        `DELETE FROM SubProfileTypes WHERE subProfileId = ?`,
        [subProfileId]
      );

      if (result.affectedRows === 0) {
        res
          .status(404)
          .json({ message: "SubProfileType not found", status: false });
        return;
      }

      res
        .status(200)
        .json({ message: "SubProfileType deleted successfully", status: true });
    } catch (error) {
      res.status(500).json({
        message: "Error deleting SubProfileType",
        error,
        status: false,
      });
    }
  }

  // READ (all)
  async getAllSubProfileTypes(req: Request, res: Response): Promise<void> {
    try {
      const [rows] = await pool.query<SubProfileType[]>(
        `SELECT subProfileId, subProfileName FROM SubProfileTypes ORDER BY subProfileId ASC`
      );
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching SubProfileTypes",
        error,
        status: false,
      });
    }
  }

  // READ (single)
  async getSingleSubProfileType(req: Request, res: Response): Promise<void> {
    try {
      const { subProfileId } = req.params;
      const [rows] = await pool.query<SubProfileType[]>(
        `SELECT subProfileId, subProfileName FROM SubProfileTypes WHERE subProfileId = ?`,
        [subProfileId]
      );

      if (!rows || rows.length === 0) {
        res
          .status(404)
          .json({ message: "SubProfileType not found", status: false });
        return;
      }

      res.status(200).json(rows[0]);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching SubProfileType",
        error,
        status: false,
      });
    }
  }

  async getSettingNames(req: Request, res: Response): Promise<void> {
    try {
      const subProfileId = Number(req.params.subProfileId);
      if (!Number.isFinite(subProfileId)) {
        res
          .status(400)
          .json({ message: "Invalid subProfileId", status: false });
        return;
      }

      const names = await getSettingNamesBySubProfileId(subProfileId);
      res
        .status(200)
        .json({ subProfileId, names, count: names.length, status: true });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error fetching setting names",
          error,
          status: false,
        });
    }
  }
}
