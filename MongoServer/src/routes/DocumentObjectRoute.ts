import { Router } from "express";
import { documentObjectController } from "../controllers/DocumentObjectController";
import { withBasePath } from "../utils/routeHelpers";

class DocumentObjectRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.post(
      withBasePath("document/object-by-task"),
      (req, res) => documentObjectController.getByTaskId(req, res)
    );
  }
}

const documentObjectRoute = new DocumentObjectRoute();
export default documentObjectRoute.router;
