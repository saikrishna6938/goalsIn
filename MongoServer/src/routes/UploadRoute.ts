import { Router } from "express";
import { uploadController } from "../controllers/UploadController";
import { withBasePath } from "../utils/routeHelpers";

class UploadRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.post(withBasePath("upload/file"), uploadController.uploadFile);
    this.router.post(withBasePath("get/file"), uploadController.getFile);
    this.router.post(withBasePath("get/filedata"), uploadController.getFileData);
    this.router.post(withBasePath("userupload/file"), uploadController.uploadUserIntray);
    this.router.post(withBasePath("indexDocument/file"), uploadController.updateToIndexDocument);
  }
}

const uploadRoute = new UploadRoute();
export default uploadRoute.router;
