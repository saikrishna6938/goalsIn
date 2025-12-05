"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SearchController_1 = require("../controllers/SearchController");
const routeHelpers_1 = require("../utils/routeHelpers");
class SearchRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post((0, routeHelpers_1.withBasePath)("search-document-table"), SearchController_1.searchController.SearchDocumentTable);
    }
}
const searchRoute = new SearchRoute();
exports.default = searchRoute.router;
