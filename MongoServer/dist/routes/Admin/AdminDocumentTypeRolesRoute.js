"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routeHelpers_1 = require("../../utils/routeHelpers");
const AdminDocumentTypesRoles_1 = require("../../controllers/Admin/Documents/AdminDocumentTypesRoles");
class AdminDocumentTypeRolesRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.documentTypeController = new AdminDocumentTypesRoles_1.AdminDocumentTypesRolesController();
        this.config();
    }
    config() {
        this.router.get((0, routeHelpers_1.withBasePath)("administrator/document-type-roles/:documentTypeId"), (req, res) => this.documentTypeController.getDocumentTypeRoles(req, res));
        this.router.post((0, routeHelpers_1.withBasePath)("administrator/document-type-roles"), (req, res) => this.documentTypeController.addDocumentTypeRoles(req, res));
        this.router.delete((0, routeHelpers_1.withBasePath)("administrator/document-type-roles"), (req, res) => this.documentTypeController.deleteDocumentTypeRoles(req, res));
    }
}
const adminDocumentTypeRolesRoute = new AdminDocumentTypeRolesRoute();
exports.default = adminDocumentTypeRolesRoute.router;
