import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../../../keys";

export class AdminDocumentTypesController {
  constructor() {}

  // DocumentType Functions

  async addDocumentType(req: Request, res: Response) {
    const connection = await mysql.createConnection(keys.database);
    try {
      const {
        documentTypeName,
        documentTypeDescription,
        documentTypeObjectId,
        tableName,
        documentGroupId,
        documentTypeRoles,
        documentTypeTableId,
        enabled,
      } = req.body;

      const query = `INSERT INTO DocumentType (documentTypeName, documentTypeDescription, documentTypeObjectId, tableName, documentGroupId, documentTypeRoles, documentTypeTableId, enabled) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      const [result] = await connection.execute(query, [
        documentTypeName,
        documentTypeDescription,
        documentTypeObjectId,
        tableName,
        documentGroupId,
        documentTypeRoles,
        documentTypeTableId,
        enabled,
      ]);

      res.status(201).json({
        message: "DocumentType added successfully",
        result,
        status: true,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error adding DocumentType", error, status: false });
    } finally {
      await connection.end();
    }
  }

  async editDocumentType(req: Request, res: Response) {
    const connection = await mysql.createConnection(keys.database);
    try {
      const { documentTypeId } = req.params;
      const updates = req.body;

      if (!Object.keys(updates).length) {
        return res
          .status(400)
          .json({ message: "No fields provided for update" });
      }

      const fields = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = Object.values(updates);
      values.push(documentTypeId);

      const query = `UPDATE DocumentType SET ${fields} WHERE documentTypeId = ?`;
      await connection.execute(query, values);

      res
        .status(200)
        .json({ message: "DocumentType updated successfully", status: true });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating DocumentType", error, status: false });
    } finally {
      await connection.end();
    }
  }

  async deleteDocumentType(req: Request, res: Response) {
    const connection = await mysql.createConnection(keys.database);
    try {
      const { documentTypeId } = req.params;
      const query = `DELETE FROM DocumentType WHERE documentTypeId = ?`;
      await connection.execute(query, [documentTypeId]);

      res
        .status(200)
        .json({ message: "DocumentType deleted successfully", status: true });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting DocumentType", error, status: false });
    } finally {
      await connection.end();
    }
  }

  async getAllDocumentTypes(req: Request, res: Response) {
    const connection = await mysql.createConnection(keys.database);
    try {
      const query = `
        SELECT 
          dt.*, 
          dg.documentGroupName,
          dg.groupTypeId,
          dgt.groupTypeName
        FROM DocumentType dt
        LEFT JOIN DocumentGroup dg ON dt.documentGroupId = dg.documentGroupId
        LEFT JOIN DocumentGroupType dgt ON dg.groupTypeId = dgt.groupTypeId
      `;
      const [rows] = await connection.execute(query);
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ message: "Error fetching DocumentTypes", error });
    } finally {
      await connection.end();
    }
  }

  async getSingleDocumentType(req: Request, res: Response) {
    const connection = await mysql.createConnection(keys.database);
    try {
      const { documentTypeId } = req.params;

      const query = `
        SELECT 
          dt.*, 
          dg.documentGroupName,
          dg.groupTypeId,
          dgt.groupTypeName
        FROM DocumentType dt
        LEFT JOIN DocumentGroup dg ON dt.documentGroupId = dg.documentGroupId
        LEFT JOIN DocumentGroupType dgt ON dg.groupTypeId = dgt.groupTypeId
        WHERE dt.documentTypeId = ?
      `;
      const [rows] = await connection.execute(query, [documentTypeId]);

      //@ts-ignore
      if (rows.length === 0) {
        return res
          .status(404)
          .json({ message: "DocumentType not found", status: true });
      }

      res.status(200).json(rows[0]);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching DocumentType", error, status: false });
    } finally {
      await connection.end();
    }
  }

  // DocumentGroup Functions

  async addDocumentGroup(req: Request, res: Response) {
    const connection = await mysql.createConnection(keys.database);
    try {
      const {
        documentGroupName,
        documentGroupDescription,
        dataTableId,
        groupTypeId,
      } = req.body;
      const query = `INSERT INTO DocumentGroup (documentGroupName, documentGroupDescription, dataTableId, groupTypeId) VALUES (?, ?, ?, ?)`;
      const [result] = await connection.execute(query, [
        documentGroupName,
        documentGroupDescription,
        dataTableId,
        groupTypeId,
      ]);
      res.status(201).json({
        message: "DocumentGroup added successfully",
        result,
        status: true,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error adding DocumentGroup", error, status: false });
    } finally {
      await connection.end();
    }
  }

  async editDocumentGroup(req: Request, res: Response) {
    const connection = await mysql.createConnection(keys.database);
    try {
      const { documentGroupId } = req.params;
      const updates = req.body;
      if (!Object.keys(updates).length) {
        return res
          .status(400)
          .json({ message: "No fields provided for update" });
      }
      const fields = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = Object.values(updates);
      values.push(documentGroupId);
      const query = `UPDATE DocumentGroup SET ${fields} WHERE documentGroupId = ?`;
      await connection.execute(query, values);
      res
        .status(200)
        .json({ message: "DocumentGroup updated successfully", status: true });
    } catch (error) {
      res.status(500).json({
        message: "Error updating DocumentGroup",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  async getAllDocumentGroups(req: Request, res: Response) {
    const connection = await mysql.createConnection(keys.database);
    try {
      const query = `
        SELECT dg.*, dgt.groupTypeName
        FROM DocumentGroup dg
        LEFT JOIN DocumentGroupType dgt ON dg.groupTypeId = dgt.groupTypeId
      `;
      const [rows] = await connection.execute(query);
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ message: "Error fetching DocumentGroups", error });
    } finally {
      await connection.end();
    }
  }

  async getSingleDocumentGroup(req: Request, res: Response) {
    const connection = await mysql.createConnection(keys.database);
    try {
      const { documentGroupId } = req.params;
      const query = `
        SELECT dg.*, dgt.groupTypeName
        FROM DocumentGroup dg
        LEFT JOIN DocumentGroupType dgt ON dg.groupTypeId = dgt.groupTypeId
        WHERE dg.documentGroupId = ?
      `;
      const [rows] = await connection.execute(query, [documentGroupId]);
      //@ts-ignore
      if (rows.length === 0) {
        return res
          .status(404)
          .json({ message: "DocumentGroup not found", status: true });
      }
      res.status(200).json(rows[0]);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching DocumentGroup",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }
  async deleteDocumentGroup(req: Request, res: Response) {
    const connection = await mysql.createConnection(keys.database);
    try {
      const { documentGroupId } = req.params;
      const query = `DELETE FROM DocumentGroup WHERE documentGroupId = ?`;
      await connection.execute(query, [documentGroupId]);

      res.status(200).json({
        message: "DocumentGroup deleted successfully",
        status: true,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error deleting DocumentGroup",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }
  async getDocumentGroupTypes(req: Request, res: Response) {
    const connection = await mysql.createConnection(keys.database);
    try {
      const query = `SELECT groupTypeId, groupTypeName FROM DocumentGroupType`;
      const [rows] = await connection.execute(query);

      // Convert to enum-like object
      const enumMap: Record<string, number> = {};
      //@ts-ignore
      rows.forEach((row) => {
        enumMap[row.groupTypeName.toUpperCase()] = row.groupTypeId;
      });

      res.status(200).json({
        data: rows,
        enum: enumMap,
        status: true,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching DocumentGroupTypes",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }
}
