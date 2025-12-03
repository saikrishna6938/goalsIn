import { Router } from "express";
import keys from "../../keys";
import { ControlCenterController } from "../../controllers/Admin/ControlCenters/ControlCenterController";

class AdminControlCenterRoutes {
  public router: Router = Router();
  private controlCenter: ControlCenterController;

  constructor() {
    this.controlCenter = new ControlCenterController();
    this.config();
  }

  config(): void {
    this.router.post(`${keys.basePath}administrator/controls`, (req, res) =>
      this.controlCenter.create(req, res)
    );

    this.router.put(`${keys.basePath}administrator/controls`, (req, res) =>
      this.controlCenter.update(req, res)
    );

    this.router.delete(`${keys.basePath}administrator/controls`, (req, res) =>
      this.controlCenter.delete(req, res)
    );

    this.router.get(`${keys.basePath}administrator/controls`, (req, res) =>
      this.controlCenter.getAll(req, res)
    );

    this.router.get(
      `${keys.basePath}administrator/controls/:controlCenterId`,
      (req, res) => this.controlCenter.getById(req, res)
    );
  }
}

const routes = new AdminControlCenterRoutes();
export default routes.router;
