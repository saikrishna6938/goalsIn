import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../../keys";
import {
  deleteSuperRoleName,
  getSuperRoleNames,
  insertSuperRoleName,
  updateSuperRoleName,
} from "../../helpers/RolesManager/AdminManager/MainRolesManager/SuperRoleNamesHelper";
import { SuperRoleName } from "../../objects/Roles/roles";

class AdminRoleNamesController {
  // Get all role names
  async getSuperRoleNames(req: Request, res: Response): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const roleNames = await getSuperRoleNames(connection);

      res.status(200).json({
        success: true,
        data: roleNames,
      });
    } catch (err) {
      console.error("Error fetching role names:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching role names",
        error: err.message,
      });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  // Insert a new role name
  async insertSuperRoleName(req: Request, res: Response): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      await insertSuperRoleName(connection, req.body);

      res.status(201).json({
        success: true,
        message: "Role name inserted successfully",
      });
    } catch (err) {
      console.error("Error inserting role name:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while inserting role name",
        error: err.message,
      });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  // Delete a role name
  async deleteSuperRoleName(req: Request, res: Response): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
      const { roleNameId } = req.params;

      if (!roleNameId) {
        res.status(400).json({
          success: false,
          message: "roleNameId is required to delete a role name",
        });
        return;
      }

      connection = await mysql.createConnection(keys.database);
      await deleteSuperRoleName(connection, parseInt(roleNameId, 10));

      res.status(200).json({
        success: true,
        message: "Role name deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting role name:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while deleting role name",
        error: err.message,
      });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
  // Update a role name
  async updateSuperRoleName(req: Request, res: Response): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const roleName: SuperRoleName = req.body;

      if (!roleName.roleNameId) {
        res.status(400).json({
          success: false,
          message: "roleNameId is required to update a role name",
        });
        return;
      }

      await updateSuperRoleName(connection, roleName);

      res.status(200).json({
        success: true,
        message: "Role name updated successfully",
      });
    } catch (err) {
      console.error("Error updating role name:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while updating role name",
        error: err.message,
      });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
}

export const adminRoleNamesController: AdminRoleNamesController =
  new AdminRoleNamesController();
