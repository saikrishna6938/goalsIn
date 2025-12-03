import { Request, Response } from "express";
import mysql from "mysql2/promise";
import keys from "../../keys";
import {
  getSuperUserRolesByUserId,
  getUsersByEntityId,
  getUsersByJob,
} from "../../helpers/RolesManager/AdminManager/UserManager/UserRolesManagerHelper";

class UserRolesManagerController {
  constructor() {}

  async getUsersByEntityId(req: Request, res: Response): Promise<void> {
    try {
      const connection = await mysql.createConnection(keys.database);

      const { entityId, userType } = req.params;

      if (!entityId) {
        res.status(400).json({
          success: false,
          message: "entityId is required to fetch users",
        });
        return;
      }

      const users = await getUsersByEntityId(
        connection,
        parseInt(entityId, 10)
      );

      await connection.end();

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (err) {
      console.error("Error fetching users by entityId:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching users",
        error: err.message,
      });
    }
  }
  async getSuperUserRoles(req: Request, res: Response) {
    const { userId } = req.params;

    const connection = await mysql.createConnection(keys.database);
    try {
      const query = `
          SELECT 
            sur.superUserRoleId,
            sur.userId,
            sur.userRoleNameId AS roleNameId,
            sur.updatedDate,
            srn.roleName
          FROM SuperUserRoles sur
          LEFT JOIN SuperRoleNames srn ON sur.userRoleNameId = srn.roleNameId
          WHERE sur.userId = ?
        `;
      const [rows] = await connection.execute(query, [userId]);

      res.status(200).json({ rows, status: true });
    } catch (error) {
      console.error("Error fetching SuperUserRoles:", error);
      res.status(500).json({
        message: "Error fetching SuperUserRoles",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  async getusersforjob(req: Request, res: Response): Promise<void> {
    try {
      const connection = await mysql.createConnection(keys.database);

      const { entityId, userType } = req.params;

      if (!entityId) {
        res.status(400).json({
          success: false,
          message: "entityId is required to fetch users",
        });
        return;
      }

      const users = await getUsersByJob(
        connection,
        parseInt(entityId, 10),
        parseInt(userType, 10)
      );

      await connection.end();

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (err) {
      console.error("Error fetching users by entityId:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching users",
        error: err.message,
      });
    }
  }

  async addSuperUserRoles(req: Request, res: Response) {
    const roles = req.body;

    if (!Array.isArray(roles) || roles.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid input: must be a non-empty array" });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const insertQuery = `
          INSERT INTO SuperUserRoles (
            userId,
            userRoleNameId,
            updatedDate
          ) VALUES ?
        `;

      const values = roles.map((role) => [
        role.userId,
        role.userRoleNameId,
        role.updatedDate || new Date(), // defaulting to current date
      ]);

      const [result] = await connection.query(insertQuery, [values]);

      res.status(201).json({
        message: "SuperUserRoles added successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error adding SuperUserRoles:", error);
      res.status(500).json({
        message: "Error adding SuperUserRoles",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }

  async deleteSuperUserRoles(req: Request, res: Response) {
    const { roleIds: superUserRoleIds, userId } = req.body;
    console.log(req.body);
    if (
      !Array.isArray(superUserRoleIds) ||
      superUserRoleIds.length === 0 ||
      !userId
    ) {
      return res.status(400).json({
        message: "Invalid input: Provide superUserRoleIds and userId",
      });
    }

    const connection = await mysql.createConnection(keys.database);
    try {
      const deleteQuery = `
          DELETE FROM SuperUserRoles 
          WHERE userRoleNameId IN (?) AND userId = ?
        `;

      const [result] = await connection.query(deleteQuery, [
        superUserRoleIds,
        userId,
      ]);

      res.status(200).json({
        message: "SuperUserRoles deleted successfully",
        affectedRows: result["affectedRows"],
        status: true,
      });
    } catch (error) {
      console.error("Error deleting SuperUserRoles:", error);
      res.status(500).json({
        message: "Error deleting SuperUserRoles",
        error,
        status: false,
      });
    } finally {
      await connection.end();
    }
  }
}
export const userRolesManagerController: UserRolesManagerController =
  new UserRolesManagerController();
