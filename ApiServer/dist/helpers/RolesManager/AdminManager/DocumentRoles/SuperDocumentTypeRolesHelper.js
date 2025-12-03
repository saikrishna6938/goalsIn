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
exports.getTaskEntityId = exports.getAssignedApprovers = exports.validateUserAccess = exports.getFilteredDocumentTypes = exports.getUserDocumentTypes = exports.deleteDocumentTypeRole = exports.updateDocumentTypeRole = exports.insertDocumentTypeRole = exports.getDocumentTypeRoles = void 0;
const SqlQueryCreator_1 = require("../../../generic/SqlQueryCreator");
const UserRolesManagerHelper_1 = require("../UserManager/UserRolesManagerHelper");
function getDocumentTypeRoles(connection, condition) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = (0, SqlQueryCreator_1.generateSQLQuery)("SELECT", "SuperDocumentTypeRoles", {}, {
            documentTypeRoleId: "number",
            documentTypeId: "number",
            roleNameId: "number",
            documentSecurity: "string",
        }, condition);
        const [rows] = yield connection.execute(query);
        return rows;
    });
}
exports.getDocumentTypeRoles = getDocumentTypeRoles;
function insertDocumentTypeRole(connection, body) {
    return __awaiter(this, void 0, void 0, function* () {
        const insertQuery = (0, SqlQueryCreator_1.generateSQLQuery)("INSERT", "SuperDocumentTypeRoles", body, {
            documentTypeId: "number",
            roleNameId: "number",
            documentSecurity: "string",
        });
        const { documentTypeId, roleNameId, documentSecurity } = body;
        if (!documentTypeId || !roleNameId || !documentSecurity) {
            throw new Error("documentTypeId, roleNameId, and documentSecurity are required for inserting a document type role");
        }
        yield connection.execute(insertQuery, [
            documentTypeId,
            roleNameId,
            documentSecurity,
        ]);
    });
}
exports.insertDocumentTypeRole = insertDocumentTypeRole;
function updateDocumentTypeRole(connection, body) {
    return __awaiter(this, void 0, void 0, function* () {
        const updateQuery = (0, SqlQueryCreator_1.generateSQLQuery)("UPDATE", "SuperDocumentTypeRoles", body, {
            documentTypeId: "number",
            roleNameId: "number",
            documentSecurity: "string",
        }, `documentTypeRoleId = ?`);
        const { documentTypeRoleId, documentTypeId, roleNameId, documentSecurity } = body;
        if (!documentTypeRoleId) {
            throw new Error("documentTypeRoleId is required for updating a document type role");
        }
        const values = [documentTypeId, roleNameId, documentSecurity].filter((value) => value !== undefined);
        values.push(documentTypeRoleId);
        yield connection.execute(updateQuery, values);
    });
}
exports.updateDocumentTypeRole = updateDocumentTypeRole;
function deleteDocumentTypeRole(connection, documentTypeRoleId) {
    return __awaiter(this, void 0, void 0, function* () {
        const deleteQuery = (0, SqlQueryCreator_1.generateSQLQuery)("DELETE", "SuperDocumentTypeRoles", {}, {
            documentTypeRoleId: "number",
        }, `documentTypeRoleId = ?`);
        if (!documentTypeRoleId) {
            throw new Error("documentTypeRoleId is required for deleting a document type role");
        }
        yield connection.execute(deleteQuery, [documentTypeRoleId]);
    });
}
exports.deleteDocumentTypeRole = deleteDocumentTypeRole;
function getUserDocumentTypes(connection, userId, typeId = 2) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userId) {
            throw new Error("userId is required to fetch document types");
        }
        const query = `
      SELECT 
          dt.documentTypeId,
          dt.documentTypeName,
          dt.documentTypeObjectId,
          dt.tableName,
          dt.documentTagObjectId,
          dt.documentGroupId,
          dt.documentTypeTableId,
          dg.documentGroupName,
          srt.roleTypeId,
          srt.roleTypeName,
          sdtr.documentSecurity
      FROM 
          SuperUserRoles sur
      JOIN 
          SuperRoleNames srn ON sur.userRoleNameId = srn.roleNameId
      JOIN 
          SuperRoleTypes srt ON srn.roleTypeId = srt.roleTypeId
      JOIN 
          SuperDocumentTypeRoles sdtr ON srn.roleNameId = sdtr.roleNameId
      JOIN 
          DocumentType dt ON sdtr.documentTypeId = dt.documentTypeId
      JOIN
          DocumentGroup dg ON dt.documentGroupId = dg.documentGroupId AND dg.groupTypeId = '${typeId}'
      WHERE 
          sur.userId = ?
      GROUP BY 
          dt.documentTypeId, 
          dt.documentTypeName,
          dt.documentTypeObjectId,
          dt.tableName,
          dt.documentGroupId,
          dt.documentTypeTableId,
          dg.documentGroupName,
          srt.roleTypeId,
          srt.roleTypeName,
          sdtr.documentSecurity;
  `;
        const [rows] = yield connection.execute(query, [userId]);
        return rows;
    });
}
exports.getUserDocumentTypes = getUserDocumentTypes;
//Filter the user documents using userId and roleTypeId
function getFilteredDocumentTypes(connection, userId, roleTypeId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userId || !roleTypeId) {
            throw new Error("Both userId and roleTypeId are required to fetch filtered document types");
        }
        const query = `
        SELECT 
            dt.documentTypeId,
            dt.documentTypeName,
            srt.roleTypeId,
            srt.roleTypeName,
            sdtr.documentSecurity
        FROM 
            SuperUserRoles sur
        JOIN 
            SuperRoleNames srn ON sur.userRoleNameId = srn.roleNameId
        JOIN 
            SuperRoleTypes srt ON srn.roleTypeId = srt.roleTypeId
        JOIN 
            SuperDocumentTypeRoles sdtr ON srn.roleNameId = sdtr.roleNameId
        JOIN 
            DocumentType dt ON sdtr.documentTypeId = dt.documentTypeId
        WHERE 
            sur.userId = ? AND srt.roleTypeId = ?;
    `;
        const [rows] = yield connection.execute(query, [userId, roleTypeId]);
        return rows;
    });
}
exports.getFilteredDocumentTypes = getFilteredDocumentTypes;
function validateUserAccess(connection, taskId, userId, entity) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!taskId || !userId) {
            throw new Error("Both taskId and userId are required");
        }
        const entities = yield (0, UserRolesManagerHelper_1.getUserEntities)(connection, userId);
        // Step 1: Fetch task details and documentTypeId
        const [taskRows] = yield connection.execute(`SELECT * FROM Tasks WHERE taskId = ?`, [taskId]);
        const task = taskRows[0];
        if (!task) {
            return { accessGranted: false, message: "Task not found" };
        }
        const approvers = yield getAssignedApprovers(connection, task.documentStateId, Number(entity));
        const [taskEntityRows] = yield connection.execute(`SELECT taskEntityId FROM TaskEntities WHERE taskId = ?`, [taskId]);
        //@ts-ignore
        const taskEntities = taskEntityRows.map((row) => row.taskEntityId);
        // Step 2: Check if taskEntityId is included in entities
        const entityIds = entities.map((entity) => entity.entityId);
        const isTaskEntityIncluded = taskEntities.some((taskEntityId) => entityIds.includes(taskEntityId));
        if (!isTaskEntityIncluded) {
            return { accessGranted: false, message: "Don't have access" };
        }
        // Step 3: Check user access in SuperDocumentTypeRoles
        const [accessRows] = yield connection.execute(`
      SELECT 
          sdtr.roleNameId, sdtr.documentSecurity
      FROM 
          SuperDocumentTypeRoles sdtr
      WHERE 
          sdtr.documentTypeId = ?
      `, [task.documentTypeId]);
        const documentAccess = accessRows;
        if (!documentAccess || documentAccess.length === 0) {
            return {
                accessGranted: false,
                message: "No access configuration found for this document type",
            };
        }
        const roleNameIds = documentAccess.map((access) => access.roleNameId);
        // Step 4: Verify if user has any of the required roleNameId
        const [userRoleRows] = yield connection.execute(`
      SELECT 
          1
      FROM 
          SuperUserRoles sur
      WHERE 
          sur.userId = ? AND sur.userRoleNameId IN (${roleNameIds
            .map(() => "?")
            .join(", ")})
      `, [userId, ...roleNameIds]);
        //@ts-ignore
        const hasAccess = userRoleRows.length > 0;
        if (!hasAccess) {
            return { accessGranted: false, message: "Access denied" };
        }
        // Step 5: Retrieve all users with the required roleNameIds and their documentSecurity
        const [usersRows] = yield connection.execute(`
      SELECT DISTINCT
          u.userId, 
          u.userName, 
          u.userEmail, 
          u.userFirstName, 
          u.userLastName,
          sdtr.documentSecurity
      FROM 
          Users u
      JOIN 
          SuperUserRoles sur ON u.userId = sur.userId
      JOIN 
          SuperDocumentTypeRoles sdtr ON sur.userRoleNameId = sdtr.roleNameId
      WHERE 
          sdtr.roleNameId IN (${roleNameIds.map(() => "?").join(", ")})
      `, [...roleNameIds]);
        const users = usersRows;
        return {
            accessGranted: true,
            message: "Access granted",
            taskUsers: users,
            taskDetails: task,
            taskApprovers: approvers,
        };
    });
}
exports.validateUserAccess = validateUserAccess;
function getAssignedApprovers(connection, documentStateId, entityId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!documentStateId || !entityId) {
            throw new Error("Both documentStateId and entityId are required");
        }
        // Step 1: Fetch roleNameIds for the documentStateId
        const [roleRows] = yield connection.execute(`
      SELECT 
          dsa.roleNameId
      FROM 
          DocumentStatesApprovers dsa
      WHERE 
          dsa.documentStatesId = ?
      `, [documentStateId]);
        //@ts-ignore
        const roleNameIds = roleRows.map((row) => row.roleNameId);
        if (roleNameIds.length === 0) {
            return [];
        }
        // Step 2: Fetch users filtered by entityId
        const [entityFilteredUsersRows] = yield connection.execute(`
      SELECT DISTINCT
          u.userId, 
          u.userName, 
          u.userEmail, 
          u.userFirstName, 
          u.userLastName, 
          u.userPhoneOne,
          sur.userRoleNameId
      FROM 
          Users u
      JOIN 
          SuperUserRoles sur ON u.userId = sur.userId
      JOIN 
          Structure s ON sur.userRoleNameId = s.userRoleNameId
      WHERE 
          s.entityId = ?
      `, [entityId]);
        const entityFilteredUsers = entityFilteredUsersRows;
        // Step 3: Filter users by checking their roles
        const assignedApprovers = yield Promise.all(entityFilteredUsers.map((user) => __awaiter(this, void 0, void 0, function* () {
            const roles = yield (0, UserRolesManagerHelper_1.getSuperUserRolesByUserId)(connection, user.userId);
            if (roles.some((r) => roleNameIds.includes(r.roleNameId))) {
                return user;
            }
            return null;
        })));
        // Filter out null values from the assignedApprovers array
        const filteredApprovers = assignedApprovers.filter((approver) => approver !== null);
        return filteredApprovers.map((user) => ({
            userId: user.userId,
            userName: user.userName,
            userEmail: user.userEmail,
            userFirstName: user.userFirstName,
            userLastName: user.userLastName,
            userPhoneOne: user.userPhoneOne,
        }));
    });
}
exports.getAssignedApprovers = getAssignedApprovers;
function getTaskEntityId(connection, taskId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!taskId) {
            throw new Error("taskId is required to fetch task entities");
        }
        const query = `
      SELECT taskEntityId 
      FROM TaskEntities 
      WHERE taskId = ?
  `;
        const [rows] = yield connection.execute(query, [taskId]);
        //@ts-ignore
        return rows.map((row) => row.taskEntityId);
    });
}
exports.getTaskEntityId = getTaskEntityId;
//# sourceMappingURL=SuperDocumentTypeRolesHelper.js.map