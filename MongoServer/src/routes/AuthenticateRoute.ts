import { Router } from "express";
import { authController } from "../controllers/AuthenticateController";
import { userRolesManagerController } from "../controllers/UserRolesManagerController";
import { withBasePath } from "../utils/routeHelpers";

class AuthenticateRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.post(withBasePath("login"), authController.login);
    this.router.post(withBasePath("check-token"), authController.loginWithAccessToken);
    this.router.post(withBasePath("forgot-password"), authController.forgotPassword);
    this.router.post(withBasePath("forgot-password-email"), authController.forgotPasswordEmail);
    this.router.post(withBasePath("reset-password"), authController.resetPasswordFrontEnd);
    this.router.post(withBasePath("create-user"), authController.register);
    this.router.post(withBasePath("create-user/:entityId"), authController.register);
    this.router.get(withBasePath("get-all-users/:entityId"), userRolesManagerController.getUsersByEntityId);
    this.router.get(withBasePath("get-user-all/:entityId/:userType"), authController.getAllUsers);
    this.router.get(withBasePath("job/users/:entityId/:userType"), userRolesManagerController.getusersforjob);
  }
}

const authenticateRoute = new AuthenticateRoute();
export default authenticateRoute.router;
