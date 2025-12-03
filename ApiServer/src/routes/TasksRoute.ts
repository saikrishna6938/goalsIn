import { Router } from "express";
import { indexcontroller } from "../controllers/IndexController";
import keys from "../keys";
import { tasksController } from "../controllers/TaskController";

class TasksRoute {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    this.router.get(
      `${keys.basePath}tasks/document/:documentTypeId`,
      tasksController.getTasksByDocumentType
    );
    this.router.get(
      `${keys.basePath}tasks/user/:userId/:documentTypeId`,
      tasksController.getTasksByUserId
    );
    this.router.get(
      `${keys.basePath}user/tasks/:userId`,
      tasksController.getUserTasksFrontEnd
    );
    this.router.get(
      `${keys.basePath}assigned-tasks/user/:userId`,
      tasksController.getAssignTasksByUserId
    );
    this.router.get(
      `${keys.basePath}get-task/:taskId`,
      tasksController.getTaskByTaskId
    );
    this.router.post(
      `${keys.basePath}check-task-access`,
      tasksController.checkUserAccess
    );
    this.router.post(
      `${keys.basePath}update-taskusers`,
      tasksController.updateTaskUsers
    );
    this.router.post(
      `${keys.basePath}task-actions`,
      tasksController.getTaskActions
    );
    this.router.post(
      `${keys.basePath}task-users`,
      tasksController.getTaskUsers
    );
    this.router.post(
      `${keys.basePath}assigned-tasks`,
      tasksController.getTasksByTaskIds
    );
    this.router.post(`${keys.basePath}task/add`, tasksController.addTask);
    this.router.post(
      `${keys.basePath}task/index-document`,
      tasksController.indexDocument
    );
    this.router.put(
      `${keys.basePath}task/update/:taskId`,
      tasksController.updateTask
    );
  }
}

const ir = new TasksRoute();
export default ir.router;
