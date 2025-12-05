"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserIntrayController_1 = require("../controllers/UserIntrayController");
const routeHelpers_1 = require("../utils/routeHelpers");
class UserIntrayRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get((0, routeHelpers_1.withBasePath)("user/intray/:userId"), UserIntrayController_1.userIntrayController.getUserIntrayDetails);
    }
}
const userIntrayRoute = new UserIntrayRoute();
exports.default = userIntrayRoute.router;
