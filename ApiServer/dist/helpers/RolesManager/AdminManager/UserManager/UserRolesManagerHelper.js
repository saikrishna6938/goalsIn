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
exports.getEntityRoleName = exports.getUsersByJob = exports.getUsersByEntityId = exports.getUserEntities = exports.getSuperUserRolesByUserId = void 0;
function getSuperUserRolesByUserId(connection, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userId) {
            throw new Error("userId is required to fetch roles");
        }
        const query = `
        SELECT
            srn.roleName AS roleName,
            srt.roleTypeId AS roleType,
            srn.roleNameId AS roleNameId,
            srt.roleTypeName AS roleTypeName
        FROM
            SuperUserRoles sur
        JOIN
            SuperRoleNames srn ON sur.userRoleNameId = srn.roleNameId
        JOIN
            SuperRoleTypes srt ON srn.roleTypeId = srt.roleTypeId
        WHERE
            sur.userId = ?;
    `;
        const [rows] = yield connection.execute(query, [userId]);
        return rows;
    });
}
exports.getSuperUserRolesByUserId = getSuperUserRolesByUserId;
function getUserEntities(connection, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userId) {
            throw new Error("userId is required to fetch entities");
        }
        const query = `
      SELECT 
          s.entityId,
          s.entityName,
          s.entityLocation,
          s.entityPhone,
          s.entityDescription
      FROM 
          SuperUserRoles sur
      JOIN 
          Structure s ON sur.userRoleNameId = s.userRoleNameId
      WHERE 
          sur.userId = ?;
  `;
        const [rows] = yield connection.execute(query, [userId]);
        return rows;
    });
}
exports.getUserEntities = getUserEntities;
function getUsersByEntityId(connection, entityId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!entityId) {
            throw new Error("entityId is required to fetch users");
        }
        // Dynamically construct the query based on userType
        let query = `
      SELECT 
          u.userId, 
          u.userName, 
          u.userEmail, 
          u.userFirstName, 
          u.userLastName, 
          u.userImage, 
          u.userAddress, 
          u.userServerEmail, 
          u.userPhoneOne, 
          u.userPhoneTwo, 
          u.userLastLogin, 
          u.userCreated, 
          u.userEnabled, 
          u.userLocked, 
          u.userType, 
          u.lastNotesSeen
      FROM 
          SuperUserRoles sur
      JOIN 
          Structure s ON sur.userRoleNameId = s.userRoleNameId
      JOIN 
          Users u ON sur.userId = u.userId
      WHERE 
          s.entityId = ?
  `;
        const queryParams = [entityId];
        const [rows] = yield connection.execute(query, queryParams);
        return rows;
    });
}
exports.getUsersByEntityId = getUsersByEntityId;
function getUsersByJob(connection, entityId, userType) {
    return __awaiter(this, void 0, void 0, function* () {
        if (entityId === undefined || entityId === null) {
            throw new Error("entityId is required to fetch users");
        }
        // Construct query dynamically based on entityId and userType
        let query = `
      SELECT DISTINCT 
          u.userId, 
          u.userName, 
          u.userEmail, 
          u.userFirstName, 
          u.userLastName, 
          CONCAT(u.userFirstName, ' ', u.userLastName) AS userFullName,
          u.userImage, 
          u.userAddress, 
          u.userServerEmail, 
          u.userPhoneOne, 
          u.userPhoneTwo, 
          u.userLastLogin, 
          u.userCreated, 
          u.userEnabled, 
          u.userLocked, 
          u.userType, 
          u.lastNotesSeen
      FROM 
          SuperUserRoles sur
      JOIN 
          Structure s ON sur.userRoleNameId = s.userRoleNameId
      JOIN 
          Users u ON sur.userId = u.userId
  `;
        const queryParams = [];
        // Adjust WHERE clause based on entityId and userType
        if (entityId !== -1) {
            query += ` WHERE s.entityId = ?`;
            queryParams.push(entityId);
        }
        if (userType !== 1 && userType !== -1) {
            // Add condition based on entityId presence
            query += entityId !== -1 ? ` AND u.userType = 2` : ` WHERE u.userType = 2`;
        }
        // Ensure u.userType != -1 is added correctly
        if (query.includes("WHERE")) {
            query += ` AND u.userType != -1`;
        }
        else {
            query += ` WHERE u.userType != -1`;
        }
        const [rows] = yield connection.execute(query, queryParams);
        return rows;
    });
}
exports.getUsersByJob = getUsersByJob;
function getEntityRoleName(connection, entityId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!entityId) {
            throw new Error("entityId is required");
        }
        const query = `
    SELECT sr.roleNameId
    FROM Structure s
    JOIN SuperRoleNames sr ON s.userRoleNameId = sr.roleNameId
    WHERE s.entityId = ?
  `;
        const [rows] = yield connection.execute(query, [entityId]);
        //@ts-ignore
        if (rows.length > 0) {
            return rows[0].roleNameId;
        }
        return null;
    });
}
exports.getEntityRoleName = getEntityRoleName;
//# sourceMappingURL=UserRolesManagerHelper.js.map