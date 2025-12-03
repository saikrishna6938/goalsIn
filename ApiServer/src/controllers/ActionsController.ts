import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../keys";
class ActionsController {
  index(req: Request, res: Response) {
    res.send(" Hello from controller");
  }
  test(req: Request, res: Response) {
    res.send(req.body);
  }

  async getDocumentStateName(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const { documentStateId } = req.body;
      connection = await mysql.createConnection(keys.database);
      const [rows] = await connection.execute(
        `SELECT *  FROM DocumentStates WHERE documentStateId = ?`,
        [documentStateId]
      );
      if (rows[0]) {
        res.json({
          status: true,
          message: "Success",
          data: rows[0].documentStateName,
        });
      } else {
        res.json({ status: false, message: "Failed", data: "" });
      }
    } catch (error) {
      console.log(error);
      res.json({ status: false, message: "Failed to get object" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch (e) {
          console.error("Error closing MySQL connection:", e);
        }
      }
    }
  }

  async getTaskWorkflowByTaskId(req, res) {
    let connection: mysql.Connection | null = null;
    try {
      const { taskId } = req.params; // Assuming taskId is passed as a URL parameter
      connection = await mysql.createConnection(keys.database);

      const query = `
        SELECT TW.*,
        U.userFirstName,
        U.userLastName,
        A.actionName FROM TaskWorkflow TW
        INNER JOIN 
        Users U ON TW.taskUserId = U.userId
      INNER JOIN 
        Actions A ON TW.taskActionId = A.actionId
        WHERE taskId = ?
      `;

      const [rows] = await connection.execute(query, [taskId]);

      //@ts-ignore
      if (rows.length > 0) {
        res.json({ status: true, message: "Success", data: rows });
      } else {
        res.json({
          status: false,
          message: "No task workflow found for the given Task ID",
          data: [],
        });
      }
    } catch (error) {
      console.log(error);
      res.json({
        status: false,
        message: "Failed to get task workflow details",
      });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch (e) {
          console.error("Error closing MySQL connection:", e);
        }
      }
    }
  }

  async insertTaskWorkflow(req, res) {
    let connection: mysql.Connection | null = null;
    try {
      const { taskId, taskSelectedOption, taskNote, taskUserId, taskActionId } =
        req.body; // Extracting data from request body
      connection = await mysql.createConnection(keys.database);

      const query = `
        INSERT INTO TaskWorkflow (taskId, taskSelectedOption, taskNote, taskWorkflowDate, taskUserId, taskActionId)
        VALUES (?, ?, ?, NOW(), ?, ?)
      `;

      const [result] = await connection.execute(query, [
        taskId,
        taskSelectedOption,
        taskNote,
        taskUserId,
        taskActionId,
      ]);

      //@ts-ignore
      if (result.affectedRows > 0) {
        res.json({ status: true, message: "TaskWorkflow added successfully" });
      } else {
        res.json({ status: false, message: "Failed to add TaskWorkflow" });
      }
    } catch (error) {
      console.log(error);
      res.json({
        status: false,
        message: "Failed to insert task workflow data",
      });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch (e) {
          console.error("Error closing MySQL connection:", e);
        }
      }
    }
  }

  async updateDocumentStateByAction(req, res) {
    let connection: mysql.Connection | null = null;
    try {
      const { actionId, taskId, userId } = req.body; // TaskId is assumed to identify which task to update
      connection = await mysql.createConnection(keys.database);

      // Get the fromStateId and toStateId for the given actionId
      const [transitionRows] = await connection.execute(
        `SELECT fromStateId, toStateId FROM ActionStateTransitions WHERE actionId = ?`,
        [actionId]
      );

      if (!transitionRows[0]) {
        return res.json({ status: false, message: "Action not found" });
      }

      const { fromStateId, toStateId } = transitionRows[0];

      if (fromStateId !== toStateId) {
        // Update the documentStateId of the Tasks table to toStateId
        const [updateResult] = await connection.execute(
          `UPDATE Tasks SET documentStateId = ? WHERE taskId = ?`,
          [toStateId, taskId]
        );
        //@ts-ignore
        if (updateResult.affectedRows > 0) {
          res.json({ status: true, message: "Task updated successfully" });
        } else {
          res.json({ status: false, message: "Failed to update task" });
        }
      } else {
        res.json({ status: true, message: "Task updated successfully" });
      }
    } catch (error) {
      console.log(error);
      res.json({ status: false, message: "Failed to process action" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch (e) {
          console.error("Error closing MySQL connection:", e);
        }
      }
    }
  }

  async geDocumentActions(req, res) {
    let connection: mysql.Connection | null = null;
    try {
      const { documentStateId, userType, taskId } = req.body;
      connection = await mysql.createConnection(keys.database);

      const query = `
        SELECT 
          A.*, 
          OD.options
        FROM 
          Actions A
        INNER JOIN 
          userActions UA ON A.actionId = UA.actionId
        LEFT JOIN 
          OptionsData OD ON A.optionId = OD.optionId
        WHERE 
          A.documentStateId = ? AND UA.userType = ? AND UA.actionTaskId = ?
      `;

      const [rows] = await connection.execute(query, [
        documentStateId,
        userType,
        taskId,
      ]);
      //@ts-ignore
      if (rows.length > 0) {
        //@ts-ignore
        const parsedRows = rows.map((row) => {
          if (row.options) {
            try {
              // Parse the options JSON string
              row.options = JSON.parse(row.options);
            } catch (error) {
              console.error("Error parsing options JSON:", error);
              row.options = null; // or however you want to handle the parse error
            }
          }
          return row;
        });

        res.json({ status: true, message: "Success", data: parsedRows });
      } else {
        res.json({ status: false, message: "Failed", data: [] });
      }
    } catch (error) {
      console.log(error);
      res.json({ status: false, message: "Failed to get object" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch (e) {
          console.error("Error closing MySQL connection:", e);
        }
      }
    }
  }
}

export const actionsController: ActionsController = new ActionsController();
