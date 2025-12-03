import { Request, Response } from "express";
import mysql from "mysql2/promise";
import keys from "../../../keys";

export class AdminNewslettersController {
  constructor() {}

  //#region ---------- Newsletters ----------

  /**
   * Payload (GET): none
   */
  async getNewsletters(req: Request, res: Response) {
    const connection = await mysql.createConnection(keys.database);
    try {
      const query = `
        SELECT 
          n.newsletterId,
          n.newsletterName,
          n.newsletterTypeId,
          nt.typeName,
          nt.typeDescription
        FROM Newsletters n
        LEFT JOIN NewsletterType nt ON n.newsletterTypeId = nt.typeId
      `;

      const [rows] = await connection.execute(query);
      res.status(200).json({ rows, status: true });
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      res.status(500).json({ message: "Error fetching newsletters", error, status: false });
    } finally {
      await connection.end();
    }
  }

  /**
   * Payload (POST):
   * [
   *   {
   *     "newsletterName": "June Newsletter",
   *     "newsletterDescription": "Latest updates from June",
   *     "newsletterTypeId": 1
   *   }
   * ]
   */
  async addNewsletters(req: Request, res: Response) {
    const newsletters = req.body;

    if (!Array.isArray(newsletters) || newsletters.length === 0) {
      return res.status(400).json({ message: "Invalid input: must be a non-empty array" });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const insertQuery = `
        INSERT INTO Newsletters (
          newsletterName,
          newsletterDescription,
          newsletterTypeId
        ) VALUES ?
      `;

      const values = newsletters.map((n) => [
        n.newsletterName,
        n.newsletterDescription || "",
        n.newsletterTypeId,
      ]);

      const [result] = await connection.query(insertQuery, [values]);

      res.status(201).json({
        message: "Newsletters added successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error adding newsletters:", error);
      res.status(500).json({ message: "Error adding newsletters", error, status: false });
    } finally {
      await connection.end();
    }
  }

  /**
   * Payload (PUT):
   * {
   *   "newsletterId": 5,
   *   "newsletterName": "Updated Title",
   *   "newsletterDescription": "Updated Description",
   *   "newsletterTypeId": 2
   * }
   */
  async updateNewsletter(req: Request, res: Response) {
    const { newsletterId, newsletterName, newsletterDescription, newsletterTypeId } = req.body;

    if (!newsletterId) {
      return res.status(400).json({ message: "newsletterId is required for update" });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const updateQuery = `
        UPDATE Newsletters SET 
          newsletterName = ?, 
          newsletterDescription = ?, 
          newsletterTypeId = ?
        WHERE newsletterId = ?
      `;

      const [result] = await connection.execute(updateQuery, [
        newsletterName,
        newsletterDescription,
        newsletterTypeId,
        newsletterId,
      ]);

      res.status(200).json({
        message: "Newsletter updated successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error updating newsletter:", error);
      res.status(500).json({ message: "Error updating newsletter", error, status: false });
    } finally {
      await connection.end();
    }
  }

  /**
   * Payload (DELETE):
   * {
   *   "newsletterIds": [1, 2, 3]
   * }
   */
  async deleteNewsletters(req: Request, res: Response) {
    const { newsletterIds } = req.body;

    if (!Array.isArray(newsletterIds) || newsletterIds.length === 0) {
      return res.status(400).json({ message: "Invalid input: Provide newsletterIds" });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const deleteQuery = `DELETE FROM Newsletters WHERE newsletterId IN (?)`;

      const [result] = await connection.query(deleteQuery, [newsletterIds]);

      res.status(200).json({
        message: "Newsletters deleted successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error deleting newsletters:", error);
      res.status(500).json({ message: "Error deleting newsletters", error, status: false });
    } finally {
      await connection.end();
    }
  }


async  getById(req: Request, res: Response) {
   const connection = await mysql.createConnection(keys.database);
   const { newslettersId } = req.params;
    try {
      const query = `
        SELECT 
          n.newsletterId,
          n.newsletterName,
          n.newsletterDescription,
          nt.typeId AS newsletterTypeId,
          nt.typeName,
          nt.typeDescription
        FROM Newsletters n
        LEFT JOIN NewsletterType nt ON n.newsletterTypeId = nt.typeId
        WHERE newsletterId = ?
      `;

      const [rows] = await connection.execute(query,[newslettersId]);
      res.status(200).json({ rows, status: true });
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      res.status(500).json({ message: "Error fetching newsletters", error, status: false });
    } finally {
      await connection.end();
    }
  }

  //#endregion

  //#region ---------- Newsletter Types ----------

  /**
   * Payload (GET): none
   */
  async getNewsletterTypes(req: Request, res: Response) {
    const connection = await mysql.createConnection(keys.database);
    try {
      const [rows] = await connection.execute(`SELECT * FROM NewsletterType`);
      res.status(200).json({ rows, status: true });
    } catch (error) {
      console.error("Error fetching newsletter types:", error);
      res.status(500).json({ message: "Error fetching newsletter types", error, status: false });
    } finally {
      await connection.end();
    }
  }

  /**
   * Payload (POST):
   * [
   *   {
   *     "typeName": "Marketing",
   *     "typeDescription": "Marketing campaigns"
   *   }
   * ]
   */
  async addNewsletterTypes(req: Request, res: Response) {
    const types = req.body;

    if (!Array.isArray(types) || types.length === 0) {
      return res.status(400).json({ message: "Invalid input: must be a non-empty array" });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const insertQuery = `
        INSERT INTO NewsletterType (
          typeName,
          typeDescription
        ) VALUES ?
      `;

      const values = types.map((t) => [t.typeName, t.typeDescription || ""]);

      const [result] = await connection.query(insertQuery, [values]);

      res.status(201).json({
        message: "Newsletter types added successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error adding newsletter types:", error);
      res.status(500).json({ message: "Error adding newsletter types", error, status: false });
    } finally {
      await connection.end();
    }
  }

  /**
   * Payload (PUT):
   * {
   *   "typeId": 1,
   *   "typeName": "Updated Name",
   *   "typeDescription": "Updated Description"
   * }
   */
  async updateNewsletterType(req: Request, res: Response) {
    const { typeId, typeName, typeDescription } = req.body;

    if (!typeId) {
      return res.status(400).json({ message: "typeId is required for update" });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const updateQuery = `
        UPDATE NewsletterType SET 
          typeName = ?, 
          typeDescription = ?
        WHERE typeId = ?
      `;

      const [result] = await connection.execute(updateQuery, [
        typeName,
        typeDescription,
        typeId,
      ]);

      res.status(200).json({
        message: "Newsletter type updated successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error updating newsletter type:", error);
      res.status(500).json({ message: "Error updating newsletter type", error, status: false });
    } finally {
      await connection.end();
    }
  }

  /**
   * Payload (DELETE):
   * {
   *   "typeIds": [1, 2]
   * }
   */
  async deleteNewsletterTypes(req: Request, res: Response) {
    const { typeIds } = req.body;

    if (!Array.isArray(typeIds) || typeIds.length === 0) {
      return res.status(400).json({ message: "Invalid input: Provide typeIds" });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const deleteQuery = `DELETE FROM NewsletterType WHERE typeId IN (?)`;

      const [result] = await connection.query(deleteQuery, [typeIds]);

      res.status(200).json({
        message: "Newsletter types deleted successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error deleting newsletter types:", error);
      res.status(500).json({ message: "Error deleting newsletter types", error, status: false });
    } finally {
      await connection.end();
    }
  }

  //#endregion
}
