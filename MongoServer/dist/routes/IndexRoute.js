"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const IndexController_1 = require("../controllers/IndexController");
const routeHelpers_1 = require("../utils/routeHelpers");
class IndexRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
        this.config();
    }
    config() {
        this.router.get((0, routeHelpers_1.withBasePath)(), IndexController_1.indexController.index);
        this.router.get((0, routeHelpers_1.withBasePath)("test"), IndexController_1.indexController.test);
        this.router.post((0, routeHelpers_1.withBasePath)("action-subscribe"), IndexController_1.indexController.action_subscribe);
        this.router.post((0, routeHelpers_1.withBasePath)("action-contact"), IndexController_1.indexController.action_contactus);
        this.router.post((0, routeHelpers_1.withBasePath)("action-enroll"), IndexController_1.indexController.action_enroll);
        this.router.post((0, routeHelpers_1.withBasePath)("action-resume"), this.upload.single("file"), IndexController_1.indexController.action_submitFormWithFile);
        this.router.get((0, routeHelpers_1.withBasePath)("user/document-tags/:id"), IndexController_1.indexController.getDocumentTagById);
    }
}
const indexRoute = new IndexRoute();
exports.default = indexRoute.router;
