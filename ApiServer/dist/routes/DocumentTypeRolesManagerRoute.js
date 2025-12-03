"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const DocumentTypeRoleController_1 = require("../controllers/RolesControllers/DocumentTypeRoleController");
class DocumentTypeRolesManagerRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get(`${keys_1.default.basePath}administrator/document/roles`, DocumentTypeRoleController_1.documentTypeRoleController.getDocumentTypeRoles);
        this.router.post(`${keys_1.default.basePath}administrator/document/roles`, DocumentTypeRoleController_1.documentTypeRoleController.insertDocumentTypeRole);
        this.router.put(`${keys_1.default.basePath}administrator/document/roles`, DocumentTypeRoleController_1.documentTypeRoleController.updateDocumentTypeRole);
        this.router.delete(`${keys_1.default.basePath}administrator/document/roles/:documentTypeRoleId`, DocumentTypeRoleController_1.documentTypeRoleController.deleteDocumentTypeRole);
        this.router.get(`${keys_1.default.basePath}administrator/user/document-types/:userId/:typeId`, DocumentTypeRoleController_1.documentTypeRoleController.getUserDocumentTypes);
        this.router.get(`${keys_1.default.basePath}user/document-types/:userId/:typeId`, DocumentTypeRoleController_1.documentTypeRoleController.getUserDocumentTypes);
        this.router.get(`${keys_1.default.basePath}administrator/user/document-types/:userId/:roleTypeId`, DocumentTypeRoleController_1.documentTypeRoleController.getFilteredDocumentTypes);
    }
}
const ir = new DocumentTypeRolesManagerRoute();
exports.default = ir.router;
//# sourceMappingURL=DocumentTypeRolesManagerRoute.js.map