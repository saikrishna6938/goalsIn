import mysql from "mysql2/promise";
import { Request, Response } from "express";
import keys from "../keys";

class InternalTagsController {
  async updateRecord(req: Request, res: Response): Promise<void> {
    const { tableId, id } = req.params;
    const body = req.body;
    const connection = await mysql.createConnection(keys.database);
    try {
      // Get the table name from DataTables
      const [tableResult]: any = await connection!.execute(
        `SELECT tableName FROM DataTables WHERE tableId = ?`,
        [tableId]
      );

      if (tableResult.length === 0) {
        res.status(404).json({ success: false, message: "Table not found" });
        return;
      }

      const tableName = tableResult[0].tableName;

      // Construct update query dynamically
      const fields = Object.keys(body)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = Object.values(body);

      const updateQuery = `UPDATE \`${tableName}\` SET ${fields} WHERE id = ?`;

      await connection!.execute(updateQuery, [...values, id]);

      res.json({ success: true, message: "Record updated successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update record" });
    } finally {
      await connection.end();
    }
  }

  async createRecord(req: Request, res: Response): Promise<void> {
    const { tableId } = req.params;
    const body = req.body;
    const connection = await mysql.createConnection(keys.database);
    try {
      // Get the table name from DataTables
      const [tableResult]: any = await connection!.execute(
        `SELECT tableName FROM DataTables WHERE tableId = ?`,
        [tableId]
      );

      if (tableResult.length === 0) {
        res.status(404).json({ success: false, message: "Table not found" });
        return;
      }

      const tableName = tableResult[0].tableName;

      // Construct insert query dynamically
      const fields = Object.keys(body).join(", ");
      const placeholders = Object.keys(body)
        .map(() => "?")
        .join(", ");
      const values = Object.values(body);

      const insertQuery = `INSERT INTO \`${tableName}\` (${fields}) VALUES (${placeholders})`;

      await connection!.execute(insertQuery, values);

      res.json({ success: true, message: "Record created successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to create record" });
    } finally {
      await connection.end();
    }
  }
}

export const internalTagsController: InternalTagsController =
  new InternalTagsController();
