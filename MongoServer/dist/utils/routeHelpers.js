"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withBasePath = void 0;
const env_1 = require("../config/env");
const normalizedBase = env_1.appConfig.apiBasePath.endsWith("/")
    ? env_1.appConfig.apiBasePath
    : `${env_1.appConfig.apiBasePath}/`;
const withBasePath = (segment = "") => {
    const trimmed = segment.replace(/^\/+/, "");
    return `${normalizedBase}${trimmed}`;
};
exports.withBasePath = withBasePath;
