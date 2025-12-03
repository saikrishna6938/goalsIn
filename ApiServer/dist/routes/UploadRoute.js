"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const UploadController_1 = require("../controllers/UploadController");
class UploadRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post(`${keys_1.default.basePath}upload/file`, UploadController_1.uploadController.uploadFile);
        this.router.post(`${keys_1.default.basePath}get/file`, UploadController_1.uploadController.getFile);
        this.router.post(`${keys_1.default.basePath}get/filedata`, UploadController_1.uploadController.getFileData);
        this.router.post(`${keys_1.default.basePath}userupload/file`, UploadController_1.uploadController.uploadUserIntray);
        this.router.post(`${keys_1.default.basePath}indexDocument/file`, UploadController_1.uploadController.updateToIndexDocument);
    }
}
const ir = new UploadRoute();
exports.default = ir.router;
//# sourceMappingURL=UploadRoute.js.map