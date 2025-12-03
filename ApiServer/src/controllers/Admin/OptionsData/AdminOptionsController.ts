import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../../../keys";

class AdminOptionsController {
  async createOption(req: Request, res: Response) {
    const { optionName, options } = req.body;

    if (!optionName || !Array.isArray(options)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid input." });
    }

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const [result] = await connection.execute(
        "INSERT INTO OptionsData (optionName, options) VALUES (?, ?)",
        [optionName, JSON.stringify(options)]
      );

      res.status(201).json({
        success: true,
        message: "Option created successfully",
        insertId: (result as any).insertId,
      });
    } catch (error) {
      console.error("Error creating option:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to create option." });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  async getOptions(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const [rows] = await connection.execute(
        "SELECT optionId,optionName FROM OptionsData"
      );

      const cleaned = (rows as any[]).map((row) => ({
        ...row,
      }));

      res.json({ success: true, data: cleaned });
    } catch (error) {
      console.error("Error fetching options:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch options." });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }

  async getOptionsByID(req: Request, res: Response) {
    const { optionId } = req.params;

    if (!optionId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: optionId",
      });
    }

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const [rows] = await connection.execute(
        "SELECT optionId, optionName, options FROM OptionsData WHERE optionId = ?",
        [optionId]
      );

      if ((rows as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: "Option not found.",
        });
      }

      const row = rows[0] as any;

      res.json({
        success: true,
        data: {
          optionId: row.optionId,
          optionName: row.optionName,
          options: JSON.parse(row.options),
        },
      });
    } catch (error) {
      console.error("Error fetching option by ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch option by ID.",
      });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }

  async deleteOption(req: Request, res: Response) {
    const { optionId } = req.params;

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const [result] = await connection.execute(
        "DELETE FROM OptionsData WHERE optionId = ?",
        [optionId]
      );

      if ((result as any).affectedRows > 0) {
        res.json({ success: true, message: "Option deleted successfully." });
      } else {
        res.status(404).json({ success: false, message: "Option not found." });
      }
    } catch (error) {
      console.error("Error deleting option:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete option." });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }

  async updateOption(req: Request, res: Response) {
    const { optionId } = req.params;
    const { optionName, options } = req.body;

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const [result] = await connection.execute(
        "UPDATE OptionsData SET optionName = ?, options = ? WHERE optionId = ?",
        [optionName, JSON.stringify(options), optionId]
      );

      if ((result as any).affectedRows > 0) {
        res.json({ success: true, message: "Option updated successfully." });
      } else {
        res.status(404).json({ success: false, message: "Option not found." });
      }
    } catch (error) {
      console.error("Error updating option:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update option." });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }

  async getOptionDataByLabelName(req: Request, res: Response) {
    const { optionName } = req.params;

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const [rows] = await connection.execute(
        "SELECT * FROM OptionsData WHERE optionName = ?",
        [optionName]
      );

      if ((rows as any).length > 0) {
        res.json({ success: true, data: rows });
      } else {
        res.status(404).json({ success: false, message: "Option not found." });
      }
    } catch (error) {
      console.error("Error fetching option by label:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch option." });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }

  async getOptionsDataByValueLabel(req: Request, res: Response) {
    const { entityId, valueLabel } = req.query;

    if (!entityId || !valueLabel) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: entityId and valueLabel",
      });
    }

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const [rows] = await connection.execute(
        `
      SELECT 
        sov.id AS structureOptionId,
        sov.selectedOptionId,
        sov.valueLabel,
        od.optionId,
        od.optionName,
        od.options,
        s.entityName
      FROM StructureOptionValues sov
      JOIN OptionsData od ON sov.optionId = od.optionId
      JOIN Structure s ON sov.entityId = s.entityId
      WHERE sov.entityId = ? AND sov.valueLabel = ?
      `,
        [entityId, valueLabel]
      );

      if ((rows as any).length > 0) {
        const row = rows[0] as any;

        // Parse the JSON options and find the selected option
        const optionsList = JSON.parse(row.options);
        const selected = optionsList.find(
          (o: any) => o.id === row.selectedOptionId
        );

        return res.json({
          success: true,
          data: {
            structureOptionId: row.structureOptionId,
            entityId,
            entityName: row.entityName,
            optionId: row.optionId,
            optionName: row.optionName,
            selectedOptionId: row.selectedOptionId,
            selectedOptionName: selected?.name || null,
            selectedOptionDescription: selected?.description || null,
            valueLabel: row.valueLabel,
            fullOptionsList: optionsList,
          },
        });
      } else {
        return res.status(404).json({
          success: false,
          message:
            "No matching record found for the given entity and value label",
        });
      }
    } catch (error) {
      console.error("Error in getOptionsDataByValueLabel:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error while fetching option data",
      });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }

  async getValueLabelsByEntityId(req: Request, res: Response) {
    const { entityId } = req.params;

    if (!entityId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: entityId",
      });
    }

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const [rows] = await connection.execute(
        `
      SELECT id, valueLabel 
      FROM StructureOptionValues 
      WHERE entityId = ?
      `,
        [entityId]
      );

      res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error("Error fetching value labels by entityId:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error while fetching value labels.",
      });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }

  async createStructureOptionValue(req: Request, res: Response) {
    const { entityId, optionId, selectedOptionId, valueLabel, notes } =
      req.body;

    if (!entityId || !optionId || !selectedOptionId || !valueLabel) {
      return res.status(400).json({
        success: false,
        message:
          "Required fields: entityId, optionId, selectedOptionId, valueLabel",
      });
    }

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const [result] = await connection.execute(
        `
      INSERT INTO StructureOptionValues 
      (entityId, optionId, selectedOptionId, valueLabel, notes) 
      VALUES (?, ?, ?, ?, ?)
      `,
        [entityId, optionId, selectedOptionId, valueLabel, notes || null]
      );

      res.status(201).json({
        success: true,
        message: "StructureOptionValue created successfully.",
        insertId: (result as any).insertId,
      });
    } catch (error) {
      console.error("Error inserting StructureOptionValue:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create StructureOptionValue.",
      });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }

  async getAllStructureOptionValues(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const [rows] = await connection.execute(
        `
      SELECT 
        sov.id,
        sov.entityId,
        s.entityName,
        sov.optionId,
        od.optionName,
        sov.selectedOptionId,
        sov.valueLabel,
        sov.notes
      FROM StructureOptionValues sov
      JOIN Structure s ON sov.entityId = s.entityId
      JOIN OptionsData od ON sov.optionId = od.optionId
      `
      );

      const result = (rows as any[]).map((row) => ({
        ...row,
      }));

      res.json({ success: true, data: result });
    } catch (error) {
      console.error("Error fetching StructureOptionValues:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch structure option values.",
      });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }

  async getStructureOptionValueById(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: id",
      });
    }

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const [rows] = await connection.execute(
        `
      SELECT 
        sov.id,
        sov.entityId,
        s.entityName,
        sov.optionId,
        od.optionName,
        od.options,
        sov.selectedOptionId,
        sov.valueLabel,
        sov.notes
      FROM StructureOptionValues sov
      JOIN Structure s ON sov.entityId = s.entityId
      JOIN OptionsData od ON sov.optionId = od.optionId
      WHERE sov.id = ?
      `,
        [id]
      );

      connection.end();

      if ((rows as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: "StructureOptionValue not found.",
        });
      }

      const row = rows[0] as any;
      const optionsList = JSON.parse(row.options);
      const selected = optionsList.find(
        (o: any) => o.id === row.selectedOptionId
      );

      res.json({
        success: true,
        data: {
          id: row.id,
          entityId: row.entityId,
          entityName: row.entityName,
          optionId: row.optionId,
          optionName: row.optionName,
          selectedOptionId: row.selectedOptionId,
          selectedOptionName: selected?.name || null,
          selectedOptionDescription: selected?.description || null,
          valueLabel: row.valueLabel,
          notes: row.notes,
          fullOptionsList: optionsList,
        },
      });
    } catch (error) {
      console.error("Error fetching StructureOptionValue by ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch StructureOptionValue by ID.",
      });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }

  async updateStructureOptionValue(req: Request, res: Response) {
    const { id } = req.params;
    const { entityId, optionId, selectedOptionId, valueLabel, notes } =
      req.body;

    if (!entityId || !optionId || !selectedOptionId || !valueLabel) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: entityId, optionId, selectedOptionId, valueLabel",
      });
    }

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const [result] = await connection.execute(
        `
      UPDATE StructureOptionValues
      SET entityId = ?, optionId = ?, selectedOptionId = ?, valueLabel = ?, notes = ?
      WHERE id = ?
      `,
        [entityId, optionId, selectedOptionId, valueLabel, notes || null, id]
      );

      if ((result as any).affectedRows > 0) {
        res.json({
          success: true,
          message: "StructureOptionValue updated successfully.",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "StructureOptionValue not found.",
        });
      }
    } catch (error) {
      console.error("Error updating StructureOptionValue:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update StructureOptionValue.",
      });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }

  async deleteStructureOptionValue(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: id",
      });
    }

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const [result] = await connection.execute(
        `DELETE FROM StructureOptionValues WHERE id = ?`,
        [id]
      );

      if ((result as any).affectedRows > 0) {
        res.json({
          success: true,
          message: "StructureOptionValue deleted successfully.",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "StructureOptionValue not found.",
        });
      }
    } catch (error) {
      console.error("Error deleting StructureOptionValue:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete StructureOptionValue.",
      });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }
}

export const adminOptionsController = new AdminOptionsController();
