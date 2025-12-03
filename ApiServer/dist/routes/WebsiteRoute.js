"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const IndexController_1 = require("../controllers/IndexController");
const keys_1 = __importDefault(require("../keys"));
const GlobalController_1 = require("../controllers/GlobalController");
const SearchWebController_1 = require("../controllers/SearchWebController");
class WebsiteRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get(`${keys_1.default.basePath}get-document-groups`, GlobalController_1.globalController.getDocumentGroups);
        this.router.post(`${keys_1.default.basePath}search-details`, SearchWebController_1.searchWebController.SearchDocumentTable);
        this.router.get(`${keys_1.default.basePath}user/document-tags/:id`, IndexController_1.indexcontroller.getDocumentTagById);
    }
}
const ir = new WebsiteRoute();
exports.default = ir.router;
//# sourceMappingURL=WebsiteRoute.js.map