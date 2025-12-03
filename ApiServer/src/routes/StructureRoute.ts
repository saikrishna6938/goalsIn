import { Router } from "express";
import keys from "../keys";

import { structureController } from "../controllers/StructureController";

class indexRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    this.router.post(
      `${keys.basePath}add-entity`,
      structureController.addEntity
    );
    this.router.delete(
      `${keys.basePath}delete-entity/:entityId`,
      structureController.deleteEntity
    );
    this.router.put(
      `${keys.basePath}update-entity/:entityId`,
      structureController.updateEntity
    );
    this.router.get(
      `${keys.basePath}entities`,
      structureController.getEntities
    );
    this.router.get(
      `${keys.basePath}entity/:entityId`,
      structureController.getEntity
    );
  }
}

const ir = new indexRoute();
export default ir.router;
