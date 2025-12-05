import { Router } from "express";
import { historyController } from "../controllers/HistoryController";
import { withBasePath } from "../utils/routeHelpers";

class HistoryRoutes {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.post(withBasePath("history/add"), historyController.addHistory);
    this.router.get(withBasePath("history/task/:taskId"), historyController.getHistoryByTaskId);
  }
}

const historyRoutes = new HistoryRoutes();
export default historyRoutes.router;
