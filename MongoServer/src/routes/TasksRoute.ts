import { Router } from "express";
import { tasksController } from "../controllers/TaskController";
import { withBasePath } from "../utils/routeHelpers";

class TasksRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.get(withBasePath("tasks/document/:documentTypeId"), tasksController.getTasksByDocumentType);
    this.router.get(withBasePath("tasks/user/:userId/:documentTypeId"), tasksController.getTasksByUserId);
    this.router.get(withBasePath("user/tasks/:userId"), tasksController.getUserTasksFrontEnd);
    this.router.get(withBasePath("assigned-tasks/user/:userId"), tasksController.getAssignTasksByUserId);
    this.router.get(withBasePath("get-task/:taskId"), tasksController.getTaskByTaskId);
    this.router.post(withBasePath("check-task-access"), tasksController.checkUserAccess);
    this.router.post(withBasePath("update-taskusers"), tasksController.updateTaskUsers);
    this.router.post(withBasePath("task-actions"), tasksController.getTaskActions);
    this.router.post(withBasePath("task-users"), tasksController.getTaskUsers);
    this.router.post(withBasePath("assigned-tasks"), tasksController.getTasksByTaskIds);
    this.router.post(withBasePath("task/add"), tasksController.addTask);
    this.router.post(withBasePath("task/index-document"), tasksController.indexDocument);
    this.router.put(withBasePath("task/update/:taskId"), tasksController.updateTask);
  }
}

const tasksRoute = new TasksRoute();
export default tasksRoute.router;
