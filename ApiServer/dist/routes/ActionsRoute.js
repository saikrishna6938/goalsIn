"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const ActionsController_1 = require("../controllers/ActionsController");
class ActionRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post(`${keys_1.default.basePath}get-document-actions`, ActionsController_1.actionsController.geDocumentActions);
        this.router.post(`${keys_1.default.basePath}get-document-state`, ActionsController_1.actionsController.getDocumentStateName);
        this.router.post(`${keys_1.default.basePath}update-action`, ActionsController_1.actionsController.updateDocumentStateByAction);
        this.router.post(`${keys_1.default.basePath}add-task-workflow-action`, ActionsController_1.actionsController.insertTaskWorkflow);
        this.router.get(`${keys_1.default.basePath}get-task-workflow/:taskId`, ActionsController_1.actionsController.getTaskWorkflowByTaskId);
    }
}
const ir = new ActionRoute();
exports.default = ir.router;
//# sourceMappingURL=ActionsRoute.js.map