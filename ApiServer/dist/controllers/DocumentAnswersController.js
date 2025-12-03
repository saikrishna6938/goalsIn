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
exports.documentAnswers = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../keys"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const EmailHelper_1 = require("../EmailHelper");
const UserRolesManagerHelper_1 = require("../helpers/RolesManager/AdminManager/UserManager/UserRolesManagerHelper");
const SuperDocumentTypeRolesHelper_1 = require("../helpers/RolesManager/AdminManager/DocumentRoles/SuperDocumentTypeRolesHelper");
const TaskHelpers_1 = require("../helpers/tasks/TaskHelpers");
const groupIndexType_1 = require("./Tasks/groupIndexType");
class DocumentAnswersController {
    getDocumentAnswerObject(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { taskId } = req.body;
                connection = yield mysql.createConnection(keys_1.default.database);
                // Fetch answer id plus helpful context so we can normalize shapes
                const [rows] = yield connection.execute(`SELECT documentTypeAnswersId, documentTypeId, userId FROM Tasks WHERE taskId = ?`, [taskId]);
                if (rows[0]) {
                    const documentTypeAnswersId = rows[0].documentTypeAnswersId;
                    const taskDocumentTypeId = rows[0].documentTypeId;
                    const taskUserId = rows[0].userId;
                    const indexType = yield (0, groupIndexType_1.getIndexName)(taskId);
                    if (indexType === "Index") {
                        // Get DocumentTagAnswers then map keys to DocumentTypeAnswers-like keys
                        const [result] = yield connection.execute(`SELECT * FROM DocumentTagAnswers WHERE documentTagAnswersId = ?`, [documentTypeAnswersId]);
                        //@ts-ignore
                        const tagRow = result && result.length ? result[0] : null;
                        if (!tagRow) {
                            res.json({ status: false, message: "No records found", data: {} });
                            return;
                        }
                        // Map to DocumentTypeAnswers shape
                        const normalized = {
                            documentTypeAnswersId: tagRow.documentTagAnswersId,
                            documentTypeAnswersObject: tagRow.documentTagAnswersObject,
                            documentTypeId: taskDocumentTypeId !== null && taskDocumentTypeId !== void 0 ? taskDocumentTypeId : null,
                            userId: taskUserId !== null && taskUserId !== void 0 ? taskUserId : null,
                            createdDate: (_a = tagRow.createdDate) !== null && _a !== void 0 ? _a : null,
                            updatedDate: (_b = tagRow.updatedDate) !== null && _b !== void 0 ? _b : null,
                        };
                        res.json({ status: true, message: "Success", data: normalized });
                    }
                    else {
                        const [result] = yield connection.execute(`SELECT *  FROM  DocumentTypeAnswers WHERE documentTypeAnswersId = ?`, [documentTypeAnswersId]);
                        res.json({ status: true, message: "Success", data: result[0] });
                    }
                }
                else {
                    res.json({ status: false, message: "Failed", data: {} });
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
                    catch (_c) { }
                }
            }
        });
    }
    getUserAndDocumentDetailsByAnswerId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { documentTypeAnswersId } = req.body; // Assuming you're getting documentTypeAnswersId from the request body.
                connection = yield mysql.createConnection(keys_1.default.database);
                const [rows] = yield connection.execute(`SELECT 
           Users.userId AS id,
           Users.userName,
           CONCAT(Users.userFirstName, ' ', Users.userLastName) AS Name,
           Users.userEnabled,
           Users.userLocked,
           Users.userEmail,
           Users.userImage,
           DocumentTypeAnswers.*,
           DocumentType.*,
           DocumentGroup.groupTypeId,
           DocumentTypeObject.documentTypeObject
         FROM DocumentTypeAnswers
         JOIN Users ON Users.userId = DocumentTypeAnswers.userId
         LEFT JOIN DocumentType ON DocumentTypeAnswers.documentTypeId = DocumentType.documentTypeId
         LEFT JOIN DocumentGroup ON DocumentGroup.documentGroupId = DocumentType.documentGroupId
         INNER JOIN DocumentTypeObject ON DocumentTypeObject.documentTypeObjectId = DocumentType.documentTypeObjectId
         WHERE DocumentTypeAnswers.documentTypeAnswersId = ?;`, [documentTypeAnswersId]);
                //@ts-ignore
                let parsedData = rows.map((item) => {
                    // Parse the documentTypeObject string into a JavaScript object
                    let documentTypeObject = JSON.parse(item.documentTypeObject);
                    // Return a new object that includes the original data plus the parsed object
                    return Object.assign(Object.assign({}, item), { documentTypeObject });
                });
                //@ts-ignore
                if (rows && rows.length > 0) {
                    res.json({ status: true, message: "Success", data: parsedData[0] });
                }
                else {
                    res.json({ status: false, message: "No records found", data: {} });
                }
            }
            catch (error) {
                console.log(error);
                res.json({
                    status: false,
                    message: "Failed to get user and document details",
                });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    getApplications(req, res) {
        var _a, _b, _c, _d, _e, _f, _g;
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const userIdInput = (_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.userId) !== null && _b !== void 0 ? _b : (_c = req.query) === null || _c === void 0 ? void 0 : _c.userId;
                const entityIdInput = (_e = (_d = req.body) === null || _d === void 0 ? void 0 : _d.entityId) !== null && _e !== void 0 ? _e : (_f = req.query) === null || _f === void 0 ? void 0 : _f.entityId;
                const normalizeNumeric = (value) => {
                    if (typeof value === "number") {
                        return Number.isNaN(value) ? null : value;
                    }
                    if (typeof value === "string") {
                        const parsed = parseInt(value.trim(), 10);
                        return Number.isNaN(parsed) ? null : parsed;
                    }
                    return null;
                };
                const userId = normalizeNumeric(userIdInput);
                const entityId = normalizeNumeric(entityIdInput);
                if (userId === null) {
                    res.status(400).json({ status: false, message: "userId is required" });
                    return;
                }
                if (entityId === null) {
                    res
                        .status(400)
                        .json({ status: false, message: "entityId is required" });
                    return;
                }
                const rawPeriod = ((_g = req.query.period) !== null && _g !== void 0 ? _g : req.body.period);
                const periodValue = (() => {
                    if (typeof rawPeriod === "number")
                        return rawPeriod;
                    if (typeof rawPeriod === "string") {
                        const parsed = parseInt(rawPeriod, 10);
                        return Number.isNaN(parsed) ? undefined : parsed;
                    }
                    return undefined;
                })();
                const allowedPeriods = new Set([3, 6, 9, 12]);
                let periodStartDate = null;
                if (periodValue && allowedPeriods.has(periodValue)) {
                    const startDate = new Date();
                    startDate.setMonth(startDate.getMonth() - periodValue);
                    periodStartDate = startDate.toISOString().slice(0, 19).replace("T", " ");
                }
                connection = yield mysql.createConnection(keys_1.default.database);
                const entityRoleName = yield (0, UserRolesManagerHelper_1.getEntityRoleName)(connection, entityId);
                console.log(entityRoleName);
                const accessibleDocumentTypes = yield (0, SuperDocumentTypeRolesHelper_1.getUserDocumentTypes)(connection, userId);
                const documentTypeIds = accessibleDocumentTypes
                    .map((doc) => doc.documentTypeId)
                    .filter((id) => typeof id === "number" && !Number.isNaN(id));
                if (documentTypeIds.length === 0) {
                    res.json({ status: true, message: "No records", data: [] });
                    return;
                }
                const periodFilterClause = periodStartDate
                    ? " AND COALESCE(DocumentTypeAnswers.updatedDate, DocumentTypeAnswers.createdDate) >= ?"
                    : "";
                const docTypePlaceholders = documentTypeIds.map(() => "?").join(", ");
                const docTypeFilterClause = ` AND DocumentType.documentTypeId IN (${docTypePlaceholders})`;
                const queryParams = [entityRoleName, ...documentTypeIds];
                if (periodStartDate) {
                    queryParams.push(periodStartDate);
                }
                const [rows] = yield connection.execute(`SELECT 
            Users.userId,
            Users.userName,
            CONCAT(Users.userFirstName, ' ', Users.userLastName) AS Name,
            Users.userEnabled,
            Users.userLocked,
            DocumentTypeAnswers.documentTypeAnswersId AS id,
            DocumentTypeAnswers.createdDate,
            DocumentTypeAnswers.updatedDate,
            dg.documentGroupName,
            DocumentType.documentTypeId,
            DocumentType.documentTypeName,
           DocumentType.documentTypeTableId
        FROM DocumentTypeAnswers
        LEFT JOIN DocumentType ON DocumentTypeAnswers.documentTypeId = DocumentType.documentTypeId
        LEFT JOIN DocumentGroup dg ON dg.documentGroupId = DocumentType.documentGroupId 
        JOIN SuperUserRoles sur ON sur.userRoleNameId = ?
        JOIN Users ON Users.userId = sur.userId
        WHERE Users.userId = DocumentTypeAnswers.userId AND dg.groupTypeId = 2${docTypeFilterClause}${periodFilterClause}`, queryParams);
                //@ts-ignore
                if (rows && rows.length > 0) {
                    res.json({ status: true, message: "Success", data: rows });
                }
                else {
                    res.json({ status: true, message: "No records", data: [] });
                }
            }
            catch (error) {
                console.log(error);
                res.json({
                    status: false,
                    message: "Failed to get user and document details",
                });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_h) { }
                }
            }
        });
    }
    indexDocumentAnswerObject(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { documentTypeId, userId, documentTypeAnswersObject, tasks, entityId, notifyUserIds = [], } = req.body;
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute("INSERT INTO DocumentTypeAnswers(documentTypeId,userId,documentTypeAnswersObject) VALUES (?,?,?)", [documentTypeId, userId, documentTypeAnswersObject]);
                //@ts-ignore
                const lastInsertId = result.insertId;
                const [rows] = yield connection.execute("SELECT U.userFirstName,U.userLastName,U.userEmail from Users as U WHERE userId = ?", [userId]);
                const user = Object.values(JSON.parse(JSON.stringify(rows)));
                try {
                    const filePath = path_1.default.join(__dirname, "letters", "applicationSubmitted.html");
                    const searchStrings = [/{{USER_NAME}}/g];
                    const replaceString = [
                        `${user[0].userFirstName} ${user[0].userLastName}`,
                    ];
                    let emailTemplate = yield promises_1.default.readFile(filePath, "utf8");
                    searchStrings.map((r, i) => {
                        emailTemplate = emailTemplate.replace(r, `${replaceString[i]}`);
                    });
                    const subject = "Profile Submitted Successfully";
                    (0, EmailHelper_1.sendEmail)(emailTemplate, user[0].userEmail, subject);
                }
                catch (e) {
                    console.warn("applicationSubmitted email template not sent:", (e === null || e === void 0 ? void 0 : e.message) || e);
                }
                res.json({ status: true, message: "Added Successfully" });
            }
            catch (error) {
                console.log(error);
                res.json({ status: false, message: "Failed to Add DocumentTypeObject" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    addDocumentAnswerObject(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { documentTypeId, userId, documentTypeAnswersObject, tasks, entityId, } = req.body;
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute("INSERT INTO DocumentTypeAnswers(documentTypeId,userId,documentTypeAnswersObject) VALUES (?,?,?)", [documentTypeId, userId, documentTypeAnswersObject]);
                //@ts-ignore
                const lastInsertId = result.insertId;
                const [rows] = yield connection.execute("SELECT U.userFirstName,U.userLastName,U.userEmail from Users as U WHERE userId = ?", [userId]);
                const user = Object.values(JSON.parse(JSON.stringify(rows)));
                const [docType] = (_a = (yield connection.execute("SELECT * from DocumentType WHERE documentTypeId = ?", [documentTypeId]))) !== null && _a !== void 0 ? _a : [];
                const taskAdded = (0, TaskHelpers_1.addTask)(connection, {
                    taskName: `${user[0].userFirstName} ${user[0].userLastName} - ${docType[0].documentTypeName}`,
                    answerObjectId: lastInsertId,
                    documentTypeId,
                    userId,
                    taskTableId: -1,
                    taskTagId: -1,
                    entityId,
                    notifyUserIds: [],
                });
                try {
                    const filePath = path_1.default.join(__dirname, "letters", "applicationSubmitted.html");
                    const searchStrings = [/{{USER_NAME}}/g];
                    const replaceString = [
                        `${user[0].userFirstName} ${user[0].userLastName}`,
                    ];
                    let emailTemplate = yield promises_1.default.readFile(filePath, "utf8");
                    searchStrings.map((r, i) => {
                        emailTemplate = emailTemplate.replace(r, `${replaceString[i]}`);
                    });
                    const subject = "Profile Submitted Successfully";
                    (0, EmailHelper_1.sendEmail)(emailTemplate, user[0].userEmail, subject);
                }
                catch (e) {
                    console.warn("applicationSubmitted email template not sent:", (e === null || e === void 0 ? void 0 : e.message) || e);
                }
                res.json({ status: true, message: "Added Successfully", taskAdded });
            }
            catch (error) {
                console.log(error);
                res.json({ status: false, message: "Failed to Add DocumentTypeObject" });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_b) { }
                }
            }
        });
    }
    updateDocumentAnswerObject(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { documentAnswerObject, documentTypeAnswerId } = req.body;
                if (documentAnswerObject === undefined ||
                    documentAnswerObject === null ||
                    !documentTypeAnswerId) {
                    return res.json({
                        status: false,
                        message: "Missing required fields: documentAnswerObject, documentTypeAnswerId",
                    });
                }
                connection = yield mysql.createConnection(keys_1.default.database);
                const [result] = yield connection.execute(`UPDATE DocumentTypeAnswers 
         SET documentTypeAnswersObject = ?, updatedDate = CURRENT_TIMESTAMP 
         WHERE documentTypeAnswersId = ?`, [documentAnswerObject, documentTypeAnswerId]);
                // @ts-ignore - mysql2 result typing
                const { affectedRows } = result || {};
                if (!affectedRows) {
                    return res.json({
                        status: false,
                        message: "No record updated. Invalid documentTypeAnswerId",
                    });
                }
                return res.json({ status: true, message: "Updated Successfully" });
            }
            catch (error) {
                console.log(error);
                return res.json({
                    status: false,
                    message: "Failed to update DocumentAnswerObject",
                });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    DeleteDocumentAnswerObject(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield mysql.createConnection(keys_1.default.database);
            }
            catch (error) { }
        });
    }
}
exports.documentAnswers = new DocumentAnswersController();
//# sourceMappingURL=DocumentAnswersController.js.map