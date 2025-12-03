import { LoginResponse } from "app/types/User";
import { Task } from "app/user/tasks/Task";
import { action, makeAutoObservable } from "mobx";
import { io, Socket } from "socket.io-client";

class AppStore {
  loginResponse: LoginResponse;
  selectedEntity: number = -1;
  showEntityDialog: boolean = false;
  userEntities: Entity[] = [];
  loading: boolean = false;
  tasksData: Task[] = [];
  socket?: Socket;
  toastOpen: boolean = false;
  toastMessage: string = "";
  toastSeverity: "error" | "success" | "info" | "warning" = "success";

  constructor() {
    this.loginResponse = {} as any;

    makeAutoObservable(this, {
      setSelectedEntity: action,
      setShowEntityDialog: action,
      setLoginResponse: action,
      setUserEntities: action,
      setToastOpen: action,
      setToastMessage: action,
      setToastSeverity: action,
      showToast: action,
      clearToast: action,
    });
  }

  setToastOpen(open: boolean) {
    this.toastOpen = open;
  }

  setToastMessage(message: string) {
    this.toastMessage = message;
  }

  setToastSeverity(severity: "error" | "success" | "info" | "warning") {
    this.toastSeverity = severity;
  }

  showToast(
    message: string,
    severity: "error" | "success" | "info" | "warning"
  ) {
    this.setToastOpen(true);
    this.setToastMessage(message);
    this.setToastSeverity(severity);
  }

  clearToast() {
    this.setToastMessage("");
    this.setToastSeverity("info");
  }

  // async loadSocket(url?: string) {
  //   try {
  //     // Reuse existing active connection
  //     if (this.socket && this.socket.connected) return this.socket;

  //     const socketUrl = "http://localhost:5200";
  //     // url || process.env.REACT_APP_SOCKET_URL || "http://localhost:5200";

  //     // Keep options minimal to avoid CORS/transport pitfalls unless required
  //     const socketPath = process.env.REACT_APP_SOCKET_PATH;
  //     this.socket = io(socketUrl, {
  //       ...(socketPath ? { path: socketPath } : {}),
  //     });

  //     this.socket.on("connect", () => {
  //       console.log("Socket connected:", this.socket?.id);
  //     });

  //     this.socket.on("disconnect", (reason) => {
  //       console.log("Socket disconnected:", reason);
  //     });
  //     this.socket.on("connect_error", (err) => {
  //       console.error("Socket connect_error:", err?.message || err);
  //     });
  //     this.socket.on("error", (err) => {
  //       console.error("Socket error:", err);
  //     });

  //     // Manager-level diagnostics
  //     const mgr = this.socket.io;
  //     mgr.on("reconnect_attempt", (attempt) =>
  //       console.log("Socket reconnect_attempt:", attempt)
  //     );
  //     mgr.on("reconnect_error", (err) =>
  //       console.error("Socket reconnect_error:", err?.message || err)
  //     );
  //     mgr.on("reconnect_failed", () =>
  //       console.error("Socket reconnect_failed")
  //     );
  //     console.log("Connecting to socket:", socketUrl);

  //     return this.socket;
  //   } catch (err) {
  //     console.error("Failed to initialize socket:", err);
  //     return undefined;
  //   }
  // }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setCurrentTasks(tasks: Task[]) {
    this.tasksData = tasks;
  }

  setSelectedEntity(entity: number) {
    this.selectedEntity = entity;
  }

  setShowEntityDialog(showEntityDialog: boolean) {
    this.showEntityDialog = showEntityDialog;
  }

  setLoginResponse(response: LoginResponse) {
    this.loginResponse = response;
  }

  setUserEntities(entities: Entity[]) {
    this.userEntities = entities;
  }
}

const appStore = new AppStore();

export default appStore;
