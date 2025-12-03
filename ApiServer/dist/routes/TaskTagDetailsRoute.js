"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const TaskTagDetails_1 = require("../controllers/TaskTagDetails");
class TaskTagDetailsRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get(`${keys_1.default.basePath}task/tagDetails/:taskTagTableId/:taskTagId`, TaskTagDetails_1.taskTagDetailController.getTaskTagDetails);
        this.router.get(`${keys_1.default.basePath}task/search-tags/:taskTagTableId`, TaskTagDetails_1.taskTagDetailController.getSearchTagDetails);
    }
}
const ir = new TaskTagDetailsRoute();
exports.default = ir.router;
//# sourceMappingURL=TaskTagDetailsRoute.js.map