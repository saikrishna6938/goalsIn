import { Router } from "express";
import { notesController } from "../controllers/NotesController";
import { withBasePath } from "../utils/routeHelpers";

class NotesRoutes {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  private config() {
    this.router.post(withBasePath("addNote"), notesController.addNote);
    this.router.delete(withBasePath("deleteNote/:noteId"), notesController.deleteNote);
    this.router.get(withBasePath("task/notes/:taskId"), notesController.getNotesByTaskId);
    this.router.get(withBasePath("markread/:noteUserId"), notesController.MarkAllNotesAsRead);
  }
}

const notesRoutes = new NotesRoutes();
export default notesRoutes.router;
