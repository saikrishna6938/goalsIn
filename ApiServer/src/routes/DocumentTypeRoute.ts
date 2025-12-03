import { Router } from "express";
import keys from "../keys";
import { documentController } from "../controllers/DocumentTypeController";

class indexRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    this.router.post(
      `${keys.basePath}document-type/add-object`,
      documentController.addDocumentTypeObject
    );
    this.router.put(
      `${keys.basePath}document-type/update-object/:documentTypeObjectId`,
      documentController.updateDocumentTypeObject
    );
    this.router.delete(
      `${keys.basePath}document-type/delete-object/:documentTypeObjectId`,
      documentController.deleteDocumentTypeObject
    );
    this.router.get(
      `${keys.basePath}document-type/get-documentstypes-usertype/:userTypeId`,
      documentController.getDocumentTypesByUserType
    );
    this.router.get(
      `${keys.basePath}document-type/get-object/:documentTypeId`,
      documentController.getDocumentTypeObjectById
    );
    this.router.post(
      `${keys.basePath}document-type/add-type`,
      documentController.addDocumentType
    );
    this.router.put(
      `${keys.basePath}document-type/update-type/:documentTypeId`,
      documentController.updateDocumentType
    );
    this.router.delete(
      `${keys.basePath}document-type/delete-type/:documentTypeId`,
      documentController.deleteDocumentType
    );
    this.router.get(
      `${keys.basePath}document-type/get-type/:documentTypeId`,
      documentController.getDocumentType
    );
    // this.router.post(
    //   `${keys.basePath}document-type/get-type-by-roles`,
    //   documentController.getDocumentTypeByRoles
    // );
    this.router.get(
      `${keys.basePath}document-type/get-type-by-roles/:userId`,
      documentController.getDocumentTypeByRoles
    );
    this.router.post(
      `${keys.basePath}document-type/get-type-users`,
      documentController.getDocumentTypeUsers
    );
  }
}

const ir = new indexRoute();
export default ir.router;
