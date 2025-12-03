import { Router } from "express";
import { websiteController } from "../controllers/WebsiteController";
import { indexController } from "../controllers/IndexController";
import { withBasePath } from "../utils/routeHelpers";

class WebsiteRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.get(withBasePath("get-document-groups"), websiteController.getDocumentGroups);
    this.router.post(withBasePath("search-details"), websiteController.searchDetails);
    this.router.get(withBasePath("user/document-tags/:id"), indexController.getDocumentTagById);
  }
}

const websiteRoute = new WebsiteRoute();
export default websiteRoute.router;
