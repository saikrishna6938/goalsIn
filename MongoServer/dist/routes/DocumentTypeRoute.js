"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DocumentTypeController_1 = require("../controllers/DocumentTypeController");
const routeHelpers_1 = require("../utils/routeHelpers");
class DocumentTypeRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post((0, routeHelpers_1.withBasePath)("document-type/add-object"), DocumentTypeController_1.documentController.addDocumentTypeObject);
        this.router.put((0, routeHelpers_1.withBasePath)("document-type/update-object/:documentTypeObjectId"), DocumentTypeController_1.documentController.updateDocumentTypeObject);
        this.router.delete((0, routeHelpers_1.withBasePath)("document-type/delete-object/:documentTypeObjectId"), DocumentTypeController_1.documentController.deleteDocumentTypeObject);
        this.router.get((0, routeHelpers_1.withBasePath)("document-type/get-documentstypes-usertype/:userTypeId"), DocumentTypeController_1.documentController.getDocumentTypesByUserType);
        this.router.get((0, routeHelpers_1.withBasePath)("document-type/get-object/:documentTypeId"), DocumentTypeController_1.documentController.getDocumentTypeObjectById);
        this.router.post((0, routeHelpers_1.withBasePath)("document-type/add-type"), DocumentTypeController_1.documentController.addDocumentType);
        this.router.put((0, routeHelpers_1.withBasePath)("document-type/update-type/:documentTypeId"), DocumentTypeController_1.documentController.updateDocumentType);
        this.router.delete((0, routeHelpers_1.withBasePath)("document-type/delete-type/:documentTypeId"), DocumentTypeController_1.documentController.deleteDocumentType);
        this.router.get((0, routeHelpers_1.withBasePath)("document-type/get-type/:documentTypeId"), DocumentTypeController_1.documentController.getDocumentType);
        this.router.get((0, routeHelpers_1.withBasePath)("document-type/get-type-by-roles/:userId"), DocumentTypeController_1.documentController.getDocumentTypeByRoles);
        this.router.post((0, routeHelpers_1.withBasePath)("document-type/get-type-users"), DocumentTypeController_1.documentController.getDocumentTypeUsers);
    }
}
const documentTypeRoute = new DocumentTypeRoute();
exports.default = documentTypeRoute.router;
