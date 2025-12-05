import { Router } from "express";
import { withBasePath } from "../../utils/routeHelpers";
import { adminOptionsController } from "../../controllers/Admin/OptionsData/AdminOptionsController";

class AdminOptionsRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    const base = withBasePath("administrator/options");
    this.router.post(base, (req, res) => adminOptionsController.createOption(req, res));
    this.router.get(base, (req, res) => adminOptionsController.getOptions(req, res));
    this.router.delete(`${base}/:optionId`, (req, res) => adminOptionsController.deleteOption(req, res));
    this.router.put(`${base}/:optionId`, (req, res) => adminOptionsController.updateOption(req, res));
    this.router.get(`${base}/label/:optionName`, (req, res) =>
      adminOptionsController.getOptionDataByLabelName(req, res)
    );
    this.router.get(`${base}/:optionId`, (req, res) => adminOptionsController.getOptionsByID(req, res));
    this.router.get(`${base}/by-label`, (req, res) => adminOptionsController.getOptionsDataByValueLabel(req, res));
    this.router.get(`${base}/value-labels/:entityId`, (req, res) =>
      adminOptionsController.getValueLabelsByEntityId(req, res)
    );
    this.router.post(`${base}/structure-value`, (req, res) =>
      adminOptionsController.createStructureOptionValue(req, res)
    );
    this.router.put(`${base}/structure-value/:id`, (req, res) =>
      adminOptionsController.updateStructureOptionValue(req, res)
    );
    this.router.delete(`${base}/structure-value/:id`, (req, res) =>
      adminOptionsController.deleteStructureOptionValue(req, res)
    );
    this.router.get(`${base}/structure-values/values`, (req, res) =>
      adminOptionsController.getAllStructureOptionValues(req, res)
    );
    this.router.get(`${base}/structure-values/values/:id`, (req, res) =>
      adminOptionsController.getStructureOptionValueById(req, res)
    );
  }
}

const adminOptionsRoute = new AdminOptionsRoute();
export default adminOptionsRoute.router;
