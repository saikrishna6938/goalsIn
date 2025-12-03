import { Router } from "express";
import keys from "../keys";
import { dataTablesController } from "../controllers/DataTablesController";

class DataTablesRoutes {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    // Add data table route
    this.router.post(
      `${keys.basePath}table/add`,
      dataTablesController.addDataTable
    );

    // Update data table route
    this.router.put(
      `${keys.basePath}table/update`,
      dataTablesController.updateDataTable
    );

    // Delete data table route
    this.router.delete(
      `${keys.basePath}table/delete`,
      dataTablesController.deleteDataTable
    );

    // Import data from Excel route
    this.router.post(
      `${keys.basePath}table/import/excel`,
      dataTablesController.importDataTableFromExcel
    );

    // Import data from CSV route
    this.router.post(
      `${keys.basePath}table/import/csv`,
      dataTablesController.importDataTableFromCsv
    );

    this.router.post(
      `${keys.basePath}table/insert-row`,
      dataTablesController.insertIntoTable
    );

    this.router.put(
      `${keys.basePath}table/update-row`,
      dataTablesController.updateTable
    );
    this.router.delete(
      `${keys.basePath}table/delete-row`,
      dataTablesController.deleteFromTable
    );
  }
}

const ir = new DataTablesRoutes();
export default ir.router;
