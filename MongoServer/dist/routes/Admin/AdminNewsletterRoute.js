"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routeHelpers_1 = require("../../utils/routeHelpers");
const AdminNewslettersController_1 = require("../../controllers/Admin/Newsletters/AdminNewslettersController");
class AdminNewsletterRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.newsletter = new AdminNewslettersController_1.AdminNewslettersController();
        this.config();
    }
    config() {
        const base = (0, routeHelpers_1.withBasePath)("administrator/newsletters");
        this.router.post(base, (req, res) => this.newsletter.addNewsletters(req, res));
        this.router.put(base, (req, res) => this.newsletter.updateNewsletter(req, res));
        this.router.delete(base, (req, res) => this.newsletter.deleteNewsletters(req, res));
        this.router.get(base, (req, res) => this.newsletter.getNewsletters(req, res));
        this.router.get(`${base}/types`, (req, res) => this.newsletter.getNewsletterTypes(req, res));
        this.router.put(`${base}/types`, (req, res) => this.newsletter.updateNewsletterType(req, res));
        this.router.post(`${base}/types`, (req, res) => this.newsletter.addNewsletterTypes(req, res));
        this.router.delete(`${base}/types`, (req, res) => this.newsletter.deleteNewsletterTypes(req, res));
        this.router.get(`${base}/:newslettersId`, (req, res) => this.newsletter.getById(req, res));
    }
}
const adminNewsletterRoute = new AdminNewsletterRoute();
exports.default = adminNewsletterRoute.router;
