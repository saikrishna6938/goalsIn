import { Router } from "express";
import { withBasePath } from "../../utils/routeHelpers";
import { FormController } from "../../controllers/Admin/Forms/FormsController";

class AdminFormRoutes {
  public router: Router = Router();
  private formController: FormController;

  constructor() {
    this.formController = new FormController();
    this.config();
  }

  private config() {
    this.router.post(withBasePath("administrator/forms"), (req, res) =>
      this.formController.create(req, res)
    );
    this.router.put(withBasePath("administrator/forms"), (req, res) =>
      this.formController.update(req, res)
    );
    this.router.delete(withBasePath("administrator/forms/:documentTypeObjectId"), (req, res) =>
      this.formController.delete(req, res)
    );
    this.router.get(withBasePath("administrator/forms"), (req, res) =>
      this.formController.getAll(req, res)
    );
    this.router.get(withBasePath("administrator/forms/:documentTypeObjectId"), (req, res) =>
      this.formController.getById(req, res)
    );
  }
}

const adminFormRoutes = new AdminFormRoutes();
export default adminFormRoutes.router;
