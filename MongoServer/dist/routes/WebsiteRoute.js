"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const WebsiteController_1 = require("../controllers/WebsiteController");
const IndexController_1 = require("../controllers/IndexController");
const routeHelpers_1 = require("../utils/routeHelpers");
class WebsiteRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get((0, routeHelpers_1.withBasePath)("get-document-groups"), WebsiteController_1.websiteController.getDocumentGroups);
        this.router.post((0, routeHelpers_1.withBasePath)("search-details"), WebsiteController_1.websiteController.searchDetails);
        this.router.get((0, routeHelpers_1.withBasePath)("user/document-tags/:id"), IndexController_1.indexController.getDocumentTagById);
    }
}
const websiteRoute = new WebsiteRoute();
exports.default = websiteRoute.router;
