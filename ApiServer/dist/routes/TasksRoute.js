"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const TaskController_1 = require("../controllers/TaskController");
class TasksRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get(`${keys_1.default.basePath}tasks/document/:documentTypeId`, TaskController_1.tasksController.getTasksByDocumentType);
        this.router.get(`${keys_1.default.basePath}tasks/user/:userId/:documentTypeId`, TaskController_1.tasksController.getTasksByUserId);
        this.router.get(`${keys_1.default.basePath}user/tasks/:userId`, TaskController_1.tasksController.getUserTasksFrontEnd);
        this.router.get(`${keys_1.default.basePath}assigned-tasks/user/:userId`, TaskController_1.tasksController.getAssignTasksByUserId);
        this.router.get(`${keys_1.default.basePath}get-task/:taskId`, TaskController_1.tasksController.getTaskByTaskId);
        this.router.post(`${keys_1.default.basePath}check-task-access`, TaskController_1.tasksController.checkUserAccess);
        this.router.post(`${keys_1.default.basePath}update-taskusers`, TaskController_1.tasksController.updateTaskUsers);
        this.router.post(`${keys_1.default.basePath}task-actions`, TaskController_1.tasksController.getTaskActions);
        this.router.post(`${keys_1.default.basePath}task-users`, TaskController_1.tasksController.getTaskUsers);
        this.router.post(`${keys_1.default.basePath}assigned-tasks`, TaskController_1.tasksController.getTasksByTaskIds);
        this.router.post(`${keys_1.default.basePath}task/add`, TaskController_1.tasksController.addTask);
        this.router.post(`${keys_1.default.basePath}task/index-document`, TaskController_1.tasksController.indexDocument);
        this.router.put(`${keys_1.default.basePath}task/update/:taskId`, TaskController_1.tasksController.updateTask);
    }
}
const ir = new TasksRoute();
exports.default = ir.router;
//# sourceMappingURL=TasksRoute.js.map