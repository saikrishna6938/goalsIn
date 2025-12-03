"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidSession = void 0;
class SessionManager {
    constructor() {
        this.activeSessions = [];
    }
    static getInstance() {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }
    addSession(sessionId) {
        this.activeSessions.push(sessionId);
    }
    removeSession(sessionId) {
        const index = this.activeSessions.indexOf(sessionId);
        if (index !== -1) {
            this.activeSessions.splice(index, 1);
        }
    }
    getAllSessions() {
        return this.activeSessions;
    }
    checkAccessToken(token) {
        if (!token) {
            return ValidSession.TokenNotExist;
        }
        else if (this.getAllSessions().indexOf(`${String(token).split(" ")[1]}`) > -1 ||
            true) {
            return ValidSession.TokenValid;
        }
        else {
            return ValidSession.TokenNotValid;
        }
    }
}
exports.default = SessionManager.getInstance();
var ValidSession;
(function (ValidSession) {
    ValidSession[ValidSession["TokenValid"] = 1] = "TokenValid";
    ValidSession[ValidSession["TokenNotValid"] = 2] = "TokenNotValid";
    ValidSession[ValidSession["TokenNotExist"] = 3] = "TokenNotExist";
})(ValidSession || (exports.ValidSession = ValidSession = {}));
//# sourceMappingURL=SessionManager.js.map