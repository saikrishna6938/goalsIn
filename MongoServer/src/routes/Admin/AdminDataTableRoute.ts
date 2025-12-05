import { Router } from "express";
import { withBasePath } from "../../utils/routeHelpers";
import { DataTableController } from "../../controllers/Admin/DataTable/DataTableController";

class AdminDataTableRoute {
  public router: Router = Router();
  private dataTableController: DataTableController;

  constructor() {
    this.dataTableController = new DataTableController();
    this.config();
  }

  private config() {
    this.router.get(withBasePath("administrator/data-tables"), (req, res) =>
      this.dataTableController.getAllDataTables(req, res)
    );
    this.router.post(withBasePath("administrator/data-tables"), (req, res) =>
      this.dataTableController.addDataTable(req, res)
    );
    this.router.post(withBasePath("administrator/data-tables/import"), (req, res) =>
      this.dataTableController.importDataTable(req, res)
    );
    this.router.delete(withBasePath("administrator/data-tables"), (req, res) =>
      this.dataTableController.deleteDataTable(req, res)
    );
  }
}

const adminDataTableRoute = new AdminDataTableRoute();
export default adminDataTableRoute.router;
