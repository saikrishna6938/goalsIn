"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAccessRoute = void 0;
const jwt_1 = require("../utils/jwt");
const extractToken = (req) => {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (typeof authHeader === "string" && authHeader.length) {
        return authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : authHeader.trim();
    }
    const queryToken = typeof req.query.token === "string" ? req.query.token : undefined;
    if (queryToken)
        return queryToken;
    if (req.cookies) {
        const cookieToken = req.cookies["accessToken"] ||
            req.cookies["access_token"] ||
            req.cookies["jwt"] ||
            req.cookies["token"];
        if (typeof cookieToken === "string" && cookieToken.length) {
            return cookieToken;
        }
    }
    return undefined;
};
const checkAccessRoute = (req, res, next) => {
    if (req.method === "OPTIONS") {
        return next();
    }
    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({ error: "Access token is missing" });
    }
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        req.authUser = payload;
        return next();
    }
    catch (error) {
        console.error("checkAccessRoute error", error);
        return res.status(401).json({ error: "Invalid access token" });
    }
};
exports.checkAccessRoute = checkAccessRoute;
