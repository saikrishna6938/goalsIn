"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TaskTagDetailsController_1 = require("../controllers/TaskTagDetailsController");
const routeHelpers_1 = require("../utils/routeHelpers");
class TaskTagDetailsRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get((0, routeHelpers_1.withBasePath)("task/tagDetails/:taskTagTableId/:taskTagId"), TaskTagDetailsController_1.taskTagDetailController.getTaskTagDetails);
        this.router.get((0, routeHelpers_1.withBasePath)("task/search-tags/:taskTagTableId"), TaskTagDetailsController_1.taskTagDetailController.getSearchTagDetails);
    }
}
const taskTagDetailsRoute = new TaskTagDetailsRoute();
exports.default = taskTagDetailsRoute.router;
