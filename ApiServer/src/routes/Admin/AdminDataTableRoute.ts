import { Router } from "express";
import keys from "../../keys";
import { DataTableController } from "../../controllers/Admin/DataTable/DataTableController";

class AdminDataTableRoute {
  public router: Router = Router();
  private dataTableController: DataTableController;

  constructor() {
    this.dataTableController = new DataTableController();
    this.config();
  }

  config(): void {
    this.router.get(`${keys.basePath}administrator/data-tables`, (req, res) =>
      this.dataTableController.getAllDataTables(req, res)
    );
    this.router.post(`${keys.basePath}administrator/data-tables`, (req, res) =>
      this.dataTableController.addDataTable(req, res)
    );
    this.router.post(
      `${keys.basePath}administrator/data-tables/import`,
      (req, res) => this.dataTableController.importDataTable(req, res)
    );
    this.router.delete(
      `${keys.basePath}administrator/data-tables`,
      (req, res) => this.dataTableController.deleteDataTable(req, res)
    );
  }
}

const dataTableRoute = new AdminDataTableRoute();
export default dataTableRoute.router;
