import { Router } from "express";
import { controCenterController } from "../controllers/ControlCenterController";
import { withBasePath } from "../utils/routeHelpers";

class ControlCenterRoutes {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.post(withBasePath("outstainding-tasks"), controCenterController.GetEntityTasks);
  }
}

const controlCenterRoutes = new ControlCenterRoutes();
export default controlCenterRoutes.router;
