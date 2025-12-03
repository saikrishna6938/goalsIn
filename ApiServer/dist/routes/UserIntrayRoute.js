"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const UserIntrayController_1 = require("../controllers/UserIntrayController");
class UserIntrayRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get(`${keys_1.default.basePath}user/intray/:userId`, UserIntrayController_1.userIntrayController.getUserIntrayDetails);
    }
}
const ir = new UserIntrayRoute();
exports.default = ir.router;
//# sourceMappingURL=UserIntrayRoute.js.map