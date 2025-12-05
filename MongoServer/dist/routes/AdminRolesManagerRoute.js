"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminRolesManagerController_1 = require("../controllers/Admin/AdminRolesManagerController");
const AdminRoleNamesController_1 = require("../controllers/Admin/AdminRoleNamesController");
const AdminUserRolesController_1 = require("../controllers/Admin/AdminUserRolesController");
const UserRolesManagerController_1 = require("../controllers/UserRolesManagerController");
const routeHelpers_1 = require("../utils/routeHelpers");
class AdminRolesManagerRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get((0, routeHelpers_1.withBasePath)("administrator/types/role-type/get"), AdminRolesManagerController_1.adminRolesController.getSuperRoleTypes);
        this.router.post((0, routeHelpers_1.withBasePath)("administrator/types/role-type/create"), AdminRolesManagerController_1.adminRolesController.insertSuperRoleType);
        this.router.put((0, routeHelpers_1.withBasePath)("administrator/types/role-type/update"), AdminRolesManagerController_1.adminRolesController.updateSuperRoleType);
        this.router.delete((0, routeHelpers_1.withBasePath)("administrator/types/role-type/delete/:roleTypeId"), AdminRolesManagerController_1.adminRolesController.deleteSuperRoleType);
        this.router.get((0, routeHelpers_1.withBasePath)("administrator/roles/names/get"), AdminRoleNamesController_1.adminRoleNamesController.getSuperRoleNames);
        this.router.post((0, routeHelpers_1.withBasePath)("administrator/roles/names/create"), AdminRoleNamesController_1.adminRoleNamesController.insertSuperRoleName);
        this.router.put((0, routeHelpers_1.withBasePath)("administrator/roles/names/update"), AdminRoleNamesController_1.adminRoleNamesController.updateSuperRoleName);
        this.router.delete((0, routeHelpers_1.withBasePath)("administrator/roles/names/delete/:roleNameId"), AdminRoleNamesController_1.adminRoleNamesController.deleteSuperRoleName);
        this.router.get((0, routeHelpers_1.withBasePath)("administrator/users/roles"), AdminUserRolesController_1.adminUserRolesController.getSuperUserRoles);
        this.router.post((0, routeHelpers_1.withBasePath)("administrator/users/roles"), AdminUserRolesController_1.adminUserRolesController.insertSuperUserRole);
        this.router.put((0, routeHelpers_1.withBasePath)("administrator/users/roles"), AdminUserRolesController_1.adminUserRolesController.updateSuperUserRole);
        this.router.post((0, routeHelpers_1.withBasePath)("administrator/users/roles/multiple"), AdminUserRolesController_1.adminUserRolesController.insertMultipleSuperUserRoles);
        this.router.put((0, routeHelpers_1.withBasePath)("administrator/users/roles/multiple"), AdminUserRolesController_1.adminUserRolesController.updateMultipleSuperUserRoles);
        this.router.delete((0, routeHelpers_1.withBasePath)("administrator/users/roles/multiple"), UserRolesManagerController_1.userRolesManagerController.deleteSuperUserRoles);
        this.router.get((0, routeHelpers_1.withBasePath)("administrator/users/roles/multiple/:userId"), AdminUserRolesController_1.adminUserRolesController.getSuperUserRolesByUserId);
    }
}
const adminRolesManagerRoute = new AdminRolesManagerRoute();
exports.default = adminRolesManagerRoute.router;
