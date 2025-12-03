"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const DocumentAnswersController_1 = require("../controllers/DocumentAnswersController");
const groupIndexType_1 = require("../controllers/Tasks/groupIndexType");
class DocumentAnswersRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post(`${keys_1.default.basePath}answer/save`, DocumentAnswersController_1.documentAnswers.addDocumentAnswerObject);
        this.router.post(`${keys_1.default.basePath}answer/index`, DocumentAnswersController_1.documentAnswers.indexDocumentAnswerObject);
        this.router.post(`${keys_1.default.basePath}getobject`, DocumentAnswersController_1.documentAnswers.getDocumentAnswerObject);
        this.router.post(`${keys_1.default.basePath}applications`, DocumentAnswersController_1.documentAnswers.getApplications);
        this.router.post(`${keys_1.default.basePath}get-application-id`, DocumentAnswersController_1.documentAnswers.getUserAndDocumentDetailsByAnswerId);
        this.router.post(`${keys_1.default.basePath}answer/update`, DocumentAnswersController_1.documentAnswers.updateDocumentAnswerObject);
        // Fetch group index type and name by taskId
        this.router.post(`${keys_1.default.basePath}task/group-index-type`, groupIndexType_1.getGroupIndexTypeByTaskId);
        this.router.get(`${keys_1.default.basePath}task/:taskId/group-index-type`, groupIndexType_1.getGroupIndexTypeByTaskId);
    }
}
const ir = new DocumentAnswersRoute();
exports.default = ir.router;
//# sourceMappingURL=DocumentAnswersRoute.js.map