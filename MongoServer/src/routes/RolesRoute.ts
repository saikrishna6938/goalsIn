import { Router } from "express";
import { rolesController } from "../controllers/RolesController";
import { withBasePath } from "../utils/routeHelpers";

class RolesRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.post(withBasePath("roles/add-role"), rolesController.addRole);
    this.router.put(withBasePath("roles/update-role/:roleId"), rolesController.updateRole);
    this.router.delete(withBasePath("roles/delete-role/:roleId"), rolesController.deleteRole);
    this.router.get(withBasePath("roles/get-roles"), rolesController.getRoles);
    this.router.get(withBasePath("roles/get-role/:roleId"), rolesController.getRolesById);
    this.router.post(withBasePath("roles/add-roletype"), rolesController.addRoleType);
    this.router.put(
      withBasePath("roles/update-roletype/:roleTypeId"),
      rolesController.updateRoleType
    );
    this.router.delete(
      withBasePath("roles/delete-roletype/:roleTypeId"),
      rolesController.deleteRoleType
    );
    this.router.get(withBasePath("roles/get-roletypes"), rolesController.getRoleTypes);
  }
}

const rolesRoute = new RolesRoute();
export default rolesRoute.router;
