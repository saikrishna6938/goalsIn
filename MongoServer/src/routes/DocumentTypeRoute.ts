import { Router } from "express";
import { documentController } from "../controllers/DocumentTypeController";
import { withBasePath } from "../utils/routeHelpers";

class DocumentTypeRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.post(withBasePath("document-type/add-object"), documentController.addDocumentTypeObject);
    this.router.put(
      withBasePath("document-type/update-object/:documentTypeObjectId"),
      documentController.updateDocumentTypeObject
    );
    this.router.delete(
      withBasePath("document-type/delete-object/:documentTypeObjectId"),
      documentController.deleteDocumentTypeObject
    );
    this.router.get(
      withBasePath("document-type/get-documentstypes-usertype/:userTypeId"),
      documentController.getDocumentTypesByUserType
    );
    this.router.get(
      withBasePath("document-type/get-object/:documentTypeId"),
      documentController.getDocumentTypeObjectById
    );
    this.router.post(withBasePath("document-type/add-type"), documentController.addDocumentType);
    this.router.put(
      withBasePath("document-type/update-type/:documentTypeId"),
      documentController.updateDocumentType
    );
    this.router.delete(
      withBasePath("document-type/delete-type/:documentTypeId"),
      documentController.deleteDocumentType
    );
    this.router.get(
      withBasePath("document-type/get-type/:documentTypeId"),
      documentController.getDocumentType
    );
    this.router.get(
      withBasePath("document-type/get-type-by-roles/:userId"),
      documentController.getDocumentTypeByRoles
    );
    this.router.post(withBasePath("document-type/get-type-users"), documentController.getDocumentTypeUsers);
  }
}

const documentTypeRoute = new DocumentTypeRoute();
export default documentTypeRoute.router;
