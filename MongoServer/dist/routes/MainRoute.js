"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MainController_1 = require("../controllers/MainController");
const routeHelpers_1 = require("../utils/routeHelpers");
class MainRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post((0, routeHelpers_1.withBasePath)("user-details"), MainController_1.mainController.getUser);
    }
}
const mainRoute = new MainRoute();
exports.default = mainRoute.router;
