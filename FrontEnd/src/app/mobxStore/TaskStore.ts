import { Task } from "app/user/tasks/Task";
import { makeAutoObservable } from "mobx";

class TaskStore {
  tasks: Task[];
  taskIds: number[];
  version: string;
  pageHeader: string;
  selectedTaskIds: number[];
  applicationType: string | null;

  constructor() {
    this.tasks = [];
    this.selectedTaskIds = [];
    this.applicationType = null;

    makeAutoObservable(this);
  }

  setTasks(tasks: Task[]) {
    this.tasks = tasks;
  }
  setTaskIds(tasks: number[], pageHeader = "Pending Tasks") {
    this.taskIds = tasks;
    this.pageHeader = pageHeader;
  }

  setSelectedTaskIds(ids: number[]) {
    this.selectedTaskIds = ids;
  }

  clearSelectedTaskIds() {
    this.selectedTaskIds = [];
  }

  setApplicationType(typeName: string) {
    this.applicationType = typeName;
  }

  clearApplicationType() {
    this.applicationType = null;
  }
}

const taskStore = new TaskStore();

export default taskStore;
