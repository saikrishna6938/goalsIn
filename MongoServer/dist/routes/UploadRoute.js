"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UploadController_1 = require("../controllers/UploadController");
const routeHelpers_1 = require("../utils/routeHelpers");
class UploadRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post((0, routeHelpers_1.withBasePath)("upload/file"), UploadController_1.uploadController.uploadFile);
        this.router.post((0, routeHelpers_1.withBasePath)("get/file"), UploadController_1.uploadController.getFile);
        this.router.post((0, routeHelpers_1.withBasePath)("get/filedata"), UploadController_1.uploadController.getFileData);
        this.router.post((0, routeHelpers_1.withBasePath)("userupload/file"), UploadController_1.uploadController.uploadUserIntray);
        this.router.post((0, routeHelpers_1.withBasePath)("indexDocument/file"), UploadController_1.uploadController.updateToIndexDocument);
    }
}
const uploadRoute = new UploadRoute();
exports.default = uploadRoute.router;
