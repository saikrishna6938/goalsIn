import { Router } from "express";
import keys from "../keys";
import { internalTagsController } from "../controllers/InternalTagsController";

class InternalTagsRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    this.router.put(
      `${keys.basePath}update-internal-tag/:tableId/:id`,
      internalTagsController.updateRecord
    );
    this.router.post(
      `${keys.basePath}update-internal-tag/:tableId/:id`,
      internalTagsController.createRecord
    );
  }
}

const ir = new InternalTagsRoute();
export default ir.router;
