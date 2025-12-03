import { Router } from "express";
import { indexcontroller } from "../controllers/IndexController";
import keys from "../keys";

class DashboarRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    this.router.post(
      `${keys.basePath}dashboard-applications`,
      indexcontroller.test
    );
  }
}

const ir = new DashboarRoute();
export default ir.router;
