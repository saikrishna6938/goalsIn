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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminNewslettersController = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const keys_1 = __importDefault(require("../../../keys"));
class AdminNewslettersController {
    constructor() { }
    //#region ---------- Newsletters ----------
    /**
     * Payload (GET): none
     */
    getNewsletters(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const query = `
        SELECT 
          n.newsletterId,
          n.newsletterName,
          n.newsletterTypeId,
          nt.typeName,
          nt.typeDescription
        FROM Newsletters n
        LEFT JOIN NewsletterType nt ON n.newsletterTypeId = nt.typeId
      `;
                const [rows] = yield connection.execute(query);
                res.status(200).json({ rows, status: true });
            }
            catch (error) {
                console.error("Error fetching newsletters:", error);
                res.status(500).json({ message: "Error fetching newsletters", error, status: false });
            }
            finally {
                yield connection.end();
            }
        });
    }
    /**
     * Payload (POST):
     * [
     *   {
     *     "newsletterName": "June Newsletter",
     *     "newsletterDescription": "Latest updates from June",
     *     "newsletterTypeId": 1
     *   }
     * ]
     */
    addNewsletters(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const newsletters = req.body;
            if (!Array.isArray(newsletters) || newsletters.length === 0) {
                return res.status(400).json({ message: "Invalid input: must be a non-empty array" });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const insertQuery = `
        INSERT INTO Newsletters (
          newsletterName,
          newsletterDescription,
          newsletterTypeId
        ) VALUES ?
      `;
                const values = newsletters.map((n) => [
                    n.newsletterName,
                    n.newsletterDescription || "",
                    n.newsletterTypeId,
                ]);
                const [result] = yield connection.query(insertQuery, [values]);
                res.status(201).json({
                    message: "Newsletters added successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error adding newsletters:", error);
                res.status(500).json({ message: "Error adding newsletters", error, status: false });
            }
            finally {
                yield connection.end();
            }
        });
    }
    /**
     * Payload (PUT):
     * {
     *   "newsletterId": 5,
     *   "newsletterName": "Updated Title",
     *   "newsletterDescription": "Updated Description",
     *   "newsletterTypeId": 2
     * }
     */
    updateNewsletter(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { newsletterId, newsletterName, newsletterDescription, newsletterTypeId } = req.body;
            if (!newsletterId) {
                return res.status(400).json({ message: "newsletterId is required for update" });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const updateQuery = `
        UPDATE Newsletters SET 
          newsletterName = ?, 
          newsletterDescription = ?, 
          newsletterTypeId = ?
        WHERE newsletterId = ?
      `;
                const [result] = yield connection.execute(updateQuery, [
                    newsletterName,
                    newsletterDescription,
                    newsletterTypeId,
                    newsletterId,
                ]);
                res.status(200).json({
                    message: "Newsletter updated successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error updating newsletter:", error);
                res.status(500).json({ message: "Error updating newsletter", error, status: false });
            }
            finally {
                yield connection.end();
            }
        });
    }
    /**
     * Payload (DELETE):
     * {
     *   "newsletterIds": [1, 2, 3]
     * }
     */
    deleteNewsletters(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { newsletterIds } = req.body;
            if (!Array.isArray(newsletterIds) || newsletterIds.length === 0) {
                return res.status(400).json({ message: "Invalid input: Provide newsletterIds" });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const deleteQuery = `DELETE FROM Newsletters WHERE newsletterId IN (?)`;
                const [result] = yield connection.query(deleteQuery, [newsletterIds]);
                res.status(200).json({
                    message: "Newsletters deleted successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error deleting newsletters:", error);
                res.status(500).json({ message: "Error deleting newsletters", error, status: false });
            }
            finally {
                yield connection.end();
            }
        });
    }
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            const { newslettersId } = req.params;
            try {
                const query = `
        SELECT 
          n.newsletterId,
          n.newsletterName,
          n.newsletterDescription,
          nt.typeId AS newsletterTypeId,
          nt.typeName,
          nt.typeDescription
        FROM Newsletters n
        LEFT JOIN NewsletterType nt ON n.newsletterTypeId = nt.typeId
        WHERE newsletterId = ?
      `;
                const [rows] = yield connection.execute(query, [newslettersId]);
                res.status(200).json({ rows, status: true });
            }
            catch (error) {
                console.error("Error fetching newsletters:", error);
                res.status(500).json({ message: "Error fetching newsletters", error, status: false });
            }
            finally {
                yield connection.end();
            }
        });
    }
    //#endregion
    //#region ---------- Newsletter Types ----------
    /**
     * Payload (GET): none
     */
    getNewsletterTypes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const [rows] = yield connection.execute(`SELECT * FROM NewsletterType`);
                res.status(200).json({ rows, status: true });
            }
            catch (error) {
                console.error("Error fetching newsletter types:", error);
                res.status(500).json({ message: "Error fetching newsletter types", error, status: false });
            }
            finally {
                yield connection.end();
            }
        });
    }
    /**
     * Payload (POST):
     * [
     *   {
     *     "typeName": "Marketing",
     *     "typeDescription": "Marketing campaigns"
     *   }
     * ]
     */
    addNewsletterTypes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const types = req.body;
            if (!Array.isArray(types) || types.length === 0) {
                return res.status(400).json({ message: "Invalid input: must be a non-empty array" });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const insertQuery = `
        INSERT INTO NewsletterType (
          typeName,
          typeDescription
        ) VALUES ?
      `;
                const values = types.map((t) => [t.typeName, t.typeDescription || ""]);
                const [result] = yield connection.query(insertQuery, [values]);
                res.status(201).json({
                    message: "Newsletter types added successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error adding newsletter types:", error);
                res.status(500).json({ message: "Error adding newsletter types", error, status: false });
            }
            finally {
                yield connection.end();
            }
        });
    }
    /**
     * Payload (PUT):
     * {
     *   "typeId": 1,
     *   "typeName": "Updated Name",
     *   "typeDescription": "Updated Description"
     * }
     */
    updateNewsletterType(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { typeId, typeName, typeDescription } = req.body;
            if (!typeId) {
                return res.status(400).json({ message: "typeId is required for update" });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const updateQuery = `
        UPDATE NewsletterType SET 
          typeName = ?, 
          typeDescription = ?
        WHERE typeId = ?
      `;
                const [result] = yield connection.execute(updateQuery, [
                    typeName,
                    typeDescription,
                    typeId,
                ]);
                res.status(200).json({
                    message: "Newsletter type updated successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error updating newsletter type:", error);
                res.status(500).json({ message: "Error updating newsletter type", error, status: false });
            }
            finally {
                yield connection.end();
            }
        });
    }
    /**
     * Payload (DELETE):
     * {
     *   "typeIds": [1, 2]
     * }
     */
    deleteNewsletterTypes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { typeIds } = req.body;
            if (!Array.isArray(typeIds) || typeIds.length === 0) {
                return res.status(400).json({ message: "Invalid input: Provide typeIds" });
            }
            const connection = yield promise_1.default.createConnection(keys_1.default.database);
            try {
                const deleteQuery = `DELETE FROM NewsletterType WHERE typeId IN (?)`;
                const [result] = yield connection.query(deleteQuery, [typeIds]);
                res.status(200).json({
                    message: "Newsletter types deleted successfully",
                    affectedRows: result["affectedRows"],
                    status: true,
                });
            }
            catch (error) {
                console.error("Error deleting newsletter types:", error);
                res.status(500).json({ message: "Error deleting newsletter types", error, status: false });
            }
            finally {
                yield connection.end();
            }
        });
    }
}
exports.AdminNewslettersController = AdminNewslettersController;
//# sourceMappingURL=AdminNewslettersController.js.map