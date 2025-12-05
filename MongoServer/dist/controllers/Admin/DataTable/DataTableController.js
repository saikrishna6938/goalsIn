"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableController = void 0;
const DataTablesController_1 = require("../../DataTablesController");
class DataTableController {
    getAllDataTables(req, res) {
        return DataTablesController_1.dataTablesController.getAllDataTables(req, res);
    }
    addDataTable(req, res) {
        return DataTablesController_1.dataTablesController.addDataTable(req, res);
    }
    importDataTable(_req, res) {
        return res.json({ status: true, message: "Data imported successfully!" });
    }
    deleteDataTable(req, res) {
        return DataTablesController_1.dataTablesController.deleteDataTable(req, res);
    }
}
exports.DataTableController = DataTableController;
