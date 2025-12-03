import { Request, Response } from "express";
import mysql from "mysql2/promise";
import keys from "../../../keys";
import formidable from "formidable";
import * as fs from "fs";
import * as XLSX from "xlsx";

export class DataTableController {
  constructor() {}

  // 🔍 Get all data tables with parsed fields
  async getAllDataTables(req: Request, res: Response) {
    const connection = await mysql.createConnection(keys.database);
    try {
      const query = `
        SELECT tableId, tableName, fields
        FROM DataTables
        ORDER BY tableId ASC
      `;

      const [rows]: any = await connection.execute(query);

      const parsedRows = rows.map((row: any) => ({
        ...row,
        fields: row.fields ? JSON.parse(row.fields) : null,
      }));

      res.status(200).json({
        message: "Data tables retrieved successfully",
        data: parsedRows,
        status: true,
      });
    } catch (error) {
      console.error("Error retrieving data tables:", error);
      res.status(500).json({
        message: "Failed to retrieve data tables",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  // ➕ Add a new data table and create physical table
  async addDataTable(req: Request, res: Response) {
    const { tableName, fields } = req.body;

    if (!tableName || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({
        message:
          "tableName and fields array are required and must be non-empty",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      await connection.beginTransaction();

      const insertQuery = `
        INSERT INTO DataTables (tableName, fields)
        VALUES (?, ?)
      `;

      const fieldsJson = JSON.stringify(fields);
      await connection.execute(insertQuery, [tableName, fieldsJson]);

      const columnDefs = fields
        .map((col: any) => {
          const type = col.type.toUpperCase();
          const safeName = `\`${col.name}\``; // Use backticks directly
          return `${safeName} ${type}`;
        })
        .join(", ");

      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS \`${tableName}\` (
          id INT AUTO_INCREMENT PRIMARY KEY,
          ${columnDefs}
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `;

      await connection.execute(createTableQuery);
      await connection.commit();

      res.status(201).json({
        message: "Data table entry and physical table created successfully",
        status: true,
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error adding data table and creating table:", error);
      res.status(500).json({
        message: "Failed to create data table",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  // ➕ Import data table via file and create physical table
  async importDataTable(req: Request, res: Response) {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res
          .status(400)
          .json({ message: "Error parsing form data", error: err });
      }

      const tableName = fields.tableName?.[0];
      const file = files.file?.[0];

      if (!tableName || !file) {
        return res.status(400).json({
          message: "tableName and file are required",
          status: false,
        });
      }

      let connection: mysql.Connection | null = null;
      try {
        const workbook = XLSX.readFile(file.filepath);
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
          defval: null,
        });

        if (!sheetData || sheetData.length === 0) {
          return res.status(400).json({
            message: "Excel/CSV file contains no data",
            status: false,
          });
        }

        const columnNames = Object.keys(sheetData[0]).filter(
          (name) =>
            name && name.toString().trim() !== "" && !name.startsWith("__EMPTY")
        );

        const fields = columnNames.map((name) => ({ name, type: "TEXT" }));

        connection = await mysql.createConnection(keys.database);
        await connection.beginTransaction();

        // Save metadata
        const fieldsJson = JSON.stringify(fields);
        await connection.execute(
          `INSERT INTO DataTables (tableName, fields) VALUES (?, ?)`,
          [tableName, fieldsJson]
        );

        // Create SQL table
        const columnDefs = fields
          .map((col) => `\`${col.name}\` ${col.type}`)
          .join(", ");
        const createQuery = `
          CREATE TABLE IF NOT EXISTS \`${tableName}\` (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ${columnDefs}
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        await connection.execute(createQuery);

        // Insert rows
        for (const row of sheetData) {
          const cleanedRow = Object.fromEntries(
            Object.entries(row).filter(
              ([key]) =>
                key &&
                key.toString().trim() !== "" &&
                !key.startsWith("__EMPTY")
            )
          );

          const keys = Object.keys(cleanedRow);
          const values = keys.map((k) => cleanedRow[k]);
          const placeholders = keys.map(() => "?").join(", ");

          await connection.execute(
            `INSERT INTO \`${tableName}\` (${keys
              .map((k) => `\`${k}\``)
              .join(", ")}) VALUES (${placeholders})`,
            values
          );
        }

        await connection.commit();
        res.status(201).json({
          message:
            "Data table created from file and data inserted successfully",
          status: true,
        });
      } catch (error) {
        console.error("Error importing data table:", error);
        res.status(500).json({
          message: "Failed to import and create data table",
          error,
          status: false,
        });
      } finally {
        if (connection) {
          try { await connection.end(); } catch {}
        }
      }
    });
  }

  // ❌ Delete a data table and drop its physical table
  async deleteDataTable(req: Request, res: Response) {
    const { tableId, tableName } = req.body;

    if (!tableId || !tableName) {
      return res.status(400).json({
        message: "tableId and tableName are required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      await connection.beginTransaction();

      const deleteQuery = `
        DELETE FROM DataTables WHERE tableId = ?
      `;
      await connection.execute(deleteQuery, [tableId]);

      const dropTableQuery = `
        DROP TABLE IF EXISTS \`${tableName}\`
      `;
      await connection.execute(dropTableQuery);

      await connection.commit();

      res.status(200).json({
        message:
          "Data table entry deleted and physical table dropped successfully",
        status: true,
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error deleting data table:", error);
      res.status(500).json({
        message: "Failed to delete data table",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }
}
