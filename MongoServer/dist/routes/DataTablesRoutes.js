"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DataTablesController_1 = require("../controllers/DataTablesController");
const routeHelpers_1 = require("../utils/routeHelpers");
class DataTablesRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post((0, routeHelpers_1.withBasePath)("table/add"), DataTablesController_1.dataTablesController.addDataTable);
        this.router.put((0, routeHelpers_1.withBasePath)("table/update"), DataTablesController_1.dataTablesController.updateDataTable);
        this.router.delete((0, routeHelpers_1.withBasePath)("table/delete"), DataTablesController_1.dataTablesController.deleteDataTable);
        this.router.post((0, routeHelpers_1.withBasePath)("table/import/excel"), DataTablesController_1.dataTablesController.importDataTableFromExcel);
        this.router.post((0, routeHelpers_1.withBasePath)("table/import/csv"), DataTablesController_1.dataTablesController.importDataTableFromCsv);
        this.router.post((0, routeHelpers_1.withBasePath)("table/insert-row"), DataTablesController_1.dataTablesController.insertIntoTable);
        this.router.put((0, routeHelpers_1.withBasePath)("table/update-row"), DataTablesController_1.dataTablesController.updateTable);
        this.router.delete((0, routeHelpers_1.withBasePath)("table/delete-row"), DataTablesController_1.dataTablesController.deleteFromTable);
    }
}
const dataTablesRoutes = new DataTablesRoutes();
exports.default = dataTablesRoutes.router;
