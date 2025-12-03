"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TaskController_1 = require("../controllers/TaskController");
const routeHelpers_1 = require("../utils/routeHelpers");
class TasksRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.get((0, routeHelpers_1.withBasePath)("tasks/document/:documentTypeId"), TaskController_1.tasksController.getTasksByDocumentType);
        this.router.get((0, routeHelpers_1.withBasePath)("tasks/user/:userId/:documentTypeId"), TaskController_1.tasksController.getTasksByUserId);
        this.router.get((0, routeHelpers_1.withBasePath)("user/tasks/:userId"), TaskController_1.tasksController.getUserTasksFrontEnd);
        this.router.get((0, routeHelpers_1.withBasePath)("assigned-tasks/user/:userId"), TaskController_1.tasksController.getAssignTasksByUserId);
        this.router.get((0, routeHelpers_1.withBasePath)("get-task/:taskId"), TaskController_1.tasksController.getTaskByTaskId);
        this.router.post((0, routeHelpers_1.withBasePath)("check-task-access"), TaskController_1.tasksController.checkUserAccess);
        this.router.post((0, routeHelpers_1.withBasePath)("update-taskusers"), TaskController_1.tasksController.updateTaskUsers);
        this.router.post((0, routeHelpers_1.withBasePath)("task-actions"), TaskController_1.tasksController.getTaskActions);
        this.router.post((0, routeHelpers_1.withBasePath)("task-users"), TaskController_1.tasksController.getTaskUsers);
        this.router.post((0, routeHelpers_1.withBasePath)("assigned-tasks"), TaskController_1.tasksController.getTasksByTaskIds);
        this.router.post((0, routeHelpers_1.withBasePath)("task/add"), TaskController_1.tasksController.addTask);
        this.router.post((0, routeHelpers_1.withBasePath)("task/index-document"), TaskController_1.tasksController.indexDocument);
        this.router.put((0, routeHelpers_1.withBasePath)("task/update/:taskId"), TaskController_1.tasksController.updateTask);
    }
}
const tasksRoute = new TasksRoute();
exports.default = tasksRoute.router;
