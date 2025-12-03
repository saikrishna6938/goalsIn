"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../../keys"));
const AdminDocumentTypesController_1 = require("../../controllers/Admin/Documents/AdminDocumentTypesController");
class AdminDocumentTypeRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.documentTypeController = new AdminDocumentTypesController_1.AdminDocumentTypesController();
        this.config();
    }
    config() {
        // DocumentType Routes
        this.router.post(`${keys_1.default.basePath}administrator/document-types`, (req, res) => this.documentTypeController.addDocumentType(req, res));
        this.router.put(`${keys_1.default.basePath}administrator/document-types/:documentTypeId`, (req, res) => this.documentTypeController.editDocumentType(req, res));
        this.router.delete(`${keys_1.default.basePath}administrator/document-types/:documentTypeId`, (req, res) => this.documentTypeController.deleteDocumentType(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/document-types`, (req, res) => this.documentTypeController.getAllDocumentTypes(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/document-types/:documentTypeId`, (req, res) => this.documentTypeController.getSingleDocumentType(req, res));
        // DocumentGroup Routes
        this.router.post(`${keys_1.default.basePath}administrator/document-groups`, (req, res) => this.documentTypeController.addDocumentGroup(req, res));
        this.router.put(`${keys_1.default.basePath}administrator/document-groups/:documentGroupId`, (req, res) => this.documentTypeController.editDocumentGroup(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/document-groups`, (req, res) => this.documentTypeController.getAllDocumentGroups(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/document-groups/:documentGroupId`, (req, res) => this.documentTypeController.getSingleDocumentGroup(req, res));
        this.router.delete(`${keys_1.default.basePath}administrator/document-groups/:documentGroupId`, (req, res) => this.documentTypeController.deleteDocumentGroup(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/document-group-types`, (req, res) => this.documentTypeController.getDocumentGroupTypes(req, res));
    }
}
const documentTypeRoutes = new AdminDocumentTypeRoute();
exports.default = documentTypeRoutes.router;
//# sourceMappingURL=AdminDocumentTypeRoutes.js.map