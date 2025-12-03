"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GlobalController_1 = require("../controllers/GlobalController");
const routeHelpers_1 = require("../utils/routeHelpers");
class GlobalRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post((0, routeHelpers_1.withBasePath)("check-user-document-permission"), GlobalController_1.globalController.checkUserDocumentPermission);
        this.router.post((0, routeHelpers_1.withBasePath)("check-user-submitted-document"), GlobalController_1.globalController.checkUserSubmittedDocument);
        this.router.get((0, routeHelpers_1.withBasePath)("clone-profile/:userId"), GlobalController_1.globalController.cloneProfileObject);
    }
}
const globalRoute = new GlobalRoute();
exports.default = globalRoute.router;
