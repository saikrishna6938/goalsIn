import { Router } from "express";
import keys from "../keys";
import { userIntrayController } from "../controllers/UserIntrayController";

class UserIntrayRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    this.router.get(
      `${keys.basePath}user/intray/:userId`,
      userIntrayController.getUserIntrayDetails
    );
  }
}

const ir = new UserIntrayRoute();
export default ir.router;
