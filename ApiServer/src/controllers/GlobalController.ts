import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../keys";
import { getDocumentGroups } from "../helpers/documents/DocumentTypeHelpers";
class GlobalController {
  async checkUserDocumentPermission(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const { userId, documentTypeId, userType } = req.body;
      connection = await mysql.createConnection(keys.database);

      const [result] =
        (await connection.execute(
          "SELECT * from UserDocumentsPermission WHERE documentTypeId = ? AND userType= ?",
          [documentTypeId, userType]
        )) ?? [];
      if (result[0].submissions > 0) {
        res.json({ status: true, data: 1 });
      } else {
        res.json({ status: true, data: 0 });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  async getDocumentGroups(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const result = await getDocumentGroups(connection);
      if (result[0].documentGroups) {
        res.json({ status: true, data: result[0].documentGroups });
      } else {
        res.json({ status: true, data: [] });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  async cloneProfileObject(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const userId = req.params.userId; // Assuming userId is passed as a parameter
      const documentTypeAnswer = await getCloneProfile(connection, userId);

      if (documentTypeAnswer) {
        res.json({ status: true, data: documentTypeAnswer });
      } else {
        res.json({ status: true, data: null });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  // ... other imports ...

  async checkUserSubmittedDocument(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const { userId, documentTypeId } = req.body;
      connection = await mysql.createConnection(keys.database);

      // 1. Fetch the user's roles
      const [userRolesResult]: any = await connection.execute(
        "SELECT roles FROM Users WHERE userId = ?",
        [userId]
      );

      const userRoles = userRolesResult[0]?.roles.split(",").map(Number);

      // 2. Fetch all roleTypeIds that have the name "Default"
      const [defaultRoleTypeResult]: any = await connection.execute(
        "SELECT roleTypeId FROM RoleTypes WHERE roleTypeName = ?",
        ["Default"]
      );

      const defaultRoleTypeId = defaultRoleTypeResult[0]?.roleTypeId;
      // 3. Check if user has a role with roleTypeId of "Default"
      const hasDefaultRole = userRoles?.includes(defaultRoleTypeId);

      if (!hasDefaultRole) {
        return res.json({
          status: false,
          message: "User has not been assigned the Default role type.",
          userRoles,
          defaultRoleTypeId,
          hasDefaultRole,
        });
      }

      // 4. If user has "Default" role type, check if they have submitted the document
      const [result] =
        (await connection.execute(
          "SELECT COUNT(*) AS count from DocumentTypeAnswers WHERE documentTypeId = ? AND userId= ?",
          [documentTypeId, userId]
        )) ?? [];
      res.json({ status: true, data: result[0].count });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  async assignDefaultRoleToUser(userId) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      // 1. Fetch the user's roles
      const [userRolesResult]: any = await connection.execute(
        "SELECT roles FROM Users WHERE userId = ?",
        [userId]
      );

      const userRoles = userRolesResult[0]?.roles
        ? userRolesResult[0].roles.split(",").map(Number)
        : [];

      // 2. Fetch the roleTypeId for "Default"
      const [defaultRoleTypeResult]: any = await connection.execute(
        "SELECT roleTypeId FROM RoleTypes WHERE roleTypeName = ?",
        ["Default"]
      );

      const defaultRoleTypeId = defaultRoleTypeResult[0]?.roleTypeId;

      if (!defaultRoleTypeId) {
        // nothing to assign
      }

      // 3. Check if user already has the default role
      const hasDefaultRole = userRoles.includes(defaultRoleTypeId);

      if (!hasDefaultRole) {
        // Add default role to the user's roles
        userRoles.push(defaultRoleTypeId);
        const updatedRoles = userRoles.join(",");

        // Update the user's roles in the database
        await connection.execute(
          "UPDATE Users SET roles = ? WHERE userId = ?",
          [updatedRoles, userId]
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
}

async function getCloneProfile(connection, userId) {
  try {
    // Query to check and fetch the first documentTypeAnswers for the given userId
    const [rows] = await connection.execute(
      `SELECT * FROM DocumentTypeAnswers WHERE userId = ? LIMIT 1`,
      [userId]
    );

    // Return the first index values if any rows exist
    if (rows.length > 0) {
      return rows[0];
    }

    // Return null if no entries found
    return null;
  } catch (error) {
    throw new Error("Error fetching documentTypeAnswers: " + error.message);
  }
}

export const globalController: GlobalController = new GlobalController();
