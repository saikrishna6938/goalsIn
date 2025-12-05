"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DocumentTypeRoleController_1 = require("../controllers/RolesControllers/DocumentTypeRoleController");
const routeHelpers_1 = require("../utils/routeHelpers");
class DocumentTypeRolesManagerRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get((0, routeHelpers_1.withBasePath)("administrator/document/roles"), DocumentTypeRoleController_1.documentTypeRoleController.getDocumentTypeRoles);
        this.router.post((0, routeHelpers_1.withBasePath)("administrator/document/roles"), DocumentTypeRoleController_1.documentTypeRoleController.insertDocumentTypeRole);
        this.router.put((0, routeHelpers_1.withBasePath)("administrator/document/roles"), DocumentTypeRoleController_1.documentTypeRoleController.updateDocumentTypeRole);
        this.router.delete((0, routeHelpers_1.withBasePath)("administrator/document/roles/:documentTypeRoleId"), DocumentTypeRoleController_1.documentTypeRoleController.deleteDocumentTypeRole);
        this.router.get((0, routeHelpers_1.withBasePath)("administrator/user/document-types/:userId/:typeId"), DocumentTypeRoleController_1.documentTypeRoleController.getUserDocumentTypes);
        this.router.get((0, routeHelpers_1.withBasePath)("user/document-types/:userId/:typeId"), DocumentTypeRoleController_1.documentTypeRoleController.getUserDocumentTypes);
        this.router.get((0, routeHelpers_1.withBasePath)("administrator/user/document-types/:userId/:roleTypeId"), DocumentTypeRoleController_1.documentTypeRoleController.getFilteredDocumentTypes);
    }
}
const documentTypeRolesManagerRoute = new DocumentTypeRolesManagerRoute();
exports.default = documentTypeRolesManagerRoute.router;
