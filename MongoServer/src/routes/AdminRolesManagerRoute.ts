import { Router } from "express";
import { adminRolesController } from "../controllers/Admin/AdminRolesManagerController";
import { adminRoleNamesController } from "../controllers/Admin/AdminRoleNamesController";
import { adminUserRolesController } from "../controllers/Admin/AdminUserRolesController";
import { userRolesManagerController } from "../controllers/UserRolesManagerController";
import { withBasePath } from "../utils/routeHelpers";

class AdminRolesManagerRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.get(withBasePath("administrator/types/role-type/get"), adminRolesController.getSuperRoleTypes);
    this.router.post(withBasePath("administrator/types/role-type/create"), adminRolesController.insertSuperRoleType);
    this.router.put(withBasePath("administrator/types/role-type/update"), adminRolesController.updateSuperRoleType);
    this.router.delete(
      withBasePath("administrator/types/role-type/delete/:roleTypeId"),
      adminRolesController.deleteSuperRoleType
    );

    this.router.get(withBasePath("administrator/roles/names/get"), adminRoleNamesController.getSuperRoleNames);
    this.router.post(withBasePath("administrator/roles/names/create"), adminRoleNamesController.insertSuperRoleName);
    this.router.put(withBasePath("administrator/roles/names/update"), adminRoleNamesController.updateSuperRoleName);
    this.router.delete(
      withBasePath("administrator/roles/names/delete/:roleNameId"),
      adminRoleNamesController.deleteSuperRoleName
    );

    this.router.get(withBasePath("administrator/users/roles"), adminUserRolesController.getSuperUserRoles);
    this.router.post(withBasePath("administrator/users/roles"), adminUserRolesController.insertSuperUserRole);
    this.router.put(withBasePath("administrator/users/roles"), adminUserRolesController.updateSuperUserRole);

    this.router.post(
      withBasePath("administrator/users/roles/multiple"),
      adminUserRolesController.insertMultipleSuperUserRoles
    );
    this.router.put(
      withBasePath("administrator/users/roles/multiple"),
      adminUserRolesController.updateMultipleSuperUserRoles
    );
    this.router.delete(
      withBasePath("administrator/users/roles/multiple"),
      userRolesManagerController.deleteSuperUserRoles
    );

    this.router.get(
      withBasePath("administrator/users/roles/multiple/:userId"),
      adminUserRolesController.getSuperUserRolesByUserId
    );
  }
}

const adminRolesManagerRoute = new AdminRolesManagerRoute();
export default adminRolesManagerRoute.router;
