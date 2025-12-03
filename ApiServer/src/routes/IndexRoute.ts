import { Router } from "express";
import { indexcontroller } from "../controllers/IndexController";
import keys from "../keys";
import multer from "multer";
class indexRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    const upload = multer({ storage: multer.memoryStorage() });
    this.router.get(keys.basePath, indexcontroller.index);
    this.router.get(`${keys.basePath}test`, indexcontroller.test);
    this.router.post(
      `${keys.basePath}action-subscribe`,
      indexcontroller.action_subscribe
    );
    this.router.post(
      `${keys.basePath}action-contact`,
      indexcontroller.action_contactus
    );
    this.router.post(
      `${keys.basePath}action-enroll`,
      indexcontroller.action_enroll
    );
    this.router.post(
      `${keys.basePath}action-resume`,
      upload.single("file"),
      indexcontroller.action_submitFormWithFile
    );
    this.router.get(
      `${keys.basePath}user/document-tags/:id`,
      indexcontroller.getDocumentTagById
    );
  }
}

const ir = new indexRoute();
export default ir.router;
