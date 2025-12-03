"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAccessRoute = void 0;
const SessionManager_1 = __importStar(require("../session/SessionManager"));
// Create the middleware function to check the access token
const checkAccessRoute = (req, res, next) => {
    const accessToken = req.headers["authorization"];
    if (!accessToken) {
        return res.status(401).json({ error: "Access token is missing" });
    }
    const check = SessionManager_1.default.checkAccessToken(accessToken);
    if (check == SessionManager_1.ValidSession.TokenNotValid) {
        return res.status(401).json({ error: "Invalid access token" });
    }
    // If the token is valid, you can proceed to the next middleware or route
    next();
};
exports.checkAccessRoute = checkAccessRoute;
//# sourceMappingURL=CheckAccessRoute.js.map