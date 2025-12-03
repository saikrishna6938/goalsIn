"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const RolesController_1 = require("../controllers/RolesController");
class RolesRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post(`${keys_1.default.basePath}roles/add-role`, RolesController_1.rolescontroller.addRole);
        this.router.put(`${keys_1.default.basePath}roles/update-role/:roleId`, RolesController_1.rolescontroller.updateRole);
        this.router.delete(`${keys_1.default.basePath}roles/delete-role/:roleId`, RolesController_1.rolescontroller.deleteRole);
        this.router.get(`${keys_1.default.basePath}roles/get-roles`, RolesController_1.rolescontroller.getRoles);
        this.router.get(`${keys_1.default.basePath}roles/get-role/:roleId`, RolesController_1.rolescontroller.getRolesById);
        this.router.post(`${keys_1.default.basePath}roles/add-roletype`, RolesController_1.rolescontroller.addRoleType);
        this.router.put(`${keys_1.default.basePath}roles/update-roletype/:roleTypeId`, RolesController_1.rolescontroller.updateRoleType);
        this.router.delete(`${keys_1.default.basePath}roles/delete-roletype/:roleTypeId`, RolesController_1.rolescontroller.deleteRoleType);
        this.router.get(`${keys_1.default.basePath}roles/get-roletypes`, RolesController_1.rolescontroller.getRoleTypes);
    }
}
const rolesRoute = new RolesRoute();
exports.default = rolesRoute.router;
//# sourceMappingURL=RolesRoute.js.map