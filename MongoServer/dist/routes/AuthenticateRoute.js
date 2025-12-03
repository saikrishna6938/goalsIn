"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthenticateController_1 = require("../controllers/AuthenticateController");
const UserRolesManagerController_1 = require("../controllers/UserRolesManagerController");
const routeHelpers_1 = require("../utils/routeHelpers");
class AuthenticateRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post((0, routeHelpers_1.withBasePath)("login"), AuthenticateController_1.authController.login);
        this.router.post((0, routeHelpers_1.withBasePath)("check-token"), AuthenticateController_1.authController.loginWithAccessToken);
        this.router.post((0, routeHelpers_1.withBasePath)("forgot-password"), AuthenticateController_1.authController.forgotPassword);
        this.router.post((0, routeHelpers_1.withBasePath)("forgot-password-email"), AuthenticateController_1.authController.forgotPasswordEmail);
        this.router.post((0, routeHelpers_1.withBasePath)("reset-password"), AuthenticateController_1.authController.resetPasswordFrontEnd);
        this.router.post((0, routeHelpers_1.withBasePath)("create-user/:entityId"), AuthenticateController_1.authController.register);
        this.router.get((0, routeHelpers_1.withBasePath)("get-all-users/:entityId"), UserRolesManagerController_1.userRolesManagerController.getUsersByEntityId);
        this.router.get((0, routeHelpers_1.withBasePath)("get-user-all/:entityId/:userType"), AuthenticateController_1.authController.getAllUsers);
        this.router.get((0, routeHelpers_1.withBasePath)("job/users/:entityId/:userType"), UserRolesManagerController_1.userRolesManagerController.getusersforjob);
    }
}
const authenticateRoute = new AuthenticateRoute();
exports.default = authenticateRoute.router;
