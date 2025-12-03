import { createPool, Pool } from "mysql2";

export const pool: Pool = createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "jotdesk",
  connectionLimit: 10,
});

export const frontEndPath = "http://gradwalk.us/";
