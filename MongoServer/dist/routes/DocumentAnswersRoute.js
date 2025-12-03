"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DocumentAnswersController_1 = require("../controllers/DocumentAnswersController");
const routeHelpers_1 = require("../utils/routeHelpers");
const groupIndexType_1 = require("../controllers/Tasks/groupIndexType");
class DocumentAnswersRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post((0, routeHelpers_1.withBasePath)("answer/save"), DocumentAnswersController_1.documentAnswers.addDocumentAnswerObject);
        this.router.post((0, routeHelpers_1.withBasePath)("answer/index"), DocumentAnswersController_1.documentAnswers.indexDocumentAnswerObject);
        this.router.post((0, routeHelpers_1.withBasePath)("getobject"), DocumentAnswersController_1.documentAnswers.getDocumentAnswerObject);
        this.router.post((0, routeHelpers_1.withBasePath)("applications"), DocumentAnswersController_1.documentAnswers.getApplications);
        this.router.post((0, routeHelpers_1.withBasePath)("get-application-id"), DocumentAnswersController_1.documentAnswers.getUserAndDocumentDetailsByAnswerId);
        this.router.post((0, routeHelpers_1.withBasePath)("answer/update"), DocumentAnswersController_1.documentAnswers.updateDocumentAnswerObject);
        this.router.post((0, routeHelpers_1.withBasePath)("task/group-index-type"), groupIndexType_1.getGroupIndexTypeByTaskId);
        this.router.get((0, routeHelpers_1.withBasePath)("task/:taskId/group-index-type"), groupIndexType_1.getGroupIndexTypeByTaskId);
    }
}
const documentAnswersRoute = new DocumentAnswersRoute();
exports.default = documentAnswersRoute.router;
