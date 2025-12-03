import * as mysql from "mysql2/promise";
import keys from "../keys";
import { emitToSocketIds } from "../socket";

export async function notifyUsersByDb(
  userIds: Array<string | number>,
  event: string,
  payload: any,
  connection?: mysql.Connection
) {
  if (!userIds?.length) return;
  const ids = Array.from(new Set(userIds.map((u) => Number(u)).filter(Number.isFinite)));
  if (!ids.length) return;
  let ownConn: mysql.Connection | null = null;
  try {
    const conn = connection || (ownConn = await mysql.createConnection(keys.database));
    const placeholders = ids.map(() => "?").join(",");
    const [rows] = await conn.execute(
      `SELECT userId, socketId FROM Users WHERE userId IN (${placeholders}) AND socketId IS NOT NULL AND socketId != ''`,
      ids as any
    );
    //@ts-ignore
    const socketIds = rows.map((r) => r.socketId).filter(Boolean);
    emitToSocketIds(socketIds, event, payload);
  } catch (e) {
    console.warn("notifyUsersByDb failed:", (e as any)?.message || e);
  } finally {
    if (ownConn) {
      try { await ownConn.end(); } catch {}
    }
  }
}

