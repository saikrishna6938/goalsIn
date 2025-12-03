"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keys_1 = __importDefault(require("../keys"));
const NotesController_1 = require("../controllers/NotesController");
class NotesRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post(`${keys_1.default.basePath}addNote`, NotesController_1.notesController.addNote); // Route to add a note
        this.router.delete(`${keys_1.default.basePath}deleteNote/:noteId`, NotesController_1.notesController.deleteNote); // Route to delete a note by ID
        this.router.get(`${keys_1.default.basePath}task/notes/:taskId`, NotesController_1.notesController.getNotesByTaskId); // Route to get notes by taskId
        this.router.get(`${keys_1.default.basePath}markread/:noteUserId`, NotesController_1.notesController.MarkAllNotesAsRead);
    }
}
const notesRouter = new NotesRoutes();
exports.default = notesRouter.router;
//# sourceMappingURL=NotesRoutes.js.map