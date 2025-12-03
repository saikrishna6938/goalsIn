import { Router } from "express";
import { globalController } from "../controllers/GlobalController";
import { withBasePath } from "../utils/routeHelpers";

class GlobalRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.post(
      withBasePath("check-user-document-permission"),
      globalController.checkUserDocumentPermission
    );
    this.router.post(
      withBasePath("check-user-submitted-document"),
      globalController.checkUserSubmittedDocument
    );
    this.router.get(
      withBasePath("clone-profile/:userId"),
      globalController.cloneProfileObject
    );
  }
}

const globalRoute = new GlobalRoute();
export default globalRoute.router;
