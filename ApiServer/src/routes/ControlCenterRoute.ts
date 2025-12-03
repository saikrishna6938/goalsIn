import { Router } from "express";
import { indexcontroller } from "../controllers/IndexController";
import keys from "../keys";
import { controCenterController } from "../controllers/ControlCenterController";

class ControlCenterRoutes {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    this.router.post(
      `${keys.basePath}outstainding-tasks`,
      controCenterController.GetEntityTasks
    );
  }
}

const ir = new ControlCenterRoutes();
export default ir.router;
