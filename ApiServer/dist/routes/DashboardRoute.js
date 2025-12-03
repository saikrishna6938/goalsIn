"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const IndexController_1 = require("../controllers/IndexController");
const keys_1 = __importDefault(require("../keys"));
class DashboarRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post(`${keys_1.default.basePath}dashboard-applications`, IndexController_1.indexcontroller.test);
    }
}
const ir = new DashboarRoute();
exports.default = ir.router;
//# sourceMappingURL=DashboardRoute.js.map