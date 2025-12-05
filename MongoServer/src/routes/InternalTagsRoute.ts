import { Router } from "express";
import { internalTagsController } from "../controllers/InternalTagsController";
import { withBasePath } from "../utils/routeHelpers";

class InternalTagsRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.put(
      withBasePath("update-internal-tag/:tableId/:id"),
      internalTagsController.updateRecord
    );
    this.router.post(
      withBasePath("update-internal-tag/:tableId/:id"),
      internalTagsController.createRecord
    );
  }
}

const internalTagsRoute = new InternalTagsRoute();
export default internalTagsRoute.router;
