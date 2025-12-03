"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const GlobalController_1 = require("../controllers/GlobalController");
class globalRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post(`${keys_1.default.basePath}check-user-document-permission`, GlobalController_1.globalController.checkUserDocumentPermission);
        this.router.post(`${keys_1.default.basePath}check-user-submitted-document`, GlobalController_1.globalController.checkUserSubmittedDocument);
        this.router.get(`${keys_1.default.basePath}clone-profile/:userId`, GlobalController_1.globalController.cloneProfileObject);
    }
}
const ir = new globalRoute();
exports.default = ir.router;
//# sourceMappingURL=GlobalRoutes.js.map