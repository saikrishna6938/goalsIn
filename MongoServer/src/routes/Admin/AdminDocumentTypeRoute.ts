import { Router } from "express";
import { AdminDocumentTypesController } from "../../controllers/Admin/Documents/AdminDocumentTypesController";
import { withBasePath } from "../../utils/routeHelpers";

class AdminDocumentTypeRoute {
  public router: Router = Router();
  private documentTypeController: AdminDocumentTypesController;

  constructor() {
    this.documentTypeController = new AdminDocumentTypesController();
    this.config();
  }

  private config() {
    this.router.post(withBasePath("administrator/document-types"), (req, res) =>
      this.documentTypeController.addDocumentType(req, res)
    );
    this.router.put(withBasePath("administrator/document-types/:documentTypeId"), (req, res) =>
      this.documentTypeController.editDocumentType(req, res)
    );
    this.router.delete(withBasePath("administrator/document-types/:documentTypeId"), (req, res) =>
      this.documentTypeController.deleteDocumentType(req, res)
    );
    this.router.get(withBasePath("administrator/document-types"), (req, res) =>
      this.documentTypeController.getAllDocumentTypes(req, res)
    );
    this.router.get(withBasePath("administrator/document-types/:documentTypeId"), (req, res) =>
      this.documentTypeController.getSingleDocumentType(req, res)
    );
    this.router.post(withBasePath("administrator/document-groups"), (req, res) =>
      this.documentTypeController.addDocumentGroup(req, res)
    );
    this.router.put(withBasePath("administrator/document-groups/:documentGroupId"), (req, res) =>
      this.documentTypeController.editDocumentGroup(req, res)
    );
    this.router.delete(withBasePath("administrator/document-groups/:documentGroupId"), (req, res) =>
      this.documentTypeController.deleteDocumentGroup(req, res)
    );
    this.router.get(withBasePath("administrator/document-groups"), (req, res) =>
      this.documentTypeController.getAllDocumentGroups(req, res)
    );
    this.router.get(withBasePath("administrator/document-groups/:documentGroupId"), (req, res) =>
      this.documentTypeController.getSingleDocumentGroup(req, res)
    );
    this.router.get(withBasePath("administrator/document-group-types"), (req, res) =>
      this.documentTypeController.getDocumentGroupTypes(req, res)
    );
  }
}

const adminDocumentTypeRoute = new AdminDocumentTypeRoute();
export default adminDocumentTypeRoute.router;
