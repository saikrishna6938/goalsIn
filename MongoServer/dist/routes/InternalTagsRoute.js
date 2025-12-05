"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const InternalTagsController_1 = require("../controllers/InternalTagsController");
const routeHelpers_1 = require("../utils/routeHelpers");
class InternalTagsRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.put((0, routeHelpers_1.withBasePath)("update-internal-tag/:tableId/:id"), InternalTagsController_1.internalTagsController.updateRecord);
        this.router.post((0, routeHelpers_1.withBasePath)("update-internal-tag/:tableId/:id"), InternalTagsController_1.internalTagsController.createRecord);
    }
}
const internalTagsRoute = new InternalTagsRoute();
exports.default = internalTagsRoute.router;
