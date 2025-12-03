import { Router } from "express";
import { indexcontroller } from "../controllers/IndexController";
import keys from "../keys";
import { authController } from "../controllers/AuthenticateController";
import { userRolesManagerController } from "../controllers/RolesControllers/UserRolesManagerController";

class AuthenticateRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    this.router.post(`${keys.basePath}login`, authController.login);
    this.router.post(
      `${keys.basePath}check-token`,
      authController.loginWithAccessToken
    );
    this.router.post(
      `${keys.basePath}forgot-password`,
      authController.forgotPassword
    );
    this.router.post(
      `${keys.basePath}forgot-password-email`,
      authController.forgotPasswordEmail
    );
    this.router.post(
      `${keys.basePath}reset-password`,
      authController.resetPasswordFrontEnd
    );

    this.router.post(
      `${keys.basePath}create-user/:entityId`,
      authController.register
    );
    this.router.get(
      `${keys.basePath}get-all-users/:entityId`,
      userRolesManagerController.getUsersByEntityId
    );
    this.router.get(
      `${keys.basePath}get-user-all/:entityId/:userType`,
      authController.getAllUsers
    );
    this.router.get(
      `${keys.basePath}job/users/:entityId/:userType`,
      userRolesManagerController.getusersforjob
    );
  }
}

const authenticateRoute = new AuthenticateRoute();
export default authenticateRoute.router;
