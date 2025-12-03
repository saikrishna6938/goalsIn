import { Router } from "express";
import keys from "../../keys";
import { AdminUserSettingsTypesController } from "../../controllers/Admin/ProfileSettings/SettingNamesController";
import { AdminSubProfileTypesController } from "../../controllers/Admin/ProfileSettings/SubProfileTypesController";
import { AdminSubProfileSettingsController } from "../../controllers/Admin/ProfileSettings/SubProfileSettingsController";
import { AdminUserSubProfileTypesController } from "../../controllers/Admin/ProfileSettings/UserSubProfileTypesController";

class AdminUserSettingsTypesRoute {
  public router: Router = Router();
  private userSettingsCtrl: AdminUserSettingsTypesController;
  private subProfileCtrl: AdminSubProfileTypesController;
  private subProfileSettingsCtrl: AdminSubProfileSettingsController;
  private userSubProfileCtrl: AdminUserSubProfileTypesController;

  constructor() {
    this.userSettingsCtrl = new AdminUserSettingsTypesController();
    this.subProfileCtrl = new AdminSubProfileTypesController();
    this.subProfileSettingsCtrl = new AdminSubProfileSettingsController();
    this.userSubProfileCtrl = new AdminUserSubProfileTypesController();
    this.config();
  }

  config(): void {
    /**
     * UserSettingsTypes Routes
     */
    this.router.post(
      `${keys.basePath}administrator/user-settings-types`,
      (req, res) => this.userSettingsCtrl.addUserSettingsType(req, res)
    );

    this.router.put(
      `${keys.basePath}administrator/user-settings-types/:id`,
      (req, res) => this.userSettingsCtrl.editUserSettingsType(req, res)
    );

    this.router.delete(
      `${keys.basePath}administrator/user-settings-types/:id`,
      (req, res) => this.userSettingsCtrl.deleteUserSettingsType(req, res)
    );

    this.router.get(
      `${keys.basePath}administrator/user-settings-types`,
      (req, res) => this.userSettingsCtrl.getAllUserSettingsTypes(req, res)
    );

    this.router.get(
      `${keys.basePath}administrator/user-settings-types/:id`,
      (req, res) => this.userSettingsCtrl.getSingleUserSettingsType(req, res)
    );

    /**
     * SubProfileTypes Routes
     */
    this.router.post(
      `${keys.basePath}administrator/sub-profile-types`,
      (req, res) => this.subProfileCtrl.addSubProfileType(req, res)
    );

    this.router.put(
      `${keys.basePath}administrator/sub-profile-types/:subProfileId`,
      (req, res) => this.subProfileCtrl.editSubProfileType(req, res)
    );

    this.router.delete(
      `${keys.basePath}administrator/sub-profile-types/:subProfileId`,
      (req, res) => this.subProfileCtrl.deleteSubProfileType(req, res)
    );

    this.router.get(
      `${keys.basePath}administrator/sub-profile-types`,
      (req, res) => this.subProfileCtrl.getAllSubProfileTypes(req, res)
    );

    this.router.get(
      `${keys.basePath}administrator/sub-profile-types/:subProfileId`,
      (req, res) => this.subProfileCtrl.getSingleSubProfileType(req, res)
    );

    /**
     * SubProfileSettings Routes
     */
    this.router.post(
      `${keys.basePath}administrator/sub-profile-settings`,
      (req, res) => this.subProfileSettingsCtrl.addSubProfileSetting(req, res)
    );

    this.router.put(
      `${keys.basePath}administrator/sub-profile-settings/:profileSettingsId`,
      (req, res) => this.subProfileSettingsCtrl.editSubProfileSetting(req, res)
    );

    this.router.delete(
      `${keys.basePath}administrator/sub-profile-settings/:profileSettingsId`,
      (req, res) =>
        this.subProfileSettingsCtrl.deleteSubProfileSetting(req, res)
    );

    this.router.get(
      `${keys.basePath}administrator/sub-profile-settings`,
      (req, res) =>
        this.subProfileSettingsCtrl.getAllSubProfileSettings(req, res)
    );

    this.router.get(
      `${keys.basePath}administrator/sub-profile-settings/:profileSettingsId`,
      (req, res) =>
        this.subProfileSettingsCtrl.getSingleSubProfileSetting(req, res)
    );
    this.router.get(
      `${keys.basePath}administrator/sub-profile-settings/:subProfileId/names`,
      (req, res) => this.subProfileCtrl.getSettingNames(req, res)
    );

    /**
     * UserSubProfileTypes Routes
     */
    this.router.post(
      `${keys.basePath}administrator/user-sub-profile-types/assign`,
      (req, res) => this.userSubProfileCtrl.assignUserSubProfiles(req, res)
    );

    this.router.post(
      `${keys.basePath}administrator/user-sub-profile-types/unassign`,
      (req, res) => this.userSubProfileCtrl.unassignUserSubProfiles(req, res)
    );

    this.router.get(
      `${keys.basePath}administrator/user-sub-profile-types/:userId`,
      (req, res) => this.userSubProfileCtrl.getUserSubProfiles(req, res)
    );

    this.router.get(
      `${keys.basePath}administrator/user-sub-profile-types/by-sub-profile/:subProfileId/users`,
      (req, res) => this.userSubProfileCtrl.getUsersBySubProfileId(req, res)
    );
  }
}

const adminUserSettingsTypesRoutes = new AdminUserSettingsTypesRoute();
export default adminUserSettingsTypesRoutes.router;
