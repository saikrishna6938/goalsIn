import { Router } from "express";
import { searchController } from "../controllers/SearchController";
import { withBasePath } from "../utils/routeHelpers";

class SearchRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.post(withBasePath("search-document-table"), searchController.SearchDocumentTable);
  }
}

const searchRoute = new SearchRoute();
export default searchRoute.router;
