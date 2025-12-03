"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMarkAsRead = exports.insertNotesView = exports.getUserNotes = void 0;
function getUserNotes(connection, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const [result] = yield connection.execute("SELECT N.*, NV.notes_view_id AS id,NV.seen, T.taskName FROM NotesViews NV INNER JOIN Notes N ON N.noteId = NV.notes_id LEFT JOIN Tasks T ON T.taskId = N.noteTaskId WHERE NV.user_id = ? AND NV.seen = '0'", [userId]);
        return result;
    });
}
exports.getUserNotes = getUserNotes;
function insertNotesView(connection, users, lastInsertId) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = "INSERT INTO `NotesViews` (`notes_view_id`, `notes_id`, `user_id`, `seen`) VALUES ";
        const values = users
            .map((id) => `(NULL, '${lastInsertId}', '${id}', '0')`)
            .join(", ");
        query += values;
        if (users.length > 0) {
            const [res] = yield connection.execute(query);
            return res;
        }
    });
}
exports.insertNotesView = insertNotesView;
function updateMarkAsRead(connection, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const [result] = yield connection.execute("UPDATE NotesViews SET seen = '1' WHERE user_Id = ?", [userId]);
            return result;
        }
        catch (error) {
            throw new Error("Failed to mark as read");
        }
    });
}
exports.updateMarkAsRead = updateMarkAsRead;
//# sourceMappingURL=TaskNotes.js.map