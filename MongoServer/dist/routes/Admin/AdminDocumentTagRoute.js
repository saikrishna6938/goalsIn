"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routeHelpers_1 = require("../../utils/routeHelpers");
const AdminDocumentTagController_1 = require("../../controllers/Admin/Documents/AdminDocumentTagController");
class AdminDocumentTagRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        const base = (0, routeHelpers_1.withBasePath)("administrator/document-tags");
        this.router.post(base, (req, res) => AdminDocumentTagController_1.adminDocumentTagController.createDocumentTag(req, res));
        this.router.get(base, (req, res) => AdminDocumentTagController_1.adminDocumentTagController.getAllDocumentTags(req, res));
        this.router.put(`${base}/:id`, (req, res) => AdminDocumentTagController_1.adminDocumentTagController.updateDocumentTag(req, res));
        this.router.delete(`${base}/:id`, (req, res) => AdminDocumentTagController_1.adminDocumentTagController.deleteDocumentTag(req, res));
        this.router.get(`${base}/:id`, (req, res) => AdminDocumentTagController_1.adminDocumentTagController.getDocumentTagById(req, res));
    }
}
const adminDocumentTagRoute = new AdminDocumentTagRoute();
exports.default = adminDocumentTagRoute.router;
