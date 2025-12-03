import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../keys";
class TaskTagDetails {
  async getTaskTagDetails(req: Request, res: Response) {
    let connection;
    try {
      const { taskTagTableId, taskTagId } = req.params;

      // Attempt to create a database connection
      try {
        connection = await mysql.createConnection(keys.database);
      } catch (connError) {
        console.error("Database connection error:", connError);
        return res.status(500).json({
          status: false,
          message: "Failed to connect to the database",
        });
      }

      // Fetch task tag details
      let result;
      try {
        [result] = await connection.execute(
          "SELECT * from TaskTagDetails WHERE taskTagTableId = ?",
          [taskTagTableId]
        );
      } catch (queryError) {
        console.error("Error executing task tag details query:", queryError);
        return res
          .status(500)
          .json({ status: false, message: "Failed to fetch task tag details" });
      }

      // Fetch table name
      let tableName;
      try {
        [tableName] = await connection.execute(
          "SELECT D.tableName from DataTables D WHERE tableId = ?",
          [taskTagTableId]
        );
      } catch (queryError) {
        console.error("Error executing table name query:", queryError);
        return res
          .status(500)
          .json({ status: false, message: "Failed to fetch table name" });
      }

      // Fetch table data
      let tableData;
      try {
        [tableData] = await connection.execute(
          `SELECT * from ${tableName[0].tableName} T WHERE Id = ?`,
          [taskTagId]
        );
      } catch (queryError) {
        console.error("Error executing table data query:", queryError);
        return res
          .status(500)
          .json({ status: false, message: "Failed to fetch table data" });
      }

      // Construct and send the response
      if (result[0]) {
        const tagDetails = {
          ...result[0],
          taskTagDetailsData: JSON.parse(result[0].taskTagDetailsData),
          ...tableName[0],
          tableData: { ...tableData[0] },
        };

        res.json({ status: true, message: "Success", data: tagDetails });
      } else {
        res.json({ status: true, message: "No data found", data: {} });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      res
        .status(500)
        .json({ status: false, message: "An unexpected error occurred" });
    } finally {
      if (connection) connection.end();
    }
  }

  async getSearchTagDetails(req: Request, res: Response) {
    let connection;
    try {
      const { taskTagTableId } = req.params;

      // Attempt to create a database connection
      try {
        connection = await mysql.createConnection(keys.database);
      } catch (connError) {
        console.error("Database connection error:", connError);
        return res.status(500).json({
          status: false,
          message: "Failed to connect to the database",
        });
      }

      // Fetch task tag details data
      let result;
      try {
        [result] = await connection.execute(
          "SELECT taskTagDetailsData from TaskTagDetails WHERE taskTagTableId = ?",
          [taskTagTableId]
        );
      } catch (queryError) {
        console.error("Error executing task tag details query:", queryError);
        return res.status(500).json({
          status: false,
          message: "Failed to fetch task tag details data",
        });
      }

      // Construct and send the response
      if (result[0]) {
        const taskTagDetailsData = JSON.parse(result[0].taskTagDetailsData);

        res.json({
          status: true,
          message: "Success",
          data: taskTagDetailsData,
        });
      } else {
        res.json({ status: true, message: "No data found", data: {} });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      res.status(500).json({
        status: false,
        message: "An unexpected error occurred",
      });
    } finally {
      if (connection) connection.end();
    }
  }
}

export const taskTagDetailController: TaskTagDetails = new TaskTagDetails();
