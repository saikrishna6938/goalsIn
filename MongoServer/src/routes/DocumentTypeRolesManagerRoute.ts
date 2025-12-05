import { Router } from "express";
import { documentTypeRoleController } from "../controllers/RolesControllers/DocumentTypeRoleController";
import { withBasePath } from "../utils/routeHelpers";

class DocumentTypeRolesManagerRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.get(withBasePath("administrator/document/roles"), documentTypeRoleController.getDocumentTypeRoles);
    this.router.post(withBasePath("administrator/document/roles"), documentTypeRoleController.insertDocumentTypeRole);
    this.router.put(withBasePath("administrator/document/roles"), documentTypeRoleController.updateDocumentTypeRole);
    this.router.delete(
      withBasePath("administrator/document/roles/:documentTypeRoleId"),
      documentTypeRoleController.deleteDocumentTypeRole
    );
    this.router.get(
      withBasePath("administrator/user/document-types/:userId/:typeId"),
      documentTypeRoleController.getUserDocumentTypes
    );
    this.router.get(
      withBasePath("user/document-types/:userId/:typeId"),
      documentTypeRoleController.getUserDocumentTypes
    );
    this.router.get(
      withBasePath("administrator/user/document-types/:userId/:roleTypeId"),
      documentTypeRoleController.getFilteredDocumentTypes
    );
  }
}

const documentTypeRolesManagerRoute = new DocumentTypeRolesManagerRoute();
export default documentTypeRolesManagerRoute.router;
