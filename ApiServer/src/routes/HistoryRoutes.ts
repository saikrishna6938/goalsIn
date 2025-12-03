import { Router } from "express";
import keys from "../keys";
import { historyController } from "../controllers/HistoryController";

class HistoryRoutes {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    this.router.post(
      `${keys.basePath}history/add`,
      historyController.addHistory
    );
    this.router.get(
      `${keys.basePath}history/task/:taskId`,
      historyController.getHistoryByTaskId
    );
  }
}

const ir = new HistoryRoutes();
export default ir.router;
