import { Router } from "express";
import { mainController } from "../controllers/MainController";
import { withBasePath } from "../utils/routeHelpers";

class MainRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.post(withBasePath("user-details"), mainController.getUser);
  }
}

const mainRoute = new MainRoute();
export default mainRoute.router;
