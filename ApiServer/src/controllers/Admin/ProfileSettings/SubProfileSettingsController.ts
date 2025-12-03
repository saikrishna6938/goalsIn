import { Request, Response } from "express";
import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import keys from "../../../keys";

// Use a shared pool for efficiency
const pool = mysql.createPool(keys.database);

// ---- Types ----
export interface SubProfileSetting extends RowDataPacket {
  profileSettingsId: number; // PK
  SettingId: number; // FK -> UserSettingsTypes(Id)
  subProfileId: number; // FK -> SubProfileTypes(subProfileId)
  dataTypeId: number; // FK -> DataTypes(Id)
  value: number; // NOT NULL (int)
}

export class AdminSubProfileSettingsController {
  constructor() {}

  // CREATE
  async addSubProfileSetting(req: Request, res: Response): Promise<void> {
    try {
      const { SettingId, subProfileId, dataTypeId, value } =
        req.body as Partial<SubProfileSetting>;

      // Basic validation
      if (
        SettingId === undefined ||
        subProfileId === undefined ||
        dataTypeId === undefined ||
        value === undefined
      ) {
        res
          .status(400)
          .json({
            message:
              "SettingId, subProfileId, dataTypeId, and value are required",
            status: false,
          });
        return;
      }

      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO SubProfileSettings (SettingId, subProfileId, dataTypeId, value) VALUES (?, ?, ?, ?)`,
        [SettingId, subProfileId, dataTypeId, value]
      );

      res.status(201).json({
        message: "SubProfileSetting created successfully",
        id: result.insertId,
        status: true,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error creating SubProfileSetting",
          error,
          status: false,
        });
    }
  }

  // UPDATE (partial)
  async editSubProfileSetting(req: Request, res: Response): Promise<void> {
    try {
      const { profileSettingsId } = req.params;
      const updates = req.body as Partial<SubProfileSetting>;

      const allowed: (keyof SubProfileSetting)[] = [
        "SettingId",
        "subProfileId",
        "dataTypeId",
        "value",
      ];
      const keys = Object.keys(updates).filter((k) =>
        allowed.includes(k as keyof SubProfileSetting)
      );

      if (keys.length === 0) {
        res
          .status(400)
          .json({ message: "No valid fields to update", status: false });
        return;
      }

      const fields = keys.map((k) => `${k} = ?`).join(", ");
      const values = keys.map((k) => (updates as any)[k]);
      values.push(profileSettingsId);

      const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE SubProfileSettings SET ${fields} WHERE profileSettingsId = ?`,
        values
      );

      if (result.affectedRows === 0) {
        res
          .status(404)
          .json({ message: "SubProfileSetting not found", status: false });
        return;
      }

      res
        .status(200)
        .json({
          message: "SubProfileSetting updated successfully",
          status: true,
        });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error updating SubProfileSetting",
          error,
          status: false,
        });
    }
  }

  // DELETE
  async deleteSubProfileSetting(req: Request, res: Response): Promise<void> {
    try {
      const { profileSettingsId } = req.params;

      const [result] = await pool.execute<ResultSetHeader>(
        `DELETE FROM SubProfileSettings WHERE profileSettingsId = ?`,
        [profileSettingsId]
      );

      if (result.affectedRows === 0) {
        res
          .status(404)
          .json({ message: "SubProfileSetting not found", status: false });
        return;
      }

      res
        .status(200)
        .json({
          message: "SubProfileSetting deleted successfully",
          status: true,
        });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error deleting SubProfileSetting",
          error,
          status: false,
        });
    }
  }

  // READ (all)
  async getAllSubProfileSettings(req: Request, res: Response): Promise<void> {
    try {
      const [rows] = await pool.query<SubProfileSetting[]>(
        `SELECT profileSettingsId, SettingId, subProfileId, dataTypeId, value FROM SubProfileSettings ORDER BY profileSettingsId ASC`
      );
      res.status(200).json(rows);
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error fetching SubProfileSettings",
          error,
          status: false,
        });
    }
  }

  // READ (single)
  async getSingleSubProfileSetting(req: Request, res: Response): Promise<void> {
    try {
      const { profileSettingsId } = req.params;
      const [rows] = await pool.query<SubProfileSetting[]>(
        `SELECT profileSettingsId, SettingId, subProfileId, dataTypeId, value FROM SubProfileSettings WHERE profileSettingsId = ?`,
        [profileSettingsId]
      );

      if (!rows || rows.length === 0) {
        res
          .status(404)
          .json({ message: "SubProfileSetting not found", status: false });
        return;
      }

      res.status(200).json(rows[0]);
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error fetching SubProfileSetting",
          error,
          status: false,
        });
    }
  }
}
