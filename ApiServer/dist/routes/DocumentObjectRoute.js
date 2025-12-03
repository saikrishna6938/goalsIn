"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const DocumentObjectController_1 = require("../controllers/DocumentObjectController");
class DocumentObjectRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        // POST /api/document/object-by-task
        this.router.post(`${keys_1.default.basePath}document/object-by-task`, (req, res) => DocumentObjectController_1.documentObjectController.getByTaskId(req, res));
    }
}
const route = new DocumentObjectRoute();
exports.default = route.router;
//# sourceMappingURL=DocumentObjectRoute.js.map