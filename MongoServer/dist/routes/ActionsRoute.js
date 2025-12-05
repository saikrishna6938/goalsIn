"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ActionsController_1 = require("../controllers/ActionsController");
const routeHelpers_1 = require("../utils/routeHelpers");
class ActionsRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post((0, routeHelpers_1.withBasePath)("get-document-actions"), ActionsController_1.actionsController.geDocumentActions);
        this.router.post((0, routeHelpers_1.withBasePath)("get-document-state"), ActionsController_1.actionsController.getDocumentStateName);
        this.router.post((0, routeHelpers_1.withBasePath)("update-action"), ActionsController_1.actionsController.updateDocumentStateByAction);
        this.router.post((0, routeHelpers_1.withBasePath)("add-task-workflow-action"), ActionsController_1.actionsController.insertTaskWorkflow);
        this.router.get((0, routeHelpers_1.withBasePath)("get-task-workflow/:taskId"), ActionsController_1.actionsController.getTaskWorkflowByTaskId);
    }
}
const actionsRoute = new ActionsRoute();
exports.default = actionsRoute.router;
