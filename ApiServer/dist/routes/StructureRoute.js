"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const StructureController_1 = require("../controllers/StructureController");
class indexRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post(`${keys_1.default.basePath}add-entity`, StructureController_1.structureController.addEntity);
        this.router.delete(`${keys_1.default.basePath}delete-entity/:entityId`, StructureController_1.structureController.deleteEntity);
        this.router.put(`${keys_1.default.basePath}update-entity/:entityId`, StructureController_1.structureController.updateEntity);
        this.router.get(`${keys_1.default.basePath}entities`, StructureController_1.structureController.getEntities);
        this.router.get(`${keys_1.default.basePath}entity/:entityId`, StructureController_1.structureController.getEntity);
    }
}
const ir = new indexRoute();
exports.default = ir.router;
//# sourceMappingURL=StructureRoute.js.map