"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../../keys"));
const AdminDocumentTypesRoles_1 = require("../../controllers/Admin/Documents/AdminDocumentTypesRoles");
class AdminDocumentTypeRolesRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.documentTypeController = new AdminDocumentTypesRoles_1.AdminDocumentTypesRolesController();
        this.config();
    }
    config() {
        // GET roles for a document type
        this.router.get(`${keys_1.default.basePath}administrator/document-type-roles/:documentTypeId`, (req, res) => this.documentTypeController.getDocumentTypeRoles(req, res));
        // ADD roles (array)
        this.router.post(`${keys_1.default.basePath}administrator/document-type-roles`, (req, res) => this.documentTypeController.addDocumentTypeRoles(req, res));
        // DELETE roles based on roleIds + documentTypeId
        this.router.delete(`${keys_1.default.basePath}administrator/document-type-roles`, (req, res) => this.documentTypeController.deleteDocumentTypeRoles(req, res));
    }
}
const documentTypeRolesRoutes = new AdminDocumentTypeRolesRoute();
exports.default = documentTypeRolesRoutes.router;
//# sourceMappingURL=AdminDocumentTypeRolesRoute.js.map