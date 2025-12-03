import { Request, Response } from "express";
import mysql from "mysql2/promise";
import keys from "../../../keys";

export class ActionStateTransitionsController {
  constructor() {}

  // 🔍 Get all transitions for a given actionId and fromStateId with state and action names
  async getTransitionsByAction(req: Request, res: Response) {
    const { actionId } = req.params;
    const { fromStateId } = req.query;

    if (!actionId) {
      return res.status(400).json({
        message: "actionId is required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      let query = `
        SELECT 
          ast.transitionId,
          ast.actionId,
          a.actionName,
          ast.fromStateId,
          fs.documentStateName AS fromStateName,
          ast.toStateId,
          ts.documentStateName AS toStateName
        FROM ActionStateTransitions ast
        LEFT JOIN Actions a ON ast.actionId = a.actionId
        LEFT JOIN DocumentStates fs ON ast.fromStateId = fs.documentStateId
        LEFT JOIN DocumentStates ts ON ast.toStateId = ts.documentStateId
        WHERE ast.actionId = ?
      `;

      const params: any[] = [actionId];

      if (fromStateId) {
        query += ` AND ast.fromStateId = ?`;
        params.push(fromStateId);
      }

      query += ` ORDER BY ast.transitionId ASC`;

      const [rows] = await connection.execute(query, params);

      res.status(200).json({
        message: "Transitions retrieved successfully",
        data: rows,
        status: true,
      });
    } catch (error) {
      console.error("Error retrieving transitions:", error);
      res.status(500).json({
        message: "Failed to retrieve transitions",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  // ➕ Add a new transition
  async addTransition(req: Request, res: Response) {
    const { actionId, fromStateId, toStateId } = req.body;

    if (!actionId || !fromStateId || !toStateId) {
      return res.status(400).json({
        message: "actionId, fromStateId, and toStateId are required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const query = `
        INSERT INTO ActionStateTransitions (actionId, fromStateId, toStateId)
        VALUES (?, ?, ?)
      `;

      const [result] = await connection.execute(query, [
        actionId,
        fromStateId,
        toStateId,
      ]);

      res.status(201).json({
        message: "Transition added successfully",
        insertedId: result["insertId"],
        status: true,
      });
    } catch (error) {
      console.error("Error adding transition:", error);
      res.status(500).json({
        message: "Failed to add transition",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  // ✏️ Update an existing transition
  async updateTransition(req: Request, res: Response) {
    const { transitionId, actionId, fromStateId, toStateId } = req.body;

    if (!transitionId || !actionId || !fromStateId || !toStateId) {
      return res.status(400).json({
        message:
          "transitionId, actionId, fromStateId, and toStateId are required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const query = `
        UPDATE ActionStateTransitions
        SET actionId = ?, fromStateId = ?, toStateId = ?
        WHERE transitionId = ?
      `;

      const [result] = await connection.execute(query, [
        actionId,
        fromStateId,
        toStateId,
        transitionId,
      ]);

      res.status(200).json({
        message: "Transition updated successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error updating transition:", error);
      res.status(500).json({
        message: "Failed to update transition",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  // ❌ Delete a transition
  async deleteTransition(req: Request, res: Response) {
    const { transitionId } = req.body;

    if (!transitionId) {
      return res.status(400).json({
        message: "transitionId is required",
        status: false,
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const query = `
        DELETE FROM ActionStateTransitions
        WHERE transitionId = ?
      `;

      const [result] = await connection.execute(query, [transitionId]);

      res.status(200).json({
        message: "Transition deleted successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error deleting transition:", error);
      res.status(500).json({
        message: "Failed to delete transition",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }
}
