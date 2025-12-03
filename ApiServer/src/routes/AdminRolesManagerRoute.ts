import { Router } from "express";
import { indexcontroller } from "../controllers/IndexController";
import keys from "../keys";
import { globalController } from "../controllers/GlobalController";
import { searchController } from "../controllers/SearchController";
import { searchWebController } from "../controllers/SearchWebController";
import { adminRolesController } from "../controllers/RolesControllers/AdminRolesManager";
import { adminRoleNamesController } from "../controllers/RolesControllers/AdminRoleNamesController";
import { adminUserRolesController } from "../controllers/RolesControllers/AdminUserRolesController";
import { userRolesManagerController } from "../controllers/RolesControllers/UserRolesManagerController";

class AdminRolesManagerRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    this.router.get(
      `${keys.basePath}administrator/types/role-type/get`,
      adminRolesController.getSuperRoleTypes
    );
    this.router.post(
      `${keys.basePath}administrator/types/role-type/create`,
      adminRolesController.insertSuperRoleType
    );
    this.router.put(
      `${keys.basePath}administrator/types/role-type/update`,
      adminRolesController.updateSuperRoleType
    );
    this.router.delete(
      `${keys.basePath}administrator/types/role-type/delete/:roleTypeId`,
      adminRolesController.deleteSuperRoleType
    );

    //RoleNames
    this.router.get(
      `${keys.basePath}administrator/roles/names/get`,
      adminRoleNamesController.getSuperRoleNames
    );
    this.router.post(
      `${keys.basePath}administrator/roles/names/create`,
      adminRoleNamesController.insertSuperRoleName
    );
    this.router.put(
      `${keys.basePath}administrator/roles/names/update`,
      adminRoleNamesController.updateSuperRoleName
    );
    this.router.delete(
      `${keys.basePath}administrator/roles/names/delete/:roleNameId`,
      adminRoleNamesController.deleteSuperRoleName
    );

    //User Role Names
    this.router.get(
      `${keys.basePath}administrator/users/roles`,
      adminUserRolesController.getSuperUserRoles
    );
    this.router.post(
      `${keys.basePath}administrator/users/roles`,
      adminUserRolesController.insertSuperUserRole
    );
    this.router.put(
      `${keys.basePath}administrator/users/roles`,
      adminUserRolesController.updateSuperUserRole
    );
    // this.router.delete(
    //   `${keys.basePath}administrator/users/roles/:superUserRoleId`,
    //   adminUserRolesController.deleteSuperUserRole
    // );

    //User Roles Multiple Update
    this.router.post(
      `${keys.basePath}administrator/users/roles/multiple`,
      adminUserRolesController.insertMultipleSuperUserRoles
    );
    this.router.put(
      `${keys.basePath}administrator/users/roles/multiple`,
      adminUserRolesController.updateMultipleSuperUserRoles
    );
    this.router.delete(
      `${keys.basePath}administrator/users/roles/multiple`,
      userRolesManagerController.deleteSuperUserRoles
    );

    //Get user roles
    this.router.get(
      `${keys.basePath}administrator/users/roles/multiple/:userId`,
      userRolesManagerController.getSuperUserRoles
    );
  }
}

const ir = new AdminRolesManagerRoute();
export default ir.router;
