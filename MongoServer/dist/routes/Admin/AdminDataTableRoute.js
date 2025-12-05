"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routeHelpers_1 = require("../../utils/routeHelpers");
const DataTableController_1 = require("../../controllers/Admin/DataTable/DataTableController");
class AdminDataTableRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.dataTableController = new DataTableController_1.DataTableController();
        this.config();
    }
    config() {
        this.router.get((0, routeHelpers_1.withBasePath)("administrator/data-tables"), (req, res) => this.dataTableController.getAllDataTables(req, res));
        this.router.post((0, routeHelpers_1.withBasePath)("administrator/data-tables"), (req, res) => this.dataTableController.addDataTable(req, res));
        this.router.post((0, routeHelpers_1.withBasePath)("administrator/data-tables/import"), (req, res) => this.dataTableController.importDataTable(req, res));
        this.router.delete((0, routeHelpers_1.withBasePath)("administrator/data-tables"), (req, res) => this.dataTableController.deleteDataTable(req, res));
    }
}
const adminDataTableRoute = new AdminDataTableRoute();
exports.default = adminDataTableRoute.router;
