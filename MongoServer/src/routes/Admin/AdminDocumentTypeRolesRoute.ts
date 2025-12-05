import { Router } from "express";
import { withBasePath } from "../../utils/routeHelpers";
import { AdminDocumentTypesRolesController } from "../../controllers/Admin/Documents/AdminDocumentTypesRoles";

class AdminDocumentTypeRolesRoute {
  public router: Router = Router();
  private documentTypeController: AdminDocumentTypesRolesController;

  constructor() {
    this.documentTypeController = new AdminDocumentTypesRolesController();
    this.config();
  }

  private config() {
    this.router.get(withBasePath("administrator/document-type-roles/:documentTypeId"), (req, res) =>
      this.documentTypeController.getDocumentTypeRoles(req, res)
    );
    this.router.post(withBasePath("administrator/document-type-roles"), (req, res) =>
      this.documentTypeController.addDocumentTypeRoles(req, res)
    );
    this.router.delete(withBasePath("administrator/document-type-roles"), (req, res) =>
      this.documentTypeController.deleteDocumentTypeRoles(req, res)
    );
  }
}

const adminDocumentTypeRolesRoute = new AdminDocumentTypeRolesRoute();
export default adminDocumentTypeRolesRoute.router;
