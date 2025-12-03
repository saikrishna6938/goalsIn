"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.actionsController = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../keys"));
class ActionsController {
    index(req, res) {
        res.send(" Hello from controller");
    }
    test(req, res) {
        res.send(req.body);
    }
    getDocumentStateName(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { documentStateId } = req.body;
                connection = yield mysql.createConnection(keys_1.default.database);
                const [rows] = yield connection.execute(`SELECT *  FROM DocumentStates WHERE documentStateId = ?`, [documentStateId]);
                if (rows[0]) {
                    res.json({
                        status: true,
                        message: "Success",
                        data: rows[0].documentStateName,
                    });
                }
                else {
                    res.json({ status: false, message: "Failed", data: "" });
                }
            }
            catch (error) {
                console.log(error);
                res.json({ status: false, message: "Failed to get object" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (e) {
                        console.error("Error closing MySQL connection:", e);
                    }
                }
            }
        });
    }
    getTaskWorkflowByTaskId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { taskId } = req.params; // Assuming taskId is passed as a URL parameter
                connection = yield mysql.createConnection(keys_1.default.database);
                const query = `
        SELECT TW.*,
        U.userFirstName,
        U.userLastName,
        A.actionName FROM TaskWorkflow TW
        INNER JOIN 
        Users U ON TW.taskUserId = U.userId
      INNER JOIN 
        Actions A ON TW.taskActionId = A.actionId
        WHERE taskId = ?
      `;
                const [rows] = yield connection.execute(query, [taskId]);
                //@ts-ignore
                if (rows.length > 0) {
                    res.json({ status: true, message: "Success", data: rows });
                }
                else {
                    res.json({
                        status: false,
                        message: "No task workflow found for the given Task ID",
                        data: [],
                    });
                }
            }
            catch (error) {
                console.log(error);
                res.json({
                    status: false,
                    message: "Failed to get task workflow details",
                });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (e) {
                        console.error("Error closing MySQL connection:", e);
                    }
                }
            }
        });
    }
    insertTaskWorkflow(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { taskId, taskSelectedOption, taskNote, taskUserId, taskActionId } = req.body; // Extracting data from request body
                connection = yield mysql.createConnection(keys_1.default.database);
                const query = `
        INSERT INTO TaskWorkflow (taskId, taskSelectedOption, taskNote, taskWorkflowDate, taskUserId, taskActionId)
        VALUES (?, ?, ?, NOW(), ?, ?)
      `;
                const [result] = yield connection.execute(query, [
                    taskId,
                    taskSelectedOption,
                    taskNote,
                    taskUserId,
                    taskActionId,
                ]);
                //@ts-ignore
                if (result.affectedRows > 0) {
                    res.json({ status: true, message: "TaskWorkflow added successfully" });
                }
                else {
                    res.json({ status: false, message: "Failed to add TaskWorkflow" });
                }
            }
            catch (error) {
                console.log(error);
                res.json({
                    status: false,
                    message: "Failed to insert task workflow data",
                });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (e) {
                        console.error("Error closing MySQL connection:", e);
                    }
                }
            }
        });
    }
    updateDocumentStateByAction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { actionId, taskId, userId } = req.body; // TaskId is assumed to identify which task to update
                connection = yield mysql.createConnection(keys_1.default.database);
                // Get the fromStateId and toStateId for the given actionId
                const [transitionRows] = yield connection.execute(`SELECT fromStateId, toStateId FROM ActionStateTransitions WHERE actionId = ?`, [actionId]);
                if (!transitionRows[0]) {
                    return res.json({ status: false, message: "Action not found" });
                }
                const { fromStateId, toStateId } = transitionRows[0];
                if (fromStateId !== toStateId) {
                    // Update the documentStateId of the Tasks table to toStateId
                    const [updateResult] = yield connection.execute(`UPDATE Tasks SET documentStateId = ? WHERE taskId = ?`, [toStateId, taskId]);
                    //@ts-ignore
                    if (updateResult.affectedRows > 0) {
                        res.json({ status: true, message: "Task updated successfully" });
                    }
                    else {
                        res.json({ status: false, message: "Failed to update task" });
                    }
                }
                else {
                    res.json({ status: true, message: "Task updated successfully" });
                }
            }
            catch (error) {
                console.log(error);
                res.json({ status: false, message: "Failed to process action" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (e) {
                        console.error("Error closing MySQL connection:", e);
                    }
                }
            }
        });
    }
    geDocumentActions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { documentStateId, userType, taskId } = req.body;
                connection = yield mysql.createConnection(keys_1.default.database);
                const query = `
        SELECT 
          A.*, 
          OD.options
        FROM 
          Actions A
        INNER JOIN 
          userActions UA ON A.actionId = UA.actionId
        LEFT JOIN 
          OptionsData OD ON A.optionId = OD.optionId
        WHERE 
          A.documentStateId = ? AND UA.userType = ? AND UA.actionTaskId = ?
      `;
                const [rows] = yield connection.execute(query, [
                    documentStateId,
                    userType,
                    taskId,
                ]);
                //@ts-ignore
                if (rows.length > 0) {
                    //@ts-ignore
                    const parsedRows = rows.map((row) => {
                        if (row.options) {
                            try {
                                // Parse the options JSON string
                                row.options = JSON.parse(row.options);
                            }
                            catch (error) {
                                console.error("Error parsing options JSON:", error);
                                row.options = null; // or however you want to handle the parse error
                            }
                        }
                        return row;
                    });
                    res.json({ status: true, message: "Success", data: parsedRows });
                }
                else {
                    res.json({ status: false, message: "Failed", data: [] });
                }
            }
            catch (error) {
                console.log(error);
                res.json({ status: false, message: "Failed to get object" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (e) {
                        console.error("Error closing MySQL connection:", e);
                    }
                }
            }
        });
    }
}
exports.actionsController = new ActionsController();
//# sourceMappingURL=ActionsController.js.map