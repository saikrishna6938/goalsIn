import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../../keys";
import {
  deleteMultipleSuperUserRoles,
  deleteSuperUserRole,
  getSuperUserRoles,
  insertMultipleSuperUserRoles,
  insertSuperUserRole,
  updateMultipleSuperUserRoles,
  updateSuperUserRole,
} from "../../helpers/RolesManager/AdminManager/UserRoles/SuperUserRolesHelper";
import { SuperUserRole } from "../../objects/Roles/roles";

class AdminUserRolesController {
  // Get Super User Roles
  async getSuperUserRoles(req: Request, res: Response): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const condition = req.query.userId
        ? `userId = ${req.query.userId}`
        : undefined;

      const roles = await getSuperUserRoles(connection, condition);
      res.status(200).json({
        success: true,
        data: roles,
      });
    } catch (err) {
      console.error("Error fetching user roles:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching user roles",
        error: err.message,
      });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }

  // Insert a new Super User Role
  async insertSuperUserRole(req: Request, res: Response): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const role: SuperUserRole = req.body;

      await insertSuperUserRole(connection, role);
      res.status(201).json({
        success: true,
        message: "User role inserted successfully",
      });
    } catch (err) {
      console.error("Error inserting user role:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while inserting user role",
        error: err.message,
      });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }

  // Update an existing Super User Role
  async updateSuperUserRole(req: Request, res: Response): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const role: SuperUserRole = req.body;

      if (!role.superUserRoleId) {
        res.status(400).json({
          success: false,
          message: "superUserRoleId is required to update a user role",
        });
        return;
      }

      await updateSuperUserRole(connection, role);
      res.status(200).json({
        success: true,
        message: "User role updated successfully",
      });
    } catch (err) {
      console.error("Error updating user role:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while updating user role",
        error: err.message,
      });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }

  // Delete a Super User Role
  async deleteSuperUserRole(req: Request, res: Response): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const { superUserRoleId } = req.params;

      if (!superUserRoleId) {
        res.status(400).json({
          success: false,
          message: "superUserRoleId is required to delete a user role",
        });
        return;
      }

      await deleteSuperUserRole(connection, parseInt(superUserRoleId, 10));
      res.status(200).json({
        success: true,
        message: "User role deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting user role:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while deleting user role",
        error: err.message,
      });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }

  async updateMultipleSuperUserRoles(
    req: Request,
    res: Response
  ): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const roles: SuperUserRole[] = req.body;

      if (!Array.isArray(roles) || roles.length === 0) {
        res.status(400).json({
          success: false,
          message: "Request body must contain an array of roles for updating",
        });
        return;
      }

      await updateMultipleSuperUserRoles(connection, roles);
      res.status(200).json({
        success: true,
        message: "Roles updated successfully",
      });
    } catch (err) {
      console.error("Error updating multiple user roles:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while updating roles",
        error: err.message,
      });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }

  async insertMultipleSuperUserRoles(
    req: Request,
    res: Response
  ): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const roles: SuperUserRole[] = req.body;

      if (!Array.isArray(roles) || roles.length === 0) {
        res.status(400).json({
          success: false,
          message: "Request body must contain an array of roles for inserting",
        });
        return;
      }

      await insertMultipleSuperUserRoles(connection, roles);
      res.status(201).json({
        success: true,
        message: "Roles inserted successfully",
      });
    } catch (err) {
      console.error("Error inserting multiple user roles:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while inserting roles",
        error: err.message,
      });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }
  async deleteMultipleSuperUserRoles(
    req: Request,
    res: Response
  ): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const { ids }: { ids: number[] } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({
          success: false,
          message: "Request body must contain an array of IDs for deletion",
        });
        return;
      }

      await deleteMultipleSuperUserRoles(connection, ids);
      res.status(200).json({
        success: true,
        message: "Roles deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting multiple user roles:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while deleting roles",
        error: err.message,
      });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }
}

export const adminUserRolesController: AdminUserRolesController =
  new AdminUserRolesController();
