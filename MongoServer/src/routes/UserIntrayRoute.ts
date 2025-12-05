import { Router } from "express";
import { userIntrayController } from "../controllers/UserIntrayController";
import { withBasePath } from "../utils/routeHelpers";

class UserIntrayRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.get(withBasePath("user/intray/:userId"), userIntrayController.getUserIntrayDetails);
  }
}

const userIntrayRoute = new UserIntrayRoute();
export default userIntrayRoute.router;
