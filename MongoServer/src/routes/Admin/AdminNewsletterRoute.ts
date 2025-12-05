import { Router } from "express";
import { withBasePath } from "../../utils/routeHelpers";
import { AdminNewslettersController } from "../../controllers/Admin/Newsletters/AdminNewslettersController";

class AdminNewsletterRoute {
  public router: Router = Router();
  private newsletter: AdminNewslettersController;

  constructor() {
    this.newsletter = new AdminNewslettersController();
    this.config();
  }

  private config() {
    const base = withBasePath("administrator/newsletters");
    this.router.post(base, (req, res) => this.newsletter.addNewsletters(req, res));
    this.router.put(base, (req, res) => this.newsletter.updateNewsletter(req, res));
    this.router.delete(base, (req, res) => this.newsletter.deleteNewsletters(req, res));
    this.router.get(base, (req, res) => this.newsletter.getNewsletters(req, res));
    this.router.get(`${base}/types`, (req, res) => this.newsletter.getNewsletterTypes(req, res));
    this.router.put(`${base}/types`, (req, res) => this.newsletter.updateNewsletterType(req, res));
    this.router.post(`${base}/types`, (req, res) => this.newsletter.addNewsletterTypes(req, res));
    this.router.delete(`${base}/types`, (req, res) => this.newsletter.deleteNewsletterTypes(req, res));
    this.router.get(`${base}/:newslettersId`, (req, res) => this.newsletter.getById(req, res));
  }
}

const adminNewsletterRoute = new AdminNewsletterRoute();
export default adminNewsletterRoute.router;
