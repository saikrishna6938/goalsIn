import { Request, Response } from "express";
import { dataTablesController } from "../../DataTablesController";

export class DataTableController {
  getAllDataTables(req: Request, res: Response) {
    return dataTablesController.getAllDataTables(req, res);
  }

  addDataTable(req: Request, res: Response) {
    return dataTablesController.addDataTable(req, res);
  }

  importDataTable(_req: Request, res: Response) {
    return res.json({ status: true, message: "Data imported successfully!" });
  }

  deleteDataTable(req: Request, res: Response) {
    return dataTablesController.deleteDataTable(req, res);
  }
}
