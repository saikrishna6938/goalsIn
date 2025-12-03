import * as mysql from "mysql2/promise";
import keys from "./keys";

// Prefer a pooled, lazy connection to avoid long-lived single connections.
// Consumers should acquire connections as needed or use pool.query/execute.
export const pool = mysql.createPool(keys.database);

export default pool;
