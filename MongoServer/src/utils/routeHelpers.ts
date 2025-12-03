import { appConfig } from "../config/env";

const normalizedBase = appConfig.apiBasePath.endsWith("/")
  ? appConfig.apiBasePath
  : `${appConfig.apiBasePath}/`;

export const withBasePath = (segment = "") => {
  const trimmed = segment.replace(/^\/+/, "");
  return `${normalizedBase}${trimmed}`;
};
