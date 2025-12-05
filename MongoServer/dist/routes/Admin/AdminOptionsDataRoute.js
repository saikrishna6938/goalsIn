"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routeHelpers_1 = require("../../utils/routeHelpers");
const AdminOptionsController_1 = require("../../controllers/Admin/OptionsData/AdminOptionsController");
class AdminOptionsRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        const base = (0, routeHelpers_1.withBasePath)("administrator/options");
        this.router.post(base, (req, res) => AdminOptionsController_1.adminOptionsController.createOption(req, res));
        this.router.get(base, (req, res) => AdminOptionsController_1.adminOptionsController.getOptions(req, res));
        this.router.delete(`${base}/:optionId`, (req, res) => AdminOptionsController_1.adminOptionsController.deleteOption(req, res));
        this.router.put(`${base}/:optionId`, (req, res) => AdminOptionsController_1.adminOptionsController.updateOption(req, res));
        this.router.get(`${base}/label/:optionName`, (req, res) => AdminOptionsController_1.adminOptionsController.getOptionDataByLabelName(req, res));
        this.router.get(`${base}/:optionId`, (req, res) => AdminOptionsController_1.adminOptionsController.getOptionsByID(req, res));
        this.router.get(`${base}/by-label`, (req, res) => AdminOptionsController_1.adminOptionsController.getOptionsDataByValueLabel(req, res));
        this.router.get(`${base}/value-labels/:entityId`, (req, res) => AdminOptionsController_1.adminOptionsController.getValueLabelsByEntityId(req, res));
        this.router.post(`${base}/structure-value`, (req, res) => AdminOptionsController_1.adminOptionsController.createStructureOptionValue(req, res));
        this.router.put(`${base}/structure-value/:id`, (req, res) => AdminOptionsController_1.adminOptionsController.updateStructureOptionValue(req, res));
        this.router.delete(`${base}/structure-value/:id`, (req, res) => AdminOptionsController_1.adminOptionsController.deleteStructureOptionValue(req, res));
        this.router.get(`${base}/structure-values/values`, (req, res) => AdminOptionsController_1.adminOptionsController.getAllStructureOptionValues(req, res));
        this.router.get(`${base}/structure-values/values/:id`, (req, res) => AdminOptionsController_1.adminOptionsController.getStructureOptionValueById(req, res));
    }
}
const adminOptionsRoute = new AdminOptionsRoute();
exports.default = adminOptionsRoute.router;
