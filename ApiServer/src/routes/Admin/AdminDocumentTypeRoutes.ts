import { Router } from "express";
import keys from "../../keys";
import { AdminDocumentTypesController } from "../../controllers/Admin/Documents/AdminDocumentTypesController";

class AdminDocumentTypeRoute {
  public router: Router = Router();
  private documentTypeController: AdminDocumentTypesController;

  constructor() {
    this.documentTypeController = new AdminDocumentTypesController();
    this.config();
  }

  config(): void {
    // DocumentType Routes
    this.router.post(
      `${keys.basePath}administrator/document-types`,
      (req, res) => this.documentTypeController.addDocumentType(req, res)
    );

    this.router.put(
      `${keys.basePath}administrator/document-types/:documentTypeId`,
      (req, res) => this.documentTypeController.editDocumentType(req, res)
    );

    this.router.delete(
      `${keys.basePath}administrator/document-types/:documentTypeId`,
      (req, res) => this.documentTypeController.deleteDocumentType(req, res)
    );

    this.router.get(
      `${keys.basePath}administrator/document-types`,
      (req, res) => this.documentTypeController.getAllDocumentTypes(req, res)
    );

    this.router.get(
      `${keys.basePath}administrator/document-types/:documentTypeId`,
      (req, res) => this.documentTypeController.getSingleDocumentType(req, res)
    );

    // DocumentGroup Routes
    this.router.post(
      `${keys.basePath}administrator/document-groups`,
      (req, res) => this.documentTypeController.addDocumentGroup(req, res)
    );

    this.router.put(
      `${keys.basePath}administrator/document-groups/:documentGroupId`,
      (req, res) => this.documentTypeController.editDocumentGroup(req, res)
    );

    this.router.get(
      `${keys.basePath}administrator/document-groups`,
      (req, res) => this.documentTypeController.getAllDocumentGroups(req, res)
    );

    this.router.get(
      `${keys.basePath}administrator/document-groups/:documentGroupId`,
      (req, res) => this.documentTypeController.getSingleDocumentGroup(req, res)
    );
    this.router.delete(
      `${keys.basePath}administrator/document-groups/:documentGroupId`,
      (req, res) => this.documentTypeController.deleteDocumentGroup(req, res)
    );
    this.router.get(
      `${keys.basePath}administrator/document-group-types`,
      (req, res) => this.documentTypeController.getDocumentGroupTypes(req, res)
    );
  }
}

const documentTypeRoutes = new AdminDocumentTypeRoute();
export default documentTypeRoutes.router;
