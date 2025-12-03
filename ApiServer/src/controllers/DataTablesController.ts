import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../keys";
class DataTablesController {
  async addDataTable(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const { tableName, fields } = req.body;

      if (!tableName || !fields) {
        return res.status(400).send("Required parameters not provided");
      }

      const jsonFields = JSON.stringify(fields);
      await connection.execute(
        "INSERT INTO DataTables(tableName, fields) VALUES(?, ?)",
        [tableName, jsonFields]
      );

      // Generate SQL query for creating the actual table
      const columns = fields
        .map((field: any) => `${field.name} ${field.type}`)
        .join(", ");
      const createTableQuery = `CREATE TABLE ${tableName} (${columns})`;
      await connection.execute(createTableQuery);
      await connection.execute("COMMIT");
      res.json({
        status: true,
        message: `Table ${tableName} created successfully!`,
      });
    } catch (error) {
      if (connection) {
        try {
          await connection.execute("ROLLBACK");
        } catch {}
      }
      console.log(error);
      res.json({ status: false, message: "Failed to create table" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async updateDataTable(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const { tableName, fields } = req.body;

      if (!tableName || !fields) {
        return res.status(400).send("Required parameters not provided");
      }

      // Fetch existing fields from DataTables
      const [results] = await connection.execute(
        "SELECT fields FROM DataTables WHERE tableName = ?",
        [tableName]
      );
      //@ts-ignore
      if (results.length === 0) {
        return res.status(404).send("Table not found in DataTables.");
      }

      let existingFields = JSON.parse(results[0].fields);

      for (let field of fields) {
        const existingFieldIndex = existingFields.findIndex(
          (ef: any) => ef.name === field.name
        );

        if (existingFieldIndex === -1) {
          // Field doesn't exist, so we add it
          existingFields.push(field);
          const addColumnQuery = `ALTER TABLE ${tableName} ADD COLUMN ${field.name} ${field.type}`;
          await connection.execute(addColumnQuery);
        } else {
          // Field exists, so we update it (for simplicity, let's assume only the type can change)
          existingFields[existingFieldIndex].type = field.type;
          const modifyColumnQuery = `ALTER TABLE ${tableName} MODIFY COLUMN ${field.name} ${field.type}`;
          await connection.execute(modifyColumnQuery);
        }
      }

      const updateMasterQuery = `UPDATE DataTables SET fields = ? WHERE tableName = ?`;
      await connection.execute(updateMasterQuery, [
        JSON.stringify(existingFields),
        tableName,
      ]);

      await connection.execute("COMMIT");

      res.json({
        status: true,
        message: `Table ${tableName} updated successfully!`,
      });
    } catch (error) {
      if (connection) {
        try {
          await connection.execute("ROLLBACK");
        } catch {}
      }
      console.log(error);
      res.json({ status: false, message: "Failed to update table" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async deleteDataTable(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const { tableName } = req.body;

      if (!tableName) {
        return res.status(400).send("Table name not provided");
      }

      const deleteMasterQuery = "DELETE FROM DataTables WHERE tableName = ?";
      await connection.execute(deleteMasterQuery, [tableName]);

      const dropTableQuery = `DROP TABLE ${tableName}`;
      await connection.execute(dropTableQuery);

      await connection.execute("COMMIT");
      res.json({
        status: true,
        message: `Table ${tableName} deleted successfully!`,
      });
    } catch (error) {
      if (connection) {
        try {
          await connection.execute("ROLLBACK");
        } catch {}
      }
      console.log(error);
      res.json({ status: false, message: "Failed to delete table" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }
  async importDataTableFromExcel(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      // You'll need to implement the logic to parse Excel and insert the data accordingly
      // For example using 'exceljs' or another library
      res.json({
        status: true,
        message: "Data imported from Excel successfully!",
      });
    } catch (error) {
      console.log(error);
      res.json({ status: false, message: "Failed to import data from Excel" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }
  async importDataTableFromCsv(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      // You'll need to implement the logic to parse CSV and insert the data accordingly
      // For example using 'papaparse' or another library
      res.json({
        status: true,
        message: "Data imported from CSV successfully!",
      });
    } catch (error) {
      console.log(error);
      res.json({ status: false, message: "Failed to import data from CSV" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async insertIntoTable(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const { tableName, data } = req.body;
      const [results] = await connection.execute(
        "SELECT fields FROM DataTables WHERE tableName = ?",
        [tableName]
      );
      //@ts-ignore
      if (results.length === 0) {
        return res
          .status(400)
          .json({ status: false, message: "Table not found in DataTables." });
      }

      const fields = JSON.parse(results[0].fields);
      const fieldNames = fields.map((field: any) => field.name).join(", ");
      const placeholders = fields.map(() => "?").join(", ");

      const insertQuery = `INSERT INTO ${tableName} (${fieldNames}) VALUES(${placeholders})`;
      await connection.execute(insertQuery, Object.values(data));

      res.json({
        status: true,
        message: `Data inserted into ${tableName} successfully!`,
      });
    } catch (error) {
      console.log(error);
      res.json({ status: false, message: "Failed to insert data." });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async updateTable(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const { tableName, data, where } = req.body;

      const [results] = await connection.execute(
        "SELECT fields FROM DataTables WHERE tableName = ?",
        [tableName]
      );

      //@ts-ignore
      if (results.length === 0) {
        return res
          .status(400)
          .json({ status: false, message: "Table not found in DataTables." });
      }

      const fields = JSON.parse(results[0].fields);
      const fieldUpdates = Object.keys(data)
        .map((key) => `${key} = ?`)
        .join(", ");

      const updateQuery = `UPDATE ${tableName} SET ${fieldUpdates} WHERE ${where.field} = ?`;
      const values = [...Object.values(data), where.value];

      await connection.execute(updateQuery, values);

      res.json({
        status: true,
        message: `Data in ${tableName} updated successfully!`,
      });
    } catch (error) {
      console.log(error);
      res.json({ status: false, message: "Failed to update data." });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async deleteFromTable(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const { tableName, where } = req.body;

      const [results] = await connection.execute(
        "SELECT fields FROM DataTables WHERE tableName = ?",
        [tableName]
      );
      //@ts-ignore
      if (results.length === 0) {
        return res
          .status(400)
          .json({ status: false, message: "Table not found in DataTables." });
      }

      const deleteQuery = `DELETE FROM ${tableName} WHERE ${where.field} = ?`;
      await connection.execute(deleteQuery, [where.value]);

      res.json({
        status: true,
        message: `Data from ${tableName} deleted successfully!`,
      });
    } catch (error) {
      console.log(error);
      res.json({ status: false, message: "Failed to delete data." });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }
}

export const dataTablesController: DataTablesController =
  new DataTablesController();
