import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../keys";
class RolesController {
  index(req: Request, res: Response) {
    res.send(" Hello from controller");
  }
  test(req: Request, res: Response) {
    res.send(req.body);
  }

  async addRole(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const { roleTypeId, roleName, roleDescription } = req.body;
      connection = await mysql.createConnection(keys.database);
      await connection.execute(
        `INSERT INTO Roles ( roleTypeId, roleName, roleDescription) VALUES ( ?, ?, ?)`,
        [roleTypeId, roleName, roleDescription]
      );
      res.json({ success: true, message: "Role added successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to add role" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
  async getRoles(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const [result] = await connection.execute("SELECT * from Roles");
      //@ts-ignore
      if (result.length) {
        res.json({ success: true, message: "Success", data: result });
      } else {
        res.json({ success: true, message: "Success", data: [] });
      }
    } catch (error) {
      res.json({ success: false, message: "Something went wrong", data: [] });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
  async getRolesById(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const roleId = req.params.roleId;
      connection = await mysql.createConnection(keys.database);
      const [result] = await connection.execute(
        "SELECT * from Roles WHERE roleId= ?",
        [roleId]
      );
      //@ts-ignore
      if (result.length) {
        res.json({ success: true, message: "Success", data: result[0] });
      } else {
        res.json({ success: true, message: "Success", data: {} });
      }
    } catch (error) {
      res.json({ success: false, message: "Something went wrong", data: {} });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
  async updateRole(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const roleId = req.params.roleId; // Extract the roleId from the request parameters
      const { roleTypeId, roleName, roleDescription } = req.body;
      connection = await mysql.createConnection(keys.database);
      await connection.execute(
        `UPDATE Roles SET roleTypeId = ?, roleName = ?, roleDescription = ? WHERE roleId = ?`,
        [roleTypeId, roleName, roleDescription, roleId]
      );

      res.json({ success: true, message: "Role updated successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to update role" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
  async deleteRole(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const roleId = req.params.roleId;
      connection = await mysql.createConnection(keys.database);
      await connection.execute(`DELETE FROM Roles WHERE roleId = ?`, [roleId]);

      res.json({ success: true, message: "Role deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to delete role" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
  async addRoleType(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const { documentTypeId, roleTypeName, roleTypeDescription } = req.body;
      connection = await mysql.createConnection(keys.database);
      await connection.execute(
        `INSERT INTO RoleTypes (documentTypeId, roleTypeName, roleTypeDescription) VALUES (?, ?, ?)`,
        [documentTypeId, roleTypeName, roleTypeDescription]
      );

      res.json({ success: true, message: "Role type added successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to add role type" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
  async getRoleTypes(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const [result] = await connection.execute(`SELECT * FROM RoleTypes `);
      //@ts-ignore
      if (result.length)
        res.json({ success: true, message: "Success", data: result });
      else res.json({ success: true, message: "Success", data: {} });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed", data: {} });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
  async updateRoleType(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const roleTypeId = req.params.roleTypeId; // Extract the documentTypeId from the request parameters
      const { roleTypeName, roleTypeDescription, documentTypeId } = req.body;
      connection = await mysql.createConnection(keys.database);
      await connection.execute(
        `UPDATE RoleTypes SET roleTypeName = ?, roleTypeDescription = ?, documentTypeId = ? WHERE documentTypeId = ?`,
        [roleTypeName, roleTypeDescription, documentTypeId, roleTypeId]
      );

      res.json({ success: true, message: "Role type updated successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to update role type" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
  async deleteRoleType(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const roleTypeId = req.params.roleTypeId; // Extract the documentTypeId from the request parameters
      connection = await mysql.createConnection(keys.database);
      await connection.execute(
        `DELETE FROM RoleTypes WHERE documentTypeId = ?`,
        [roleTypeId]
      );

      res.json({ success: true, message: "Role type deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to delete role type" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
}

export const rolescontroller: RolesController = new RolesController();
