"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routeHelpers_1 = require("../../utils/routeHelpers");
const FormsController_1 = require("../../controllers/Admin/Forms/FormsController");
class AdminFormRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.formController = new FormsController_1.FormController();
        this.config();
    }
    config() {
        this.router.post((0, routeHelpers_1.withBasePath)("administrator/forms"), (req, res) => this.formController.create(req, res));
        this.router.put((0, routeHelpers_1.withBasePath)("administrator/forms"), (req, res) => this.formController.update(req, res));
        this.router.delete((0, routeHelpers_1.withBasePath)("administrator/forms/:documentTypeObjectId"), (req, res) => this.formController.delete(req, res));
        this.router.get((0, routeHelpers_1.withBasePath)("administrator/forms"), (req, res) => this.formController.getAll(req, res));
        this.router.get((0, routeHelpers_1.withBasePath)("administrator/forms/:documentTypeObjectId"), (req, res) => this.formController.getById(req, res));
    }
}
const adminFormRoutes = new AdminFormRoutes();
exports.default = adminFormRoutes.router;
