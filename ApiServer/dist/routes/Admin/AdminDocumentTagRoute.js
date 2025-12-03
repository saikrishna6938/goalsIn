"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../../keys"));
const AdminDocumentTagController_1 = require("../../controllers/Admin/Documents/AdminDocumentTagController");
class AdminDocumentTagRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        const base = `${keys_1.default.basePath}administrator/document-tags`;
        // Create a new document tag
        this.router.post(`${base}`, (req, res) => AdminDocumentTagController_1.adminDocumentTagController.createDocumentTag(req, res));
        // Get all document tags
        this.router.get(`${base}`, (req, res) => AdminDocumentTagController_1.adminDocumentTagController.getAllDocumentTags(req, res));
        // Update a document tag by ID
        this.router.put(`${base}/:id`, (req, res) => AdminDocumentTagController_1.adminDocumentTagController.updateDocumentTag(req, res));
        // Delete a document tag by ID
        this.router.delete(`${base}/:id`, (req, res) => AdminDocumentTagController_1.adminDocumentTagController.deleteDocumentTag(req, res));
        this.router.get(`${base}/:id`, (req, res) => AdminDocumentTagController_1.adminDocumentTagController.getDocumentTagById(req, res));
    }
}
const adminDocumentTagRoute = new AdminDocumentTagRoute();
exports.default = adminDocumentTagRoute.router;
//# sourceMappingURL=AdminDocumentTagRoute.js.map