"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RolesController_1 = require("../controllers/RolesController");
const routeHelpers_1 = require("../utils/routeHelpers");
class RolesRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post((0, routeHelpers_1.withBasePath)("roles/add-role"), RolesController_1.rolesController.addRole);
        this.router.put((0, routeHelpers_1.withBasePath)("roles/update-role/:roleId"), RolesController_1.rolesController.updateRole);
        this.router.delete((0, routeHelpers_1.withBasePath)("roles/delete-role/:roleId"), RolesController_1.rolesController.deleteRole);
        this.router.get((0, routeHelpers_1.withBasePath)("roles/get-roles"), RolesController_1.rolesController.getRoles);
        this.router.get((0, routeHelpers_1.withBasePath)("roles/get-role/:roleId"), RolesController_1.rolesController.getRolesById);
        this.router.post((0, routeHelpers_1.withBasePath)("roles/add-roletype"), RolesController_1.rolesController.addRoleType);
        this.router.put((0, routeHelpers_1.withBasePath)("roles/update-roletype/:roleTypeId"), RolesController_1.rolesController.updateRoleType);
        this.router.delete((0, routeHelpers_1.withBasePath)("roles/delete-roletype/:roleTypeId"), RolesController_1.rolesController.deleteRoleType);
        this.router.get((0, routeHelpers_1.withBasePath)("roles/get-roletypes"), RolesController_1.rolesController.getRoleTypes);
    }
}
const rolesRoute = new RolesRoute();
exports.default = rolesRoute.router;
