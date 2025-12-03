import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: process.env.MONGO_ENV_FILE || path.resolve(process.cwd(), ".env") });

const firstDefined = (...values: Array<string | undefined>): string | undefined =>
  values.find((value) => typeof value === "string" && value.length > 0);

// Escape password characters that would otherwise make the URI invalid (e.g. # or whitespace).
const sanitizeMongoUri = (uri: string | undefined): string | undefined => {
  if (!uri) return uri;
  const schemeEnd = uri.indexOf("://");
  if (schemeEnd === -1) {
    return uri;
  }
  const credentialsEnd = uri.indexOf("@", schemeEnd + 3);
  if (credentialsEnd === -1) {
    return uri;
  }
  const credentials = uri.slice(schemeEnd + 3, credentialsEnd);
  const separator = credentials.indexOf(":");
  if (separator === -1) {
    return uri;
  }
  const username = credentials.slice(0, separator);
  const password = credentials.slice(separator + 1);
  if (!password || !/[#/@\s]/.test(password)) {
    return uri;
  }
  const encodedPassword = encodeURIComponent(password);
  return `${uri.slice(0, schemeEnd + 3)}${username}:${encodedPassword}${uri.slice(credentialsEnd)}`;
};

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const mongoUri = sanitizeMongoUri(firstDefined(process.env.MONGO_URI, process.env.MONGODB_URI));

export const appConfig = {
  mongoUri: mongoUri || "mongodb://127.0.0.1:27017",
  database: firstDefined(process.env.MONGO_DB, process.env.MONGODB_DB) || "jotbox",
  port: parseNumber(process.env.PORT, 5400),
  sqlFile: process.env.SQL_FILE || path.resolve(process.cwd(), "..", "jotbox.sql"),
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  apiBasePath: process.env.API_BASE_PATH || "/api/",
};
