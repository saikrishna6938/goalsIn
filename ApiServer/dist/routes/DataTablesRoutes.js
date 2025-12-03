"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const DataTablesController_1 = require("../controllers/DataTablesController");
class DataTablesRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        // Add data table route
        this.router.post(`${keys_1.default.basePath}table/add`, DataTablesController_1.dataTablesController.addDataTable);
        // Update data table route
        this.router.put(`${keys_1.default.basePath}table/update`, DataTablesController_1.dataTablesController.updateDataTable);
        // Delete data table route
        this.router.delete(`${keys_1.default.basePath}table/delete`, DataTablesController_1.dataTablesController.deleteDataTable);
        // Import data from Excel route
        this.router.post(`${keys_1.default.basePath}table/import/excel`, DataTablesController_1.dataTablesController.importDataTableFromExcel);
        // Import data from CSV route
        this.router.post(`${keys_1.default.basePath}table/import/csv`, DataTablesController_1.dataTablesController.importDataTableFromCsv);
        this.router.post(`${keys_1.default.basePath}table/insert-row`, DataTablesController_1.dataTablesController.insertIntoTable);
        this.router.put(`${keys_1.default.basePath}table/update-row`, DataTablesController_1.dataTablesController.updateTable);
        this.router.delete(`${keys_1.default.basePath}table/delete-row`, DataTablesController_1.dataTablesController.deleteFromTable);
    }
}
const ir = new DataTablesRoutes();
exports.default = ir.router;
//# sourceMappingURL=DataTablesRoutes.js.map