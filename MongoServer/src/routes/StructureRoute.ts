import { Router } from "express";
import { structureController } from "../controllers/StructureController";
import { withBasePath } from "../utils/routeHelpers";

class StructureRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.post(withBasePath("add-entity"), structureController.addEntity);
    this.router.delete(withBasePath("delete-entity/:entityId"), structureController.deleteEntity);
    this.router.put(withBasePath("update-entity/:entityId"), structureController.updateEntity);
    this.router.get(withBasePath("entities"), structureController.getEntities);
    this.router.get(withBasePath("entity/:entityId"), structureController.getEntity);
  }
}

const structureRoute = new StructureRoute();
export default structureRoute.router;
