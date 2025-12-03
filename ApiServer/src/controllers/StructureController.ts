import { Request, Response } from "express";
import { Entity, createEntityQuery } from "../modules/Entity";
import * as mysql from "mysql2/promise";
import keys from "../keys";
class StructureController {
  async addEntity(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const entity: Entity = req.body;
      connection = await mysql.createConnection(keys.database);
      const [result] = await connection.execute(
        `INSERT INTO Structure ( entityName, entityLocation, entityPhone, entityDescription,userRoleNameId,RefCode)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          entity.entityName,
          entity.entityLocation,
          entity.entityPhone,
          entity.entityDescription,
          entity.userRoleNameId,
          entity.RefCode,
        ]
      );
      res.json({ success: true, message: "Entity details added successfully" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to add entity details" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }
  async getEntities(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const [result] = await connection.execute(`SELECT * FROM Structure`);
      res.json({
        success: true,
        message: "Success",
        entities: result,
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to get entities" });
    } finally {
      if (connection) {
        try { await connection.end(); } catch {}
      }
    }
  }
  async updateEntity(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const entityId = req.params.entityId;
      const updatedEntity: Entity = req.body;
      connection = await mysql.createConnection(keys.database);
      let query = `UPDATE Structure SET `;
      query = createEntityQuery(query, req.body);
      query += ` WHERE entityId=${entityId}`;
      const [result] = await connection.execute(query);
      res.json({
        success: true,
        message: "Entity details updated successfully",
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to update entity details" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
  async getEntity(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const entityId = req.params.entityId;
      connection = await mysql.createConnection(keys.database);
      const [result] = await connection.execute(
        `SELECT * FROM Structure WHERE entityId = ?`,
        [entityId]
      );
      //@ts-ignore
      if (result.length > 0)
        res.json({ success: true, message: "Success", entity: result[0] });
      else
        res.json({ success: true, message: "No Entities found", entity: {} });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to delete entity" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
  async deleteEntity(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const entityId = req.params.entityId;
      connection = await mysql.createConnection(keys.database);
      const [result] = await connection.execute(
        `DELETE FROM Structure WHERE entityId = ?`,
        [entityId]
      );
      res.json({ success: true, message: "Entity deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to delete entity" });
    } finally {
      if (connection) { try { await connection.end(); } catch {} }
    }
  }
}

export const structureController: StructureController =
  new StructureController();
