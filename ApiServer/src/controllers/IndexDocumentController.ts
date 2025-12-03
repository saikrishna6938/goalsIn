import { Request, Response } from "express";
import mysql, { ResultSetHeader } from "mysql2/promise";
import keys from "../keys";

export class IndexDocumentController {
  constructor() {}

  // POST /administrator/index-documents
  async createIndexDocument(req: Request, res: Response): Promise<void> {
    const conn = await mysql.createConnection(keys.database);
    try {
      const {
        taskId,
        uploadId,
        answersObject, // JSON object with tag answers
      } = req.body;

      if (!taskId || !uploadId || !answersObject) {
        res.status(400).json({
          success: false,
          message: "taskId, uploadId, and answersObject are required",
        });
        return;
      }

      const [result] = await conn.execute<ResultSetHeader>(
        `INSERT INTO DocumentTagAnswers (documentTagAnswersObject, taskId, uploadId)
         VALUES (?, ?, ?)`,
        [JSON.stringify(answersObject), taskId, uploadId]
      );

      res.status(201).json({
        success: true,
        message: "Index document created successfully",
        insertId: result.insertId,
      });
    } catch (error: any) {
      console.error("createIndexDocument error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create index document",
        error: error.message,
      });
    } finally {
      await conn.end();
    }
  }
}

export const indexDocumentController = new IndexDocumentController();
