"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const HistoryController_1 = require("../controllers/HistoryController");
const routeHelpers_1 = require("../utils/routeHelpers");
class HistoryRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post((0, routeHelpers_1.withBasePath)("history/add"), HistoryController_1.historyController.addHistory);
        this.router.get((0, routeHelpers_1.withBasePath)("history/task/:taskId"), HistoryController_1.historyController.getHistoryByTaskId);
    }
}
const historyRoutes = new HistoryRoutes();
exports.default = historyRoutes.router;
