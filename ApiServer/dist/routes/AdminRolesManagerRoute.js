"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const AdminRolesManager_1 = require("../controllers/RolesControllers/AdminRolesManager");
const AdminRoleNamesController_1 = require("../controllers/RolesControllers/AdminRoleNamesController");
const AdminUserRolesController_1 = require("../controllers/RolesControllers/AdminUserRolesController");
const UserRolesManagerController_1 = require("../controllers/RolesControllers/UserRolesManagerController");
class AdminRolesManagerRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get(`${keys_1.default.basePath}administrator/types/role-type/get`, AdminRolesManager_1.adminRolesController.getSuperRoleTypes);
        this.router.post(`${keys_1.default.basePath}administrator/types/role-type/create`, AdminRolesManager_1.adminRolesController.insertSuperRoleType);
        this.router.put(`${keys_1.default.basePath}administrator/types/role-type/update`, AdminRolesManager_1.adminRolesController.updateSuperRoleType);
        this.router.delete(`${keys_1.default.basePath}administrator/types/role-type/delete/:roleTypeId`, AdminRolesManager_1.adminRolesController.deleteSuperRoleType);
        //RoleNames
        this.router.get(`${keys_1.default.basePath}administrator/roles/names/get`, AdminRoleNamesController_1.adminRoleNamesController.getSuperRoleNames);
        this.router.post(`${keys_1.default.basePath}administrator/roles/names/create`, AdminRoleNamesController_1.adminRoleNamesController.insertSuperRoleName);
        this.router.put(`${keys_1.default.basePath}administrator/roles/names/update`, AdminRoleNamesController_1.adminRoleNamesController.updateSuperRoleName);
        this.router.delete(`${keys_1.default.basePath}administrator/roles/names/delete/:roleNameId`, AdminRoleNamesController_1.adminRoleNamesController.deleteSuperRoleName);
        //User Role Names
        this.router.get(`${keys_1.default.basePath}administrator/users/roles`, AdminUserRolesController_1.adminUserRolesController.getSuperUserRoles);
        this.router.post(`${keys_1.default.basePath}administrator/users/roles`, AdminUserRolesController_1.adminUserRolesController.insertSuperUserRole);
        this.router.put(`${keys_1.default.basePath}administrator/users/roles`, AdminUserRolesController_1.adminUserRolesController.updateSuperUserRole);
        // this.router.delete(
        //   `${keys.basePath}administrator/users/roles/:superUserRoleId`,
        //   adminUserRolesController.deleteSuperUserRole
        // );
        //User Roles Multiple Update
        this.router.post(`${keys_1.default.basePath}administrator/users/roles/multiple`, AdminUserRolesController_1.adminUserRolesController.insertMultipleSuperUserRoles);
        this.router.put(`${keys_1.default.basePath}administrator/users/roles/multiple`, AdminUserRolesController_1.adminUserRolesController.updateMultipleSuperUserRoles);
        this.router.delete(`${keys_1.default.basePath}administrator/users/roles/multiple`, UserRolesManagerController_1.userRolesManagerController.deleteSuperUserRoles);
        //Get user roles
        this.router.get(`${keys_1.default.basePath}administrator/users/roles/multiple/:userId`, UserRolesManagerController_1.userRolesManagerController.getSuperUserRoles);
    }
}
const ir = new AdminRolesManagerRoute();
exports.default = ir.router;
//# sourceMappingURL=AdminRolesManagerRoute.js.map