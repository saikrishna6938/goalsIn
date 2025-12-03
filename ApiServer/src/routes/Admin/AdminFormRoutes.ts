import { Router } from "express";
import keys from "../../keys";
import { FormController } from "../../controllers/Admin/Forms/FormsController";

class AdminFormRoutes {
  public router: Router = Router();
  private formControler: FormController;

  constructor() {
    this.formControler = new FormController();
    this.config();
  }

  config(): void {
    this.router.post(`${keys.basePath}administrator/forms`, (req, res) =>
      this.formControler.create(req, res)
    );

    this.router.put(`${keys.basePath}administrator/forms`, (req, res) =>
      this.formControler.update(req, res)
    );

    this.router.delete(
      `${keys.basePath}administrator/forms/:documentTypeObjectId`,
      (req, res) => this.formControler.delete(req, res)
    );

    this.router.get(`${keys.basePath}administrator/forms`, (req, res) =>
      this.formControler.getAll(req, res)
    );

    this.router.get(
      `${keys.basePath}administrator/forms/:documentTypeObjectId`,
      (req, res) => this.formControler.getById(req, res)
    );
  }
}

const adminFormRoutes = new AdminFormRoutes();
export default adminFormRoutes.router;
