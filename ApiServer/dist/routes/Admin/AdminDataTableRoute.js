"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../../keys"));
const DataTableController_1 = require("../../controllers/Admin/DataTable/DataTableController");
class AdminDataTableRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.dataTableController = new DataTableController_1.DataTableController();
        this.config();
    }
    config() {
        this.router.get(`${keys_1.default.basePath}administrator/data-tables`, (req, res) => this.dataTableController.getAllDataTables(req, res));
        this.router.post(`${keys_1.default.basePath}administrator/data-tables`, (req, res) => this.dataTableController.addDataTable(req, res));
        this.router.post(`${keys_1.default.basePath}administrator/data-tables/import`, (req, res) => this.dataTableController.importDataTable(req, res));
        this.router.delete(`${keys_1.default.basePath}administrator/data-tables`, (req, res) => this.dataTableController.deleteDataTable(req, res));
    }
}
const dataTableRoute = new AdminDataTableRoute();
exports.default = dataTableRoute.router;
//# sourceMappingURL=AdminDataTableRoute.js.map