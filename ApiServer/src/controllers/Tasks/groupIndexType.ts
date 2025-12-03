import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../../keys";

/**
 * GET groupIndexType by taskId
 * Input: taskId (from req.params or req.body)
 * Output: { groupIndexType: number | null, groupTypeName?: string }
 */
export async function getGroupIndexTypeByTaskId(req: Request, res: Response) {
  let connection: mysql.Connection | null = null;

  try {
    const taskIdRaw = (req.params as any)?.taskId ?? (req.body as any)?.taskId;
    const taskId = Number(taskIdRaw);

    if (!Number.isFinite(taskId) || taskId <= 0) {
      res.status(400).json({ success: false, message: "Invalid taskId" });
      return;
    }

    connection = await mysql.createConnection(keys.database);

    // Tasks -> DocumentType -> DocumentGroup -> groupTypeId (+ name)
    const sql = `
      SELECT 
        dg.groupTypeId AS groupIndexType,
        dgt.groupTypeName
      FROM Tasks t
      LEFT JOIN DocumentType dt
        ON dt.documentTypeId = t.documentTypeId
      LEFT JOIN DocumentGroup dg
        ON dg.documentGroupId = dt.documentGroupId
      LEFT JOIN DocumentGroupType dgt
        ON dgt.groupTypeId = dg.groupTypeId
      WHERE t.taskId = ?
      LIMIT 1
    `;

    const [rows] = await connection.execute<any[]>(sql, [taskId]);

    if (!rows || rows.length === 0) {
      res.status(404).json({ success: false, message: "Task not found" });
      return;
    }

    const row = rows[0] as {
      groupIndexType: number | null;
      groupTypeName?: string;
    };

    res.status(200).json({
      success: true,
      data: {
        taskId,
        groupIndexType: row.groupIndexType ?? null,
        groupTypeName: row.groupTypeName ?? null,
      },
    });
  } catch (error: any) {
    console.error("getGroupIndexTypeByTaskId error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch groupIndexType",
      error: String(error?.message ?? error),
    });
  } finally {
    if (connection) await connection.end();
  }
}

export async function getIndexName(taskIdRaw) {
  let connection: mysql.Connection | null = null;

  try {
    const taskId = Number(taskIdRaw);

    if (!Number.isFinite(taskId) || taskId <= 0) {
      return null;
    }

    connection = await mysql.createConnection(keys.database);

    // Tasks -> DocumentType -> DocumentGroup -> groupTypeId (+ name)
    const sql = `
      SELECT 
        dg.groupTypeId AS groupIndexType,
        dgt.groupTypeName
      FROM Tasks t
      LEFT JOIN DocumentType dt
        ON dt.documentTypeId = t.documentTypeId
      LEFT JOIN DocumentGroup dg
        ON dg.documentGroupId = dt.documentGroupId
      LEFT JOIN DocumentGroupType dgt
        ON dgt.groupTypeId = dg.groupTypeId
      WHERE t.taskId = ?
      LIMIT 1
    `;

    const [rows] = await connection.execute<any[]>(sql, [taskId]);

    if (!rows || rows.length === 0) {
      return null;
    }

    const row = rows[0] as {
      groupIndexType: number | null;
      groupTypeName?: string;
    };
    return row.groupTypeName ?? null;
  } catch (error: any) {
    console.error("getGroupIndexTypeByTaskId error:", error);
    return null;
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Utility: Fetch both index type (numeric id) and name for a taskId
 * Returns: { indexType: number | null, name: string | null } | null on invalid id
 */
export async function getIndexTypeAndName(taskIdRaw: any): Promise<
  | { indexType: number | null; name: string | null }
  | null
> {
  let connection: mysql.Connection | null = null;
  try {
    const taskId = Number(taskIdRaw);
    if (!Number.isFinite(taskId) || taskId <= 0) return null;

    connection = await mysql.createConnection(keys.database);
    const sql = `
      SELECT 
        dg.groupTypeId   AS groupIndexType,
        dgt.groupTypeName AS groupTypeName
      FROM Tasks t
      LEFT JOIN DocumentType dt
        ON dt.documentTypeId = t.documentTypeId
      LEFT JOIN DocumentGroup dg
        ON dg.documentGroupId = dt.documentGroupId
      LEFT JOIN DocumentGroupType dgt
        ON dgt.groupTypeId = dg.groupTypeId
      WHERE t.taskId = ?
      LIMIT 1
    `;
    const [rows] = await connection.execute<any[]>(sql, [taskId]);
    if (!rows || rows.length === 0) return { indexType: null, name: null };
    const row = rows[0] as { groupIndexType: number | null; groupTypeName?: string };
    return {
      indexType: row.groupIndexType ?? null,
      name: row.groupTypeName ?? null,
    };
  } catch (error: any) {
    console.error("getIndexTypeAndName error:", error);
    return null;
  } finally {
    if (connection) await connection.end();
  }
}
