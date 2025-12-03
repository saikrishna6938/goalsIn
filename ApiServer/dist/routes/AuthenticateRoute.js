"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const AuthenticateController_1 = require("../controllers/AuthenticateController");
const UserRolesManagerController_1 = require("../controllers/RolesControllers/UserRolesManagerController");
class AuthenticateRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post(`${keys_1.default.basePath}login`, AuthenticateController_1.authController.login);
        this.router.post(`${keys_1.default.basePath}check-token`, AuthenticateController_1.authController.loginWithAccessToken);
        this.router.post(`${keys_1.default.basePath}forgot-password`, AuthenticateController_1.authController.forgotPassword);
        this.router.post(`${keys_1.default.basePath}forgot-password-email`, AuthenticateController_1.authController.forgotPasswordEmail);
        this.router.post(`${keys_1.default.basePath}reset-password`, AuthenticateController_1.authController.resetPasswordFrontEnd);
        this.router.post(`${keys_1.default.basePath}create-user/:entityId`, AuthenticateController_1.authController.register);
        this.router.get(`${keys_1.default.basePath}get-all-users/:entityId`, UserRolesManagerController_1.userRolesManagerController.getUsersByEntityId);
        this.router.get(`${keys_1.default.basePath}get-user-all/:entityId/:userType`, AuthenticateController_1.authController.getAllUsers);
        this.router.get(`${keys_1.default.basePath}job/users/:entityId/:userType`, UserRolesManagerController_1.userRolesManagerController.getusersforjob);
    }
}
const authenticateRoute = new AuthenticateRoute();
exports.default = authenticateRoute.router;
//# sourceMappingURL=AuthenticateRoute.js.map