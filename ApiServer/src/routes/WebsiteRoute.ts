import { Router } from "express";
import { indexcontroller } from "../controllers/IndexController";
import keys from "../keys";
import { globalController } from "../controllers/GlobalController";
import { searchController } from "../controllers/SearchController";
import { searchWebController } from "../controllers/SearchWebController";

class WebsiteRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    this.router.get(
      `${keys.basePath}get-document-groups`,
      globalController.getDocumentGroups
    );
    this.router.post(
      `${keys.basePath}search-details`,
      searchWebController.SearchDocumentTable
    );
    this.router.get(
      `${keys.basePath}user/document-tags/:id`,
      indexcontroller.getDocumentTagById
    );
  }
}

const ir = new WebsiteRoute();
export default ir.router;
