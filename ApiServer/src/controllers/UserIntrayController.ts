import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../keys";
import path from "path";
import fs from "fs/promises";
import { sendEmail } from "../EmailHelper";

class UserIntrayController {
  async getUserIntrayDetails(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const { userId } = req.params;
      // Query to retrieve details from userIntray based on userId
      const [rows] = await connection.execute(
        `SELECT 
            UserIntray.uploadId, 
            UserIntray.intrayPath, 
            UserIntray.documentType, 
            UserIntray.dateTime, 
            UploadFiles.uploadName, 
            UploadFiles.fileName, 
            UploadFiles.fileType 
         FROM 
            UserIntray 
         JOIN 
            UploadFiles ON UserIntray.uploadId = UploadFiles.uploadId 
         WHERE 
            UserIntray.userID = ?`,
        [userId]
      );
      //@ts-ignore
      if (rows.length > 0) {
        const pathDetails = buildFolderStructure(
          //@ts-ignore
          rows.map((row) => ({
            uploadId: row.uploadId,
            path: row.intrayPath,
            documentType: row.documentType,
            dateTime: row.dateTime,
            uploadName: row.uploadName,
            fileName: row.fileName,
            fileType: row.fileType,
          }))
        );

        res.json({
          success: true,
          data: rows,
          pathDetails: pathDetails,
        });
      } else {
        // No records found, return [home] as pathDetails
        res.json({
          success: true,
          data: [],
          pathDetails: { home: {} },
        });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send("An error occurred while retrieving user intray details.");
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
}
export const userIntrayController: UserIntrayController =
  new UserIntrayController();

export function buildFolderStructure(paths) {
  const root = {};

  paths.forEach(
    ({
      uploadId,
      path,
      documentType,
      dateTime,
      fileName,
      uploadName,
      fileType,
    }) => {
      const parts = path.split("/").filter(Boolean); // Split path into parts and remove empty strings
      let currentLevel = root;

      parts.forEach((part, index) => {
        // Ensure each level exists
        if (!currentLevel[part]) {
          currentLevel[part] = {}; // Initialize as an empty object if the level doesn't exist
        }

        // If it's the last part, initialize the `files` array if it doesn't exist
        if (index === parts.length - 1) {
          if (!currentLevel[part].files) {
            currentLevel[part].files = [];
          }

          // Add file details to the `files` array at the last level
          currentLevel[part].files.push({
            uploadId,
            documentType,
            dateTime,
            path,
            fileName,
            uploadName,
            fileType,
          });
        }

        // Move to the next level
        currentLevel = currentLevel[part];
      });
    }
  );

  return root;
}
