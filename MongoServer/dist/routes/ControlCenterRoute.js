"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ControlCenterController_1 = require("../controllers/ControlCenterController");
const routeHelpers_1 = require("../utils/routeHelpers");
class ControlCenterRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post((0, routeHelpers_1.withBasePath)("outstainding-tasks"), ControlCenterController_1.controCenterController.GetEntityTasks);
    }
}
const controlCenterRoutes = new ControlCenterRoutes();
exports.default = controlCenterRoutes.router;
