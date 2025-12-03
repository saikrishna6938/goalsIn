"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const StructureController_1 = require("../controllers/StructureController");
const routeHelpers_1 = require("../utils/routeHelpers");
class StructureRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post((0, routeHelpers_1.withBasePath)("add-entity"), StructureController_1.structureController.addEntity);
        this.router.delete((0, routeHelpers_1.withBasePath)("delete-entity/:entityId"), StructureController_1.structureController.deleteEntity);
        this.router.put((0, routeHelpers_1.withBasePath)("update-entity/:entityId"), StructureController_1.structureController.updateEntity);
        this.router.get((0, routeHelpers_1.withBasePath)("entities"), StructureController_1.structureController.getEntities);
        this.router.get((0, routeHelpers_1.withBasePath)("entity/:entityId"), StructureController_1.structureController.getEntity);
    }
}
const structureRoute = new StructureRoute();
exports.default = structureRoute.router;
