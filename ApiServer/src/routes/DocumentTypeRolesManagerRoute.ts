import { Router } from "express";
import keys from "../keys";
import { documentTypeRoleController } from "../controllers/RolesControllers/DocumentTypeRoleController";

class DocumentTypeRolesManagerRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    this.router.get(
      `${keys.basePath}administrator/document/roles`,
      documentTypeRoleController.getDocumentTypeRoles
    );
    this.router.post(
      `${keys.basePath}administrator/document/roles`,
      documentTypeRoleController.insertDocumentTypeRole
    );
    this.router.put(
      `${keys.basePath}administrator/document/roles`,
      documentTypeRoleController.updateDocumentTypeRole
    );
    this.router.delete(
      `${keys.basePath}administrator/document/roles/:documentTypeRoleId`,
      documentTypeRoleController.deleteDocumentTypeRole
    );
    this.router.get(
      `${keys.basePath}administrator/user/document-types/:userId/:typeId`,
      documentTypeRoleController.getUserDocumentTypes
    );
    this.router.get(
      `${keys.basePath}user/document-types/:userId/:typeId`,
      documentTypeRoleController.getUserDocumentTypes
    );

    this.router.get(
      `${keys.basePath}administrator/user/document-types/:userId/:roleTypeId`,
      documentTypeRoleController.getFilteredDocumentTypes
    );
  }
}

const ir = new DocumentTypeRolesManagerRoute();
export default ir.router;
