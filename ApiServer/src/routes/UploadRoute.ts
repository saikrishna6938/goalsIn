import { Router } from "express";
import keys from "../keys";
import { uploadController } from "../controllers/UploadController";
import multer from "multer";

class UploadRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config(): void {
    this.router.post(
      `${keys.basePath}upload/file`,
      uploadController.uploadFile
    );
    this.router.post(`${keys.basePath}get/file`, uploadController.getFile);
    this.router.post(
      `${keys.basePath}get/filedata`,
      uploadController.getFileData
    );
    this.router.post(
      `${keys.basePath}userupload/file`,
      uploadController.uploadUserIntray
    );
    this.router.post(
      `${keys.basePath}indexDocument/file`,
      uploadController.updateToIndexDocument
    );
  }
}

const ir = new UploadRoute();
export default ir.router;
