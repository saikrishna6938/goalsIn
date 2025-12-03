import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../../keys";
import path from "path";
import fs from "fs/promises";
import { sendEmail } from "../../EmailHelper";
import {
  deleteRoleType,
  getRoleTypes,
  insertRoleType,
  updateRoleType,
} from "../../helpers/RolesManager/AdminManager/MainRolesManager/SuperRoleTypesHelper";
import { SuperRoleType } from "../../objects/Roles/roles";

class AdminRolesManager {
  // Get all super role types
  async getSuperRoleTypes(req: Request, res: Response): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const roleTypes = await getRoleTypes(connection);

      res.status(200).json({
        success: true,
        data: roleTypes,
      });
    } catch (err) {
      console.error("Error fetching role types:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching role types",
        error: err.message,
      });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  // Update a super role type
  async updateSuperRoleType(req: Request, res: Response): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const roleType: SuperRoleType = req.body;

      if (!roleType.roleTypeId) {
        res.status(400).json({
          success: false,
          message: "roleTypeId is required for updating a role type",
        });
        return;
      }

      await updateRoleType(connection, roleType);

      res.status(200).json({
        success: true,
        message: "Role type updated successfully",
      });
    } catch (err) {
      console.error("Error updating role type:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while updating role type",
        error: err.message,
      });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  // Delete a super role type
  async deleteSuperRoleType(req: Request, res: Response): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const { roleTypeId } = req.params;

      if (!roleTypeId) {
        res.status(400).json({
          success: false,
          message: "roleTypeId is required for deleting a role type",
        });
        return;
      }

      await deleteRoleType(connection, parseInt(roleTypeId, 10));

      res.status(200).json({
        success: true,
        message: "Role type deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting role type:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while deleting role type",
        error: err.message,
      });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }

  // Insert a new super role type
  async insertSuperRoleType(req: Request, res: Response): Promise<void> {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const roleType: SuperRoleType = req.body;

      if (!roleType.roleTypeName) {
        res.status(400).json({
          success: false,
          message: "roleTypeName is required for inserting a role type",
        });
        return;
      }

      await insertRoleType(connection, roleType);

      res.status(201).json({
        success: true,
        message: "Role type inserted successfully",
      });
    } catch (err) {
      console.error("Error inserting role type:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while inserting role type",
        error: err.message,
      });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
}

export const adminRolesController: AdminRolesManager = new AdminRolesManager();
