"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../../keys"));
const SettingNamesController_1 = require("../../controllers/Admin/ProfileSettings/SettingNamesController");
const SubProfileTypesController_1 = require("../../controllers/Admin/ProfileSettings/SubProfileTypesController");
const SubProfileSettingsController_1 = require("../../controllers/Admin/ProfileSettings/SubProfileSettingsController");
const UserSubProfileTypesController_1 = require("../../controllers/Admin/ProfileSettings/UserSubProfileTypesController");
class AdminUserSettingsTypesRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.userSettingsCtrl = new SettingNamesController_1.AdminUserSettingsTypesController();
        this.subProfileCtrl = new SubProfileTypesController_1.AdminSubProfileTypesController();
        this.subProfileSettingsCtrl = new SubProfileSettingsController_1.AdminSubProfileSettingsController();
        this.userSubProfileCtrl = new UserSubProfileTypesController_1.AdminUserSubProfileTypesController();
        this.config();
    }
    config() {
        /**
         * UserSettingsTypes Routes
         */
        this.router.post(`${keys_1.default.basePath}administrator/user-settings-types`, (req, res) => this.userSettingsCtrl.addUserSettingsType(req, res));
        this.router.put(`${keys_1.default.basePath}administrator/user-settings-types/:id`, (req, res) => this.userSettingsCtrl.editUserSettingsType(req, res));
        this.router.delete(`${keys_1.default.basePath}administrator/user-settings-types/:id`, (req, res) => this.userSettingsCtrl.deleteUserSettingsType(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/user-settings-types`, (req, res) => this.userSettingsCtrl.getAllUserSettingsTypes(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/user-settings-types/:id`, (req, res) => this.userSettingsCtrl.getSingleUserSettingsType(req, res));
        /**
         * SubProfileTypes Routes
         */
        this.router.post(`${keys_1.default.basePath}administrator/sub-profile-types`, (req, res) => this.subProfileCtrl.addSubProfileType(req, res));
        this.router.put(`${keys_1.default.basePath}administrator/sub-profile-types/:subProfileId`, (req, res) => this.subProfileCtrl.editSubProfileType(req, res));
        this.router.delete(`${keys_1.default.basePath}administrator/sub-profile-types/:subProfileId`, (req, res) => this.subProfileCtrl.deleteSubProfileType(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/sub-profile-types`, (req, res) => this.subProfileCtrl.getAllSubProfileTypes(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/sub-profile-types/:subProfileId`, (req, res) => this.subProfileCtrl.getSingleSubProfileType(req, res));
        /**
         * SubProfileSettings Routes
         */
        this.router.post(`${keys_1.default.basePath}administrator/sub-profile-settings`, (req, res) => this.subProfileSettingsCtrl.addSubProfileSetting(req, res));
        this.router.put(`${keys_1.default.basePath}administrator/sub-profile-settings/:profileSettingsId`, (req, res) => this.subProfileSettingsCtrl.editSubProfileSetting(req, res));
        this.router.delete(`${keys_1.default.basePath}administrator/sub-profile-settings/:profileSettingsId`, (req, res) => this.subProfileSettingsCtrl.deleteSubProfileSetting(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/sub-profile-settings`, (req, res) => this.subProfileSettingsCtrl.getAllSubProfileSettings(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/sub-profile-settings/:profileSettingsId`, (req, res) => this.subProfileSettingsCtrl.getSingleSubProfileSetting(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/sub-profile-settings/:subProfileId/names`, (req, res) => this.subProfileCtrl.getSettingNames(req, res));
        /**
         * UserSubProfileTypes Routes
         */
        this.router.post(`${keys_1.default.basePath}administrator/user-sub-profile-types/assign`, (req, res) => this.userSubProfileCtrl.assignUserSubProfiles(req, res));
        this.router.post(`${keys_1.default.basePath}administrator/user-sub-profile-types/unassign`, (req, res) => this.userSubProfileCtrl.unassignUserSubProfiles(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/user-sub-profile-types/:userId`, (req, res) => this.userSubProfileCtrl.getUserSubProfiles(req, res));
        this.router.get(`${keys_1.default.basePath}administrator/user-sub-profile-types/by-sub-profile/:subProfileId/users`, (req, res) => this.userSubProfileCtrl.getUsersBySubProfileId(req, res));
    }
}
const adminUserSettingsTypesRoutes = new AdminUserSettingsTypesRoute();
exports.default = adminUserSettingsTypesRoutes.router;
//# sourceMappingURL=ProfileSettingsRoutes.js.map