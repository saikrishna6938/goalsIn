import { Router } from "express";
import { taskTagDetailController } from "../controllers/TaskTagDetailsController";
import { withBasePath } from "../utils/routeHelpers";

class TaskTagDetailsRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.get(
      withBasePath("task/tagDetails/:taskTagTableId/:taskTagId"),
      taskTagDetailController.getTaskTagDetails
    );
    this.router.get(
      withBasePath("task/search-tags/:taskTagTableId"),
      taskTagDetailController.getSearchTagDetails
    );
  }
}

const taskTagDetailsRoute = new TaskTagDetailsRoute();
export default taskTagDetailsRoute.router;
