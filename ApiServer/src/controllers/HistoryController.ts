import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../keys";

class HistoryController {
  private async createDbConnection() {
    return await mysql.createConnection(keys.database);
  }

  async addHistory(req: Request, res: Response) {
    const { historyTypeId, historyUserId, historyTaskId } = req.body;

    if (!historyTypeId || !historyUserId || !historyTaskId) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const query = `SELECT COUNT(*) AS count FROM History WHERE historyTypeId = ${historyTypeId} AND historyUserId = ${historyUserId} AND DATE(historyCreatedDate) = CURDATE() AND historyTaskId = ${historyTaskId}`;

      const [checkRows] = await connection.execute(query);

      if (checkRows[0].count === 0) {
        const [insertRows] = await connection.execute(
          "INSERT INTO History (historyTypeId, historyUserId, historyCreatedDate, historyTaskId) VALUES (?, ?, NOW(), ?)",
          [historyTypeId, historyUserId, historyTaskId]
        );

        res.json({
          status: true,
          message: "History added successfully!",
          data: insertRows,
        });
      } else {
        res.json({
          status: true,
          message: "History already exists for today!",
          data: checkRows,
        });
      }
    } catch (error) {
      console.error("Error adding history:", error);
      res
        .status(500)
        .json({ status: false, message: "Internal server error." });
    } finally {
      if (connection) {
        try { await connection.end(); } catch {}
      }
    }
  }

  async getHistoryByTaskId(req: Request, res: Response) {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ message: "TaskId is required." });
    }

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const [rows] = await connection.execute(
        `SELECT 
                h.historyId, 
                h.historyUserId, 
                u.userFirstName, 
                u.userLastName, 
                h.historyCreatedDate, 
                h.historyTaskId, 
                ht.historyTypeName,
                u.userFirstName,
                u.userLastName
            FROM History h 
            JOIN HistoryTypes ht ON h.historyTypeId = ht.historyTypeId 
            JOIN Users u ON h.historyUserId = u.userId
            WHERE h.historyTaskId = ?`,
        [taskId]
      );

      res.json({
        status: true,
        message: "History retrieved successfully!",
        data: rows,
      });
    } catch (error) {
      console.error("Error fetching history:", error);
      res
        .status(500)
        .json({ status: false, message: "Internal server error." });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
}

export const historyController: HistoryController = new HistoryController();
