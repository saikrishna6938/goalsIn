import { Router } from "express";
import { indexcontroller } from "../controllers/IndexController";
import keys from "../keys";
import { globalController } from "../controllers/GlobalController";

class globalRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    this.router.post(
      `${keys.basePath}check-user-document-permission`,
      globalController.checkUserDocumentPermission
    );
    this.router.post(
      `${keys.basePath}check-user-submitted-document`,
      globalController.checkUserSubmittedDocument
    );
    this.router.get(
      `${keys.basePath}clone-profile/:userId`,
      globalController.cloneProfileObject
    );
  }
}

const ir = new globalRoute();
export default ir.router;
