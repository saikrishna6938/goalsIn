import { Router } from "express";
import keys from "../../keys";
import { AdminDocumentTypesRolesController } from "../../controllers/Admin/Documents/AdminDocumentTypesRoles";

class AdminDocumentTypeRolesRoute {
  public router: Router = Router();
  private documentTypeController: AdminDocumentTypesRolesController;

  constructor() {
    this.documentTypeController = new AdminDocumentTypesRolesController();
    this.config();
  }

  config(): void {
    // GET roles for a document type
    this.router.get(
      `${keys.basePath}administrator/document-type-roles/:documentTypeId`,
      (req, res) => this.documentTypeController.getDocumentTypeRoles(req, res)
    );

    // ADD roles (array)
    this.router.post(
      `${keys.basePath}administrator/document-type-roles`,
      (req, res) => this.documentTypeController.addDocumentTypeRoles(req, res)
    );

    // DELETE roles based on roleIds + documentTypeId
    this.router.delete(
      `${keys.basePath}administrator/document-type-roles`,
      (req, res) =>
        this.documentTypeController.deleteDocumentTypeRoles(req, res)
    );
  }
}

const documentTypeRolesRoutes = new AdminDocumentTypeRolesRoute();
export default documentTypeRolesRoutes.router;
