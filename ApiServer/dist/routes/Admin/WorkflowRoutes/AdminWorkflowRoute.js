"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AdminWorkflowController_1 = require("../../../controllers/Admin/Workflow/AdminWorkflowController");
const express_1 = require("express");
const keys_1 = __importDefault(require("../../../keys"));
const DocumentStatesController_1 = require("../../../controllers/Admin/Workflow/DocumentStatesController");
const DocumentStatesApproversController_1 = require("../../../controllers/Admin/Workflow/DocumentStatesApproversController");
const StateActionsController_1 = require("../../../controllers/Admin/Workflow/StateActionsController");
const ActionStateTransitionsController_1 = require("../../../controllers/Admin/Workflow/ActionStateTransitionsController");
class AdminWorkflowRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.workflowController = new AdminWorkflowController_1.AdminWorkflowController();
        this.workflowStatesController = new DocumentStatesController_1.DocumentStatesController();
        this.documentStateApproversController =
            new DocumentStatesApproversController_1.DocumentStatesApproversController();
        this.stateActionsController = new StateActionsController_1.StateActionsController();
        this.actionsTransistionsController = new ActionStateTransitionsController_1.ActionStateTransitionsController();
        this.config();
    }
    config() {
        // GET roles for a document type
        this.router.get(`${keys_1.default.basePath}administrator/workflows`, (req, res) => this.workflowController.getAllWorkflows(req, res));
        this.router.post(`${keys_1.default.basePath}administrator/workflows`, (req, res) => this.workflowController.createWorkflow(req, res));
        this.router.put(`${keys_1.default.basePath}administrator/workflows`, (req, res) => this.workflowController.updateWorkflow(req, res));
        this.router.delete(`${keys_1.default.basePath}administrator/workflows`, (req, res) => this.workflowController.deleteWorkflow(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/workflows/document-types/:workflowID`, (req, res) => this.workflowController.getWorkflowDocumentTypes(req, res));
        this.router.post(`${keys_1.default.basePath}administrator/workflows/document-types`, (req, res) => this.workflowController.addWorkflowDocumentTypes(req, res));
        this.router.delete(`${keys_1.default.basePath}administrator/workflows/document-types`, (req, res) => this.workflowController.deleteWorkflowDocumentTypes(req, res));
        //workflow document state routes
        this.router.get(`${keys_1.default.basePath}administrator/workflows/document-states/:workflowID`, (req, res) => this.workflowStatesController.getDocumentStatesByWorkflow(req, res));
        this.router.post(`${keys_1.default.basePath}administrator/workflows/document-states`, (req, res) => this.workflowStatesController.createDocumentState(req, res));
        this.router.put(`${keys_1.default.basePath}administrator/workflows/document-states`, (req, res) => this.workflowStatesController.updateDocumentState(req, res));
        this.router.delete(`${keys_1.default.basePath}administrator/workflows/document-states`, (req, res) => this.workflowStatesController.deleteDocumentState(req, res));
        this.router.put(`${keys_1.default.basePath}administrator/workflows/document-states/reorder`, (req, res) => this.workflowStatesController.reorderDocumentStates(req, res));
        //Document States Approver Details
        this.router.get(`${keys_1.default.basePath}administrator/workflows/document-states/approvers/:documentStateId`, (req, res) => this.documentStateApproversController.getApproversByDocumentState(req, res));
        this.router.post(`${keys_1.default.basePath}administrator/workflows/document-states/approvers`, (req, res) => this.documentStateApproversController.addApproversToDocumentState(req, res));
        this.router.delete(`${keys_1.default.basePath}administrator/workflows/document-states/approvers`, (req, res) => this.documentStateApproversController.deleteApproversFromDocumentState(req, res));
        //Document State Actions Details
        this.router.get(`${keys_1.default.basePath}administrator/workflows/document-states/actions/:documentStateId`, (req, res) => this.stateActionsController.getActionsByDocumentState(req, res));
        this.router.post(`${keys_1.default.basePath}administrator/workflows/document-states/actions`, (req, res) => this.stateActionsController.addAction(req, res));
        this.router.put(`${keys_1.default.basePath}administrator/workflows/document-states/actions`, (req, res) => this.stateActionsController.updateAction(req, res));
        this.router.delete(`${keys_1.default.basePath}administrator/workflows/document-states/actions`, (req, res) => this.stateActionsController.deleteAction(req, res));
        //Actions Transitions
        this.router.get(`${keys_1.default.basePath}administrator/workflows/actions/transitions/:actionId`, (req, res) => this.actionsTransistionsController.getTransitionsByAction(req, res));
        this.router.post(`${keys_1.default.basePath}administrator/workflows/actions/transitions`, (req, res) => this.actionsTransistionsController.addTransition(req, res));
        this.router.put(`${keys_1.default.basePath}administrator/workflows/actions/transitions`, (req, res) => this.actionsTransistionsController.updateTransition(req, res));
        this.router.delete(`${keys_1.default.basePath}administrator/workflows/actions/transitions`, (req, res) => this.actionsTransistionsController.deleteTransition(req, res));
    }
}
const workflowRoutes = new AdminWorkflowRoutes();
exports.default = workflowRoutes.router;
//# sourceMappingURL=AdminWorkflowRoute.js.map