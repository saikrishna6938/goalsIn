"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../../keys"));
const FormsController_1 = require("../../controllers/Admin/Forms/FormsController");
class AdminFormRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.formControler = new FormsController_1.FormController();
        this.config();
    }
    config() {
        this.router.post(`${keys_1.default.basePath}administrator/forms`, (req, res) => this.formControler.create(req, res));
        this.router.put(`${keys_1.default.basePath}administrator/forms`, (req, res) => this.formControler.update(req, res));
        this.router.delete(`${keys_1.default.basePath}administrator/forms/:documentTypeObjectId`, (req, res) => this.formControler.delete(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/forms`, (req, res) => this.formControler.getAll(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/forms/:documentTypeObjectId`, (req, res) => this.formControler.getById(req, res));
    }
}
const adminFormRoutes = new AdminFormRoutes();
exports.default = adminFormRoutes.router;
//# sourceMappingURL=AdminFormRoutes.js.map