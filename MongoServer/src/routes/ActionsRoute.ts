import { Router } from "express";
import { actionsController } from "../controllers/ActionsController";
import { withBasePath } from "../utils/routeHelpers";

class ActionsRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.post(withBasePath("get-document-actions"), actionsController.geDocumentActions);
    this.router.post(withBasePath("get-document-state"), actionsController.getDocumentStateName);
    this.router.post(withBasePath("update-action"), actionsController.updateDocumentStateByAction);
    this.router.post(withBasePath("add-task-workflow-action"), actionsController.insertTaskWorkflow);
    this.router.get(withBasePath("get-task-workflow/:taskId"), actionsController.getTaskWorkflowByTaskId);
  }
}

const actionsRoute = new ActionsRoute();
export default actionsRoute.router;
