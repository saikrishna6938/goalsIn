import { Router } from "express";
import { withBasePath } from "../../utils/routeHelpers";
import { ControlCenterController } from "../../controllers/Admin/ControlCenters/ControlCenterController";

class AdminControlCenterRoutes {
  public router: Router = Router();
  private controlCenter: ControlCenterController;

  constructor() {
    this.controlCenter = new ControlCenterController();
    this.config();
  }

  private config() {
    this.router.post(withBasePath("administrator/controls"), (req, res) =>
      this.controlCenter.create(req, res)
    );
    this.router.put(withBasePath("administrator/controls"), (req, res) =>
      this.controlCenter.update(req, res)
    );
    this.router.delete(withBasePath("administrator/controls"), (req, res) =>
      this.controlCenter.delete(req, res)
    );
    this.router.get(withBasePath("administrator/controls"), (req, res) =>
      this.controlCenter.getAll(req, res)
    );
    this.router.get(withBasePath("administrator/controls/:controlCenterId"), (req, res) =>
      this.controlCenter.getById(req, res)
    );
  }
}

const adminControlCenterRoutes = new AdminControlCenterRoutes();
export default adminControlCenterRoutes.router;
