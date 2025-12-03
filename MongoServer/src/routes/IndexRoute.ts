import { Router } from "express";
import multer from "multer";
import { indexController } from "../controllers/IndexController";
import { withBasePath } from "../utils/routeHelpers";

class IndexRoute {
  public router: Router = Router();
  private upload = multer({ storage: multer.memoryStorage() });

  constructor() {
    this.config();
  }

  private config() {
    this.router.get(withBasePath(), indexController.index);
    this.router.get(withBasePath("test"), indexController.test);
    this.router.post(withBasePath("action-subscribe"), indexController.action_subscribe);
    this.router.post(withBasePath("action-contact"), indexController.action_contactus);
    this.router.post(withBasePath("action-enroll"), indexController.action_enroll);
    this.router.post(
      withBasePath("action-resume"),
      this.upload.single("file"),
      indexController.action_submitFormWithFile
    );
    this.router.get(withBasePath("user/document-tags/:id"), indexController.getDocumentTagById);
  }
}

const indexRoute = new IndexRoute();
export default indexRoute.router;
