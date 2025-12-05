import { Router } from "express";
import { withBasePath } from "../../utils/routeHelpers";
import { adminDocumentTagController } from "../../controllers/Admin/Documents/AdminDocumentTagController";

class AdminDocumentTagRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    const base = withBasePath("administrator/document-tags");
    this.router.post(base, (req, res) => adminDocumentTagController.createDocumentTag(req, res));
    this.router.get(base, (req, res) => adminDocumentTagController.getAllDocumentTags(req, res));
    this.router.put(`${base}/:id`, (req, res) => adminDocumentTagController.updateDocumentTag(req, res));
    this.router.delete(`${base}/:id`, (req, res) => adminDocumentTagController.deleteDocumentTag(req, res));
    this.router.get(`${base}/:id`, (req, res) => adminDocumentTagController.getDocumentTagById(req, res));
  }
}

const adminDocumentTagRoute = new AdminDocumentTagRoute();
export default adminDocumentTagRoute.router;
