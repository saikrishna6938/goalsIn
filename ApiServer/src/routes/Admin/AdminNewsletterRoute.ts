import { Router } from "express";
import keys from "../../keys";
import { AdminNewslettersController } from "../../controllers/Admin/Newsletters/AdminNewslettersController";

class AdminNewsletterRoute {
  public router: Router = Router();
  private newsletter: AdminNewslettersController;

  constructor() {
    this.newsletter = new AdminNewslettersController();
    this.config();
  }

  config(): void {
    this.router.post(`${keys.basePath}administrator/newsletters`, (req, res) =>
      this.newsletter.addNewsletters(req,res)
    );

    this.router.put(`${keys.basePath}administrator/newsletters`, (req, res) =>
      this.newsletter.updateNewsletter(req, res)
    );

    this.router.delete(`${keys.basePath}administrator/newsletters`, (req, res) =>
      this.newsletter.deleteNewsletters(req, res)
    );

    this.router.get(`${keys.basePath}administrator/newsletters`, (req, res) =>
      this.newsletter.getNewsletters(req, res)
    );
    this.router.get(`${keys.basePath}administrator/newsletters/types`, (req, res) =>
      this.newsletter.getNewsletterTypes(req, res)
    );

    this.router.put(`${keys.basePath}administrator/newsletters/types`, (req, res) =>
      this.newsletter.updateNewsletterType(req, res)
    );

    this.router.post(`${keys.basePath}administrator/newsletters`, (req, res) =>
      this.newsletter.addNewsletterTypes(req, res)
    );

    this.router.delete(`${keys.basePath}administrator/newsletters`, (req, res) =>
      this.newsletter.deleteNewsletterTypes(req, res)
    );
    this.router.get(
      `${keys.basePath}administrator/newsletters/:newslettersId`,
      (req, res) => this.newsletter.getById(req, res)
    );
  }
}

const routes = new AdminNewsletterRoute();
export default routes.router;
