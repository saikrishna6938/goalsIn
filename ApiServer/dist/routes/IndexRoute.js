"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const IndexController_1 = require("../controllers/IndexController");
const keys_1 = __importDefault(require("../keys"));
const multer_1 = __importDefault(require("multer"));
class indexRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
        this.router.get(keys_1.default.basePath, IndexController_1.indexcontroller.index);
        this.router.get(`${keys_1.default.basePath}test`, IndexController_1.indexcontroller.test);
        this.router.post(`${keys_1.default.basePath}action-subscribe`, IndexController_1.indexcontroller.action_subscribe);
        this.router.post(`${keys_1.default.basePath}action-contact`, IndexController_1.indexcontroller.action_contactus);
        this.router.post(`${keys_1.default.basePath}action-enroll`, IndexController_1.indexcontroller.action_enroll);
        this.router.post(`${keys_1.default.basePath}action-resume`, upload.single("file"), IndexController_1.indexcontroller.action_submitFormWithFile);
        this.router.get(`${keys_1.default.basePath}user/document-tags/:id`, IndexController_1.indexcontroller.getDocumentTagById);
    }
}
const ir = new indexRoute();
exports.default = ir.router;
//# sourceMappingURL=IndexRoute.js.map