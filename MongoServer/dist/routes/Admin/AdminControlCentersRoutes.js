"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routeHelpers_1 = require("../../utils/routeHelpers");
const ControlCenterController_1 = require("../../controllers/Admin/ControlCenters/ControlCenterController");
class AdminControlCenterRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.controlCenter = new ControlCenterController_1.ControlCenterController();
        this.config();
    }
    config() {
        this.router.post((0, routeHelpers_1.withBasePath)("administrator/controls"), (req, res) => this.controlCenter.create(req, res));
        this.router.put((0, routeHelpers_1.withBasePath)("administrator/controls"), (req, res) => this.controlCenter.update(req, res));
        this.router.delete((0, routeHelpers_1.withBasePath)("administrator/controls"), (req, res) => this.controlCenter.delete(req, res));
        this.router.get((0, routeHelpers_1.withBasePath)("administrator/controls"), (req, res) => this.controlCenter.getAll(req, res));
        this.router.get((0, routeHelpers_1.withBasePath)("administrator/controls/:controlCenterId"), (req, res) => this.controlCenter.getById(req, res));
    }
}
const adminControlCenterRoutes = new AdminControlCenterRoutes();
exports.default = adminControlCenterRoutes.router;
