"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const HistoryController_1 = require("../controllers/HistoryController");
class HistoryRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post(`${keys_1.default.basePath}history/add`, HistoryController_1.historyController.addHistory);
        this.router.get(`${keys_1.default.basePath}history/task/:taskId`, HistoryController_1.historyController.getHistoryByTaskId);
    }
}
const ir = new HistoryRoutes();
exports.default = ir.router;
//# sourceMappingURL=HistoryRoutes.js.map