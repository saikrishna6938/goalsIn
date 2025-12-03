import { Router } from "express";
import { indexcontroller } from "../controllers/IndexController";
import keys from "../keys";
import { searchController } from "../controllers/SearchController";

class SearchRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    this.router.post(
      `${keys.basePath}search-document-table`,
      searchController.SearchDocumentTable
    );
  }
}

const ir = new SearchRoute();
export default ir.router;
