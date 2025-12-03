import { Router } from "express";
import { indexcontroller } from "../controllers/IndexController";
import keys from "../keys";
import { taskTagDetailController } from "../controllers/TaskTagDetails";

class TaskTagDetailsRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    this.router.get(
      `${keys.basePath}task/tagDetails/:taskTagTableId/:taskTagId`,
      taskTagDetailController.getTaskTagDetails
    );
    this.router.get(
      `${keys.basePath}task/search-tags/:taskTagTableId`,
      taskTagDetailController.getSearchTagDetails
    );
  }
}

const ir = new TaskTagDetailsRoute();
export default ir.router;
