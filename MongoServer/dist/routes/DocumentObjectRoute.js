"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DocumentObjectController_1 = require("../controllers/DocumentObjectController");
const routeHelpers_1 = require("../utils/routeHelpers");
class DocumentObjectRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post((0, routeHelpers_1.withBasePath)("document/object-by-task"), (req, res) => DocumentObjectController_1.documentObjectController.getByTaskId(req, res));
    }
}
const documentObjectRoute = new DocumentObjectRoute();
exports.default = documentObjectRoute.router;
