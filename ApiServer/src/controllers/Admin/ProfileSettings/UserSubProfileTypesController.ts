import { Request, Response } from "express";
import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import keys from "../../../keys";

// Local pool for this controller (pattern used in nearby controllers)
const pool = mysql.createPool(keys.database);

export interface UserSubProfileType extends RowDataPacket {
  userSubProfileId: number;
  subProfileId: number;
  userId: number;
}

export class AdminUserSubProfileTypesController {
  constructor() {}

  // Assign subProfileIds to a user or users to a subProfile (merge; do not remove existing)
  async assignUserSubProfiles(req: Request, res: Response): Promise<void> {
    const body = req.body || {};
    const userIdRaw = body.userId;
    const subProfileIdsRaw = body.subProfileIds;
    const subProfileIdRaw = body.subProfileId;
    const userIdsRaw = body.userIds ?? body.ueserIds; // be tolerant of typo

    const hasUserToSubProfiles =
      Number.isFinite(Number(userIdRaw)) && Array.isArray(subProfileIdsRaw);
    const hasSubProfileToUsers =
      Number.isFinite(Number(subProfileIdRaw)) && Array.isArray(userIdsRaw);

    if (!hasUserToSubProfiles && !hasSubProfileToUsers) {
      res.status(400).json({
        message:
          "Provide either { userId, subProfileIds[] } or { subProfileId, userIds[] }",
        status: false,
      });
      return;
    }

    let conn: mysql.PoolConnection | undefined;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      if (hasUserToSubProfiles) {
        const userId = Number(userIdRaw);
        const cleanedSubProfileIds = (subProfileIdsRaw as any[])
          .map((v) => Number(v))
          .filter((v) => Number.isFinite(v));

        // Fetch existing subProfileIds for this user to avoid duplicates
        const [existingRows] = await conn.query<RowDataPacket[]>(
          `SELECT subProfileId FROM UserSubProfileTypes WHERE userId = ?`,
          [userId]
        );
        const existingSet = new Set<number>(
          existingRows.map((r: any) => Number(r.subProfileId))
        );

        const toAdd = cleanedSubProfileIds.filter((sid) => !existingSet.has(sid));

        let inserted = 0;
        if (toAdd.length > 0) {
          const values: any[] = [];
          const placeholders: string[] = [];
          for (const sid of toAdd) {
            placeholders.push("(?, ?)");
            values.push(sid, userId);
          }
          const sql = `INSERT INTO UserSubProfileTypes (subProfileId, userId) VALUES ${placeholders.join(",")}`;
          const [result] = await conn.execute<ResultSetHeader>(sql, values);
          inserted = result.affectedRows || 0;
        }

        await conn.commit();
        res.status(200).json({
          message: "Merged assignments for user (existing kept)",
          userId,
          addedSubProfileIds: toAdd,
          alreadyAssigned: cleanedSubProfileIds.filter((sid) => existingSet.has(sid)),
          inserted,
          mode: "user-to-subprofiles",
          status: true,
        });
        return;
      }

      if (hasSubProfileToUsers) {
        const subProfileId = Number(subProfileIdRaw);
        const cleanedUserIds = (userIdsRaw as any[])
          .map((v) => Number(v))
          .filter((v) => Number.isFinite(v));

        // Fetch existing users for this subProfile to avoid duplicates
        const [existingRows] = await conn.query<RowDataPacket[]>(
          `SELECT userId FROM UserSubProfileTypes WHERE subProfileId = ?`,
          [subProfileId]
        );
        const existingSet = new Set<number>(
          existingRows.map((r: any) => Number(r.userId))
        );

        const toAdd = cleanedUserIds.filter((uid) => !existingSet.has(uid));

        let inserted = 0;
        if (toAdd.length > 0) {
          const values: any[] = [];
          const placeholders: string[] = [];
          for (const uid of toAdd) {
            placeholders.push("(?, ?)");
            values.push(subProfileId, uid);
          }
          const sql = `INSERT INTO UserSubProfileTypes (subProfileId, userId) VALUES ${placeholders.join(",")}`;
          const [result] = await conn.execute<ResultSetHeader>(sql, values);
          inserted = result.affectedRows || 0;
        }

        await conn.commit();
        res.status(200).json({
          message: "Merged assignments for subProfile (existing kept)",
          subProfileId,
          addedUserIds: toAdd,
          alreadyAssigned: cleanedUserIds.filter((uid) => existingSet.has(uid)),
          inserted,
          mode: "subprofile-to-users",
          status: true,
        });
        return;
      }
    } catch (error) {
      try { await conn?.rollback(); } catch {}
      res.status(500).json({
        message: "Failed to update assignments",
        error,
        status: false,
      });
    } finally {
      conn?.release();
    }
  }

  // Unassign specific mappings without touching others
  async unassignUserSubProfiles(req: Request, res: Response): Promise<void> {
    const body = req.body || {};
    const userIdRaw = body.userId;
    const subProfileIdsRaw = body.subProfileIds;
    const subProfileIdRaw = body.subProfileId;
    const userIdsRaw = body.userIds ?? body.ueserIds; // be tolerant of typo

    const hasUserToSubProfiles =
      Number.isFinite(Number(userIdRaw)) && Array.isArray(subProfileIdsRaw);
    const hasSubProfileToUsers =
      Number.isFinite(Number(subProfileIdRaw)) && Array.isArray(userIdsRaw);

    if (!hasUserToSubProfiles && !hasSubProfileToUsers) {
      res.status(400).json({
        message:
          "Provide either { userId, subProfileIds[] } or { subProfileId, userIds[] }",
        status: false,
      });
      return;
    }

    let conn: mysql.PoolConnection | undefined;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      if (hasUserToSubProfiles) {
        const userId = Number(userIdRaw);
        const cleanedSubProfileIds = (subProfileIdsRaw as any[])
          .map((v) => Number(v))
          .filter((v) => Number.isFinite(v));

        if (cleanedSubProfileIds.length === 0) {
          await conn.commit();
          res.status(200).json({
            message: "Nothing to unassign (no subProfileIds provided)",
            userId,
            removedCount: 0,
            removedSubProfileIds: [],
            mode: "user-to-subprofiles",
            status: true,
          });
          return;
        }

        const placeholders = cleanedSubProfileIds.map(() => "?").join(",");
        const sql = `DELETE FROM UserSubProfileTypes WHERE userId = ? AND subProfileId IN (${placeholders})`;
        const [result] = await conn.execute<ResultSetHeader>(sql, [
          userId,
          ...cleanedSubProfileIds,
        ]);

        await conn.commit();
        res.status(200).json({
          message: "Unassigned selected sub-profiles from user",
          userId,
          removedSubProfileIds: cleanedSubProfileIds,
          removedCount: result.affectedRows || 0,
          mode: "user-to-subprofiles",
          status: true,
        });
        return;
      }

      if (hasSubProfileToUsers) {
        const subProfileId = Number(subProfileIdRaw);
        const cleanedUserIds = (userIdsRaw as any[])
          .map((v) => Number(v))
          .filter((v) => Number.isFinite(v));

        if (cleanedUserIds.length === 0) {
          await conn.commit();
          res.status(200).json({
            message: "Nothing to unassign (no userIds provided)",
            subProfileId,
            removedCount: 0,
            removedUserIds: [],
            mode: "subprofile-to-users",
            status: true,
          });
          return;
        }

        const placeholders = cleanedUserIds.map(() => "?").join(",");
        const sql = `DELETE FROM UserSubProfileTypes WHERE subProfileId = ? AND userId IN (${placeholders})`;
        const [result] = await conn.execute<ResultSetHeader>(sql, [
          subProfileId,
          ...cleanedUserIds,
        ]);

        await conn.commit();
        res.status(200).json({
          message: "Unassigned selected users from sub-profile",
          subProfileId,
          removedUserIds: cleanedUserIds,
          removedCount: result.affectedRows || 0,
          mode: "subprofile-to-users",
          status: true,
        });
        return;
      }
    } catch (error) {
      try { await conn?.rollback(); } catch {}
      res.status(500).json({
        message: "Failed to unassign",
        error,
        status: false,
      });
    } finally {
      conn?.release();
    }
  }

  // Fetch current subProfileIds for a user
  async getUserSubProfiles(req: Request, res: Response): Promise<void> {
    const userId = Number(req.params.userId);
    if (!Number.isFinite(userId)) {
      res.status(400).json({ message: "Invalid userId", status: false });
      return;
    }
    try {
      const [rows] = await pool.query<UserSubProfileType[]>(
        `SELECT subProfileId FROM UserSubProfileTypes WHERE userId = ? ORDER BY subProfileId ASC`,
        [userId]
      );
      const subProfileIds = rows.map((r) => r.subProfileId);
      res.status(200).json({ userId, subProfileIds, count: subProfileIds.length, status: true });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch user sub-profiles",
        error,
        status: false,
      });
    }
  }

  // Fetch users for a given subProfileId
  async getUsersBySubProfileId(req: Request, res: Response): Promise<void> {
    const subProfileId = Number(req.params.subProfileId);
    if (!Number.isFinite(subProfileId)) {
      res.status(400).json({ message: "Invalid subProfileId", status: false });
      return;
    }
    try {
      interface UserBasic extends RowDataPacket {
        userId: number;
        userFirstName: string;
        userLastName: string;
      }
      const [rows] = await pool.query<UserBasic[]>(
        `SELECT u.userId, u.userFirstName, u.userLastName
         FROM Users u
         INNER JOIN UserSubProfileTypes uspt ON uspt.userId = u.userId
         WHERE uspt.subProfileId = ?
         ORDER BY u.userFirstName ASC, u.userLastName ASC`,
        [subProfileId]
      );
      res.status(200).json({ subProfileId, users: rows, count: rows.length, status: true });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch users by subProfileId",
        error,
        status: false,
      });
    }
  }
}

export default AdminUserSubProfileTypesController;
