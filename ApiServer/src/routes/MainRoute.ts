import { Router } from "express";
import keys from "../keys";
import { mainController } from "../controllers/MainController";
import { authController } from "../controllers/AuthenticateController";
import { ControlCenterController } from "../controllers/Admin/ControlCenters/ControlCenterController";
import { uploadAvatarMulter } from "../middleware/uploadAvatar";
import {
  deleteAvatar,
  uploadAvatar,
} from "../controllers/uploadAvatarController";
import {
  indexDocumentController,
  IndexDocumentController,
} from "../controllers/IndexDocumentController";
import { getGroupIndexTypeByTaskId } from "../controllers/Tasks/groupIndexType";

class MainRoute {
  public router: Router = Router();
  private controlCenter: ControlCenterController;
  private indexdocController: IndexDocumentController;
  constructor() {
    this.controlCenter = new ControlCenterController();
    this.indexdocController = new IndexDocumentController();
    this.config();
  }

  config(): void {
    this.router.post(`${keys.basePath}logout`, mainController.logout);

    this.router.post(
      `${keys.basePath}refresh-token`,
      mainController.refreshToken
    );
    this.router.post(`${keys.basePath}update-user`, mainController.updateUser);
    this.router.post(`${keys.basePath}delete-user`, mainController.deleteUser);
    this.router.post(`${keys.basePath}user-details`, mainController.getUser);
    this.router.post(
      `${keys.basePath}users/:userId/avatar`,
      uploadAvatarMulter.single("avatar"),
      (req, res) => uploadAvatar(req, res)
    );
    this.router.delete(
      `${keys.basePath}administrator/users/:userId/avatar`,
      (req, res) => deleteAvatar(req, res)
    );
    this.router.post(
      `${keys.basePath}user-dashboard`,
      mainController.getUserDashboardData
    );
    this.router.get(`${keys.basePath}protected`, mainController.protected);
    this.router.post(
      `${keys.basePath}user-settings`,
      mainController.getUserSettings
    );
    this.router.get(`${keys.basePath}user/controls`, (req, res) =>
      this.controlCenter.getAll(req, res)
    );
    this.router.get(
      `${keys.basePath}tasks/:taskId/group-index-type`,
      (req, res) => getGroupIndexTypeByTaskId(req, res)
    );
    this.router.get(
      `${keys.basePath}user/controls/:controlCenterId`,
      (req, res) => this.controlCenter.getById(req, res)
    );
    this.router.get(
      `${keys.basePath}roles/get-roles-types`,
      mainController.getAllRolesWithTypes
    );
    this.router.get(
      `${keys.basePath}get-user-entities/:userId`,
      mainController.getUserEntities
    );
    this.router.post(`${keys.basePath}user/index-document`, (req, res) =>
      indexDocumentController.createIndexDocument(req, res)
    );
  }
}

const ir = new MainRoute();
export default ir.router;
