import { Router } from "express";
import { withBasePath } from "../../../utils/routeHelpers";
import { AdminWorkflowController } from "../../../controllers/Admin/Workflow/AdminWorkflowController";
import { DocumentStatesController } from "../../../controllers/Admin/Workflow/DocumentStatesController";
import { DocumentStatesApproversController } from "../../../controllers/Admin/Workflow/DocumentStatesApproversController";
import { StateActionsController } from "../../../controllers/Admin/Workflow/StateActionsController";
import { ActionStateTransitionsController } from "../../../controllers/Admin/Workflow/ActionStateTransitionsController";

class AdminWorkflowRoutes {
  public router: Router = Router();
  private workflowController: AdminWorkflowController;
  private workflowStatesController: DocumentStatesController;
  private documentStateApproversController: DocumentStatesApproversController;
  private stateActionsController: StateActionsController;
  private actionsTransitionsController: ActionStateTransitionsController;

  constructor() {
    this.workflowController = new AdminWorkflowController();
    this.workflowStatesController = new DocumentStatesController();
    this.documentStateApproversController = new DocumentStatesApproversController();
    this.stateActionsController = new StateActionsController();
    this.actionsTransitionsController = new ActionStateTransitionsController();
    this.config();
  }

  private config() {
    this.router.get(withBasePath("administrator/workflows"), (req, res) =>
      this.workflowController.getAllWorkflows(req, res)
    );
    this.router.post(withBasePath("administrator/workflows"), (req, res) =>
      this.workflowController.createWorkflow(req, res)
    );
    this.router.put(withBasePath("administrator/workflows"), (req, res) =>
      this.workflowController.updateWorkflow(req, res)
    );
    this.router.delete(withBasePath("administrator/workflows"), (req, res) =>
      this.workflowController.deleteWorkflow(req, res)
    );
    this.router.get(withBasePath("administrator/workflows/document-types/:workflowID"), (req, res) =>
      this.workflowController.getWorkflowDocumentTypes(req, res)
    );
    this.router.post(withBasePath("administrator/workflows/document-types"), (req, res) =>
      this.workflowController.addWorkflowDocumentTypes(req, res)
    );
    this.router.delete(withBasePath("administrator/workflows/document-types"), (req, res) =>
      this.workflowController.deleteWorkflowDocumentTypes(req, res)
    );

    this.router.get(withBasePath("administrator/workflows/document-states/:workflowID"), (req, res) =>
      this.workflowStatesController.getDocumentStatesByWorkflow(req, res)
    );
    this.router.post(withBasePath("administrator/workflows/document-states"), (req, res) =>
      this.workflowStatesController.createDocumentState(req, res)
    );
    this.router.put(withBasePath("administrator/workflows/document-states"), (req, res) =>
      this.workflowStatesController.updateDocumentState(req, res)
    );
    this.router.delete(withBasePath("administrator/workflows/document-states"), (req, res) =>
      this.workflowStatesController.deleteDocumentState(req, res)
    );
    this.router.put(withBasePath("administrator/workflows/document-states/reorder"), (req, res) =>
      this.workflowStatesController.reorderDocumentStates(req, res)
    );

    this.router.get(withBasePath("administrator/workflows/document-states/approvers/:documentStateId"), (req, res) =>
      this.documentStateApproversController.getApproversByDocumentState(req, res)
    );
    this.router.post(withBasePath("administrator/workflows/document-states/approvers"), (req, res) =>
      this.documentStateApproversController.addApproversToDocumentState(req, res)
    );
    this.router.delete(withBasePath("administrator/workflows/document-states/approvers"), (req, res) =>
      this.documentStateApproversController.deleteApproversFromDocumentState(req, res)
    );

    this.router.get(withBasePath("administrator/workflows/document-states/actions/:documentStateId"), (req, res) =>
      this.stateActionsController.getActionsByDocumentState(req, res)
    );
    this.router.post(withBasePath("administrator/workflows/document-states/actions"), (req, res) =>
      this.stateActionsController.addAction(req, res)
    );
    this.router.put(withBasePath("administrator/workflows/document-states/actions"), (req, res) =>
      this.stateActionsController.updateAction(req, res)
    );
    this.router.delete(withBasePath("administrator/workflows/document-states/actions"), (req, res) =>
      this.stateActionsController.deleteAction(req, res)
    );

    this.router.get(withBasePath("administrator/workflows/actions/transitions/:actionId"), (req, res) =>
      this.actionsTransitionsController.getTransitionsByAction(req, res)
    );
    this.router.post(withBasePath("administrator/workflows/actions/transitions"), (req, res) =>
      this.actionsTransitionsController.addTransition(req, res)
    );
    this.router.put(withBasePath("administrator/workflows/actions/transitions"), (req, res) =>
      this.actionsTransitionsController.updateTransition(req, res)
    );
    this.router.delete(withBasePath("administrator/workflows/actions/transitions"), (req, res) =>
      this.actionsTransitionsController.deleteTransition(req, res)
    );
  }
}

const adminWorkflowRoutes = new AdminWorkflowRoutes();
export default adminWorkflowRoutes.router;
