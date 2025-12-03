"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const ControlCenterController_1 = require("../controllers/ControlCenterController");
class ControlCenterRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post(`${keys_1.default.basePath}outstainding-tasks`, ControlCenterController_1.controCenterController.GetEntityTasks);
    }
}
const ir = new ControlCenterRoutes();
exports.default = ir.router;
//# sourceMappingURL=ControlCenterRoute.js.map