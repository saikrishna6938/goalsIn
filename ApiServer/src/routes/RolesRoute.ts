import { Router } from "express";
import keys from "../keys";
import { rolescontroller } from "../controllers/RolesController";

class RolesRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    this.router.post(`${keys.basePath}roles/add-role`, rolescontroller.addRole);
    this.router.put(
      `${keys.basePath}roles/update-role/:roleId`,
      rolescontroller.updateRole
    );
    this.router.delete(
      `${keys.basePath}roles/delete-role/:roleId`,
      rolescontroller.deleteRole
    );
    this.router.get(
      `${keys.basePath}roles/get-roles`,
      rolescontroller.getRoles
    );
    this.router.get(
      `${keys.basePath}roles/get-role/:roleId`,
      rolescontroller.getRolesById
    );
    this.router.post(
      `${keys.basePath}roles/add-roletype`,
      rolescontroller.addRoleType
    );
    this.router.put(
      `${keys.basePath}roles/update-roletype/:roleTypeId`,
      rolescontroller.updateRoleType
    );
    this.router.delete(
      `${keys.basePath}roles/delete-roletype/:roleTypeId`,
      rolescontroller.deleteRoleType
    );
    this.router.get(
      `${keys.basePath}roles/get-roletypes`,
      rolescontroller.getRoleTypes
    );
  }
}

const rolesRoute = new RolesRoute();
export default rolesRoute.router;
