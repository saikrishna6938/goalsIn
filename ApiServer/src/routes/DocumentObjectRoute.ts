import { Router } from "express";
import keys from "../keys";
import { documentObjectController } from "../controllers/DocumentObjectController";

class DocumentObjectRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    // POST /api/document/object-by-task
    this.router.post(
      `${keys.basePath}document/object-by-task`,
      (req, res) => documentObjectController.getByTaskId(req, res)
    );
  }
}

const route = new DocumentObjectRoute();
export default route.router;

