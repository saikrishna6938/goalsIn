"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const MainController_1 = require("../controllers/MainController");
const ControlCenterController_1 = require("../controllers/Admin/ControlCenters/ControlCenterController");
const uploadAvatar_1 = require("../middleware/uploadAvatar");
const uploadAvatarController_1 = require("../controllers/uploadAvatarController");
const IndexDocumentController_1 = require("../controllers/IndexDocumentController");
const groupIndexType_1 = require("../controllers/Tasks/groupIndexType");
class MainRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.controlCenter = new ControlCenterController_1.ControlCenterController();
        this.indexdocController = new IndexDocumentController_1.IndexDocumentController();
        this.config();
    }
    config() {
        this.router.post(`${keys_1.default.basePath}logout`, MainController_1.mainController.logout);
        this.router.post(`${keys_1.default.basePath}refresh-token`, MainController_1.mainController.refreshToken);
        this.router.post(`${keys_1.default.basePath}update-user`, MainController_1.mainController.updateUser);
        this.router.post(`${keys_1.default.basePath}delete-user`, MainController_1.mainController.deleteUser);
        this.router.post(`${keys_1.default.basePath}user-details`, MainController_1.mainController.getUser);
        this.router.post(`${keys_1.default.basePath}users/:userId/avatar`, uploadAvatar_1.uploadAvatarMulter.single("avatar"), (req, res) => (0, uploadAvatarController_1.uploadAvatar)(req, res));
        this.router.delete(`${keys_1.default.basePath}administrator/users/:userId/avatar`, (req, res) => (0, uploadAvatarController_1.deleteAvatar)(req, res));
        this.router.post(`${keys_1.default.basePath}user-dashboard`, MainController_1.mainController.getUserDashboardData);
        this.router.get(`${keys_1.default.basePath}protected`, MainController_1.mainController.protected);
        this.router.post(`${keys_1.default.basePath}user-settings`, MainController_1.mainController.getUserSettings);
        this.router.get(`${keys_1.default.basePath}user/controls`, (req, res) => this.controlCenter.getAll(req, res));
        this.router.get(`${keys_1.default.basePath}tasks/:taskId/group-index-type`, (req, res) => (0, groupIndexType_1.getGroupIndexTypeByTaskId)(req, res));
        this.router.get(`${keys_1.default.basePath}user/controls/:controlCenterId`, (req, res) => this.controlCenter.getById(req, res));
        this.router.get(`${keys_1.default.basePath}roles/get-roles-types`, MainController_1.mainController.getAllRolesWithTypes);
        this.router.get(`${keys_1.default.basePath}get-user-entities/:userId`, MainController_1.mainController.getUserEntities);
        this.router.post(`${keys_1.default.basePath}user/index-document`, (req, res) => IndexDocumentController_1.indexDocumentController.createIndexDocument(req, res));
    }
}
const ir = new MainRoute();
exports.default = ir.router;
//# sourceMappingURL=MainRoute.js.map