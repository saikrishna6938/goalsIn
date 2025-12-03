"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../../keys"));
const ControlCenterController_1 = require("../../controllers/Admin/ControlCenters/ControlCenterController");
class AdminControlCenterRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.controlCenter = new ControlCenterController_1.ControlCenterController();
        this.config();
    }
    config() {
        this.router.post(`${keys_1.default.basePath}administrator/controls`, (req, res) => this.controlCenter.create(req, res));
        this.router.put(`${keys_1.default.basePath}administrator/controls`, (req, res) => this.controlCenter.update(req, res));
        this.router.delete(`${keys_1.default.basePath}administrator/controls`, (req, res) => this.controlCenter.delete(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/controls`, (req, res) => this.controlCenter.getAll(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/controls/:controlCenterId`, (req, res) => this.controlCenter.getById(req, res));
    }
}
const routes = new AdminControlCenterRoutes();
exports.default = routes.router;
//# sourceMappingURL=AdminControlCentersRoutes.js.map