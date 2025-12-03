"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../../keys"));
const AdminNewslettersController_1 = require("../../controllers/Admin/Newsletters/AdminNewslettersController");
class AdminNewsletterRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.newsletter = new AdminNewslettersController_1.AdminNewslettersController();
        this.config();
    }
    config() {
        this.router.post(`${keys_1.default.basePath}administrator/newsletters`, (req, res) => this.newsletter.addNewsletters(req, res));
        this.router.put(`${keys_1.default.basePath}administrator/newsletters`, (req, res) => this.newsletter.updateNewsletter(req, res));
        this.router.delete(`${keys_1.default.basePath}administrator/newsletters`, (req, res) => this.newsletter.deleteNewsletters(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/newsletters`, (req, res) => this.newsletter.getNewsletters(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/newsletters/types`, (req, res) => this.newsletter.getNewsletterTypes(req, res));
        this.router.put(`${keys_1.default.basePath}administrator/newsletters/types`, (req, res) => this.newsletter.updateNewsletterType(req, res));
        this.router.post(`${keys_1.default.basePath}administrator/newsletters`, (req, res) => this.newsletter.addNewsletterTypes(req, res));
        this.router.delete(`${keys_1.default.basePath}administrator/newsletters`, (req, res) => this.newsletter.deleteNewsletterTypes(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/newsletters/:newslettersId`, (req, res) => this.newsletter.getById(req, res));
    }
}
const routes = new AdminNewsletterRoute();
exports.default = routes.router;
//# sourceMappingURL=AdminNewsletterRoute.js.map