"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const DocumentTypeController_1 = require("../controllers/DocumentTypeController");
class indexRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post(`${keys_1.default.basePath}document-type/add-object`, DocumentTypeController_1.documentController.addDocumentTypeObject);
        this.router.put(`${keys_1.default.basePath}document-type/update-object/:documentTypeObjectId`, DocumentTypeController_1.documentController.updateDocumentTypeObject);
        this.router.delete(`${keys_1.default.basePath}document-type/delete-object/:documentTypeObjectId`, DocumentTypeController_1.documentController.deleteDocumentTypeObject);
        this.router.get(`${keys_1.default.basePath}document-type/get-documentstypes-usertype/:userTypeId`, DocumentTypeController_1.documentController.getDocumentTypesByUserType);
        this.router.get(`${keys_1.default.basePath}document-type/get-object/:documentTypeId`, DocumentTypeController_1.documentController.getDocumentTypeObjectById);
        this.router.post(`${keys_1.default.basePath}document-type/add-type`, DocumentTypeController_1.documentController.addDocumentType);
        this.router.put(`${keys_1.default.basePath}document-type/update-type/:documentTypeId`, DocumentTypeController_1.documentController.updateDocumentType);
        this.router.delete(`${keys_1.default.basePath}document-type/delete-type/:documentTypeId`, DocumentTypeController_1.documentController.deleteDocumentType);
        this.router.get(`${keys_1.default.basePath}document-type/get-type/:documentTypeId`, DocumentTypeController_1.documentController.getDocumentType);
        // this.router.post(
        //   `${keys.basePath}document-type/get-type-by-roles`,
        //   documentController.getDocumentTypeByRoles
        // );
        this.router.get(`${keys_1.default.basePath}document-type/get-type-by-roles/:userId`, DocumentTypeController_1.documentController.getDocumentTypeByRoles);
        this.router.post(`${keys_1.default.basePath}document-type/get-type-users`, DocumentTypeController_1.documentController.getDocumentTypeUsers);
    }
}
const ir = new indexRoute();
exports.default = ir.router;
//# sourceMappingURL=DocumentTypeRoute.js.map