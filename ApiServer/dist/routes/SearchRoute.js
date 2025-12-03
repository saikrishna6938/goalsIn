"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const SearchController_1 = require("../controllers/SearchController");
class SearchRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post(`${keys_1.default.basePath}search-document-table`, SearchController_1.searchController.SearchDocumentTable);
    }
}
const ir = new SearchRoute();
exports.default = ir.router;
//# sourceMappingURL=SearchRoute.js.map