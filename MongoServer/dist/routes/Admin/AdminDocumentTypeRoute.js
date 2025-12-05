"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminDocumentTypesController_1 = require("../../controllers/Admin/Documents/AdminDocumentTypesController");
const routeHelpers_1 = require("../../utils/routeHelpers");
class AdminDocumentTypeRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.documentTypeController = new AdminDocumentTypesController_1.AdminDocumentTypesController();
        this.config();
    }
    config() {
        this.router.post((0, routeHelpers_1.withBasePath)("administrator/document-types"), (req, res) => this.documentTypeController.addDocumentType(req, res));
        this.router.put((0, routeHelpers_1.withBasePath)("administrator/document-types/:documentTypeId"), (req, res) => this.documentTypeController.editDocumentType(req, res));
        this.router.delete((0, routeHelpers_1.withBasePath)("administrator/document-types/:documentTypeId"), (req, res) => this.documentTypeController.deleteDocumentType(req, res));
        this.router.get((0, routeHelpers_1.withBasePath)("administrator/document-types"), (req, res) => this.documentTypeController.getAllDocumentTypes(req, res));
        this.router.get((0, routeHelpers_1.withBasePath)("administrator/document-types/:documentTypeId"), (req, res) => this.documentTypeController.getSingleDocumentType(req, res));
        this.router.post((0, routeHelpers_1.withBasePath)("administrator/document-groups"), (req, res) => this.documentTypeController.addDocumentGroup(req, res));
        this.router.put((0, routeHelpers_1.withBasePath)("administrator/document-groups/:documentGroupId"), (req, res) => this.documentTypeController.editDocumentGroup(req, res));
        this.router.delete((0, routeHelpers_1.withBasePath)("administrator/document-groups/:documentGroupId"), (req, res) => this.documentTypeController.deleteDocumentGroup(req, res));
        this.router.get((0, routeHelpers_1.withBasePath)("administrator/document-groups"), (req, res) => this.documentTypeController.getAllDocumentGroups(req, res));
        this.router.get((0, routeHelpers_1.withBasePath)("administrator/document-groups/:documentGroupId"), (req, res) => this.documentTypeController.getSingleDocumentGroup(req, res));
        this.router.get((0, routeHelpers_1.withBasePath)("administrator/document-group-types"), (req, res) => this.documentTypeController.getDocumentGroupTypes(req, res));
    }
}
const adminDocumentTypeRoute = new AdminDocumentTypeRoute();
exports.default = adminDocumentTypeRoute.router;
