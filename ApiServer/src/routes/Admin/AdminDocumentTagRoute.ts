import { Router } from "express";
import keys from "../../keys";
import { adminDocumentTagController } from "../../controllers/Admin/Documents/AdminDocumentTagController";

class AdminDocumentTagRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    const base = `${keys.basePath}administrator/document-tags`;

    // Create a new document tag
    this.router.post(`${base}`, (req, res) =>
      adminDocumentTagController.createDocumentTag(req, res)
    );

    // Get all document tags
    this.router.get(`${base}`, (req, res) =>
      adminDocumentTagController.getAllDocumentTags(req, res)
    );

    // Update a document tag by ID
    this.router.put(`${base}/:id`, (req, res) =>
      adminDocumentTagController.updateDocumentTag(req, res)
    );

    // Delete a document tag by ID
    this.router.delete(`${base}/:id`, (req, res) =>
      adminDocumentTagController.deleteDocumentTag(req, res)
    );

    this.router.get(`${base}/:id`, (req, res) =>
      adminDocumentTagController.getDocumentTagById(req, res)
    );
  }
}

const adminDocumentTagRoute = new AdminDocumentTagRoute();
export default adminDocumentTagRoute.router;
