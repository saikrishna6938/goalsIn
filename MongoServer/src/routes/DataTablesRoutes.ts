import { Router } from "express";
import { dataTablesController } from "../controllers/DataTablesController";
import { withBasePath } from "../utils/routeHelpers";

class DataTablesRoutes {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.post(withBasePath("table/add"), dataTablesController.addDataTable);
    this.router.put(withBasePath("table/update"), dataTablesController.updateDataTable);
    this.router.delete(withBasePath("table/delete"), dataTablesController.deleteDataTable);
    this.router.post(withBasePath("table/import/excel"), dataTablesController.importDataTableFromExcel);
    this.router.post(withBasePath("table/import/csv"), dataTablesController.importDataTableFromCsv);
    this.router.post(withBasePath("table/insert-row"), dataTablesController.insertIntoTable);
    this.router.put(withBasePath("table/update-row"), dataTablesController.updateTable);
    this.router.delete(withBasePath("table/delete-row"), dataTablesController.deleteFromTable);
  }
}

const dataTablesRoutes = new DataTablesRoutes();
export default dataTablesRoutes.router;
