"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const NotesController_1 = require("../controllers/NotesController");
const routeHelpers_1 = require("../utils/routeHelpers");
class NotesRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post((0, routeHelpers_1.withBasePath)("addNote"), NotesController_1.notesController.addNote);
        this.router.delete((0, routeHelpers_1.withBasePath)("deleteNote/:noteId"), NotesController_1.notesController.deleteNote);
        this.router.get((0, routeHelpers_1.withBasePath)("task/notes/:taskId"), NotesController_1.notesController.getNotesByTaskId);
        this.router.get((0, routeHelpers_1.withBasePath)("markread/:noteUserId"), NotesController_1.notesController.MarkAllNotesAsRead);
    }
}
const notesRoutes = new NotesRoutes();
exports.default = notesRoutes.router;
