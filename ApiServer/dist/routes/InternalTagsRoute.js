"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const InternalTagsController_1 = require("../controllers/InternalTagsController");
class InternalTagsRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.put(`${keys_1.default.basePath}update-internal-tag/:tableId/:id`, InternalTagsController_1.internalTagsController.updateRecord);
        this.router.post(`${keys_1.default.basePath}update-internal-tag/:tableId/:id`, InternalTagsController_1.internalTagsController.createRecord);
    }
}
const ir = new InternalTagsRoute();
exports.default = ir.router;
//# sourceMappingURL=InternalTagsRoute.js.map