import { Router } from "express";
import keys from "../keys";
import { actionsController } from "../controllers/ActionsController";

class ActionRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    this.router.post(
      `${keys.basePath}get-document-actions`,
      actionsController.geDocumentActions
    );
    this.router.post(
      `${keys.basePath}get-document-state`,
      actionsController.getDocumentStateName
    );
    this.router.post(
      `${keys.basePath}update-action`,
      actionsController.updateDocumentStateByAction
    );
    this.router.post(
      `${keys.basePath}add-task-workflow-action`,
      actionsController.insertTaskWorkflow
    );
    this.router.get(
      `${keys.basePath}get-task-workflow/:taskId`,
      actionsController.getTaskWorkflowByTaskId
    );
  }
}

const ir = new ActionRoute();
export default ir.router;
