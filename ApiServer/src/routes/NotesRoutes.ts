import { Router } from "express";
import keys from "../keys";
import { notesController } from "../controllers/NotesController";

class NotesRoutes {
  public router: Router = Router();

  constructor() {
    this.config();
  }

  config(): void {
    this.router.post(`${keys.basePath}addNote`, notesController.addNote); // Route to add a note
    this.router.delete(
      `${keys.basePath}deleteNote/:noteId`,
      notesController.deleteNote
    ); // Route to delete a note by ID
    this.router.get(
      `${keys.basePath}task/notes/:taskId`,
      notesController.getNotesByTaskId
    ); // Route to get notes by taskId
    this.router.get(
      `${keys.basePath}markread/:noteUserId`,
      notesController.MarkAllNotesAsRead
    );
  }
}

const notesRouter = new NotesRoutes();
export default notesRouter.router;
