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
exports.updateSuperRoleName = exports.deleteSuperRoleName = exports.insertSuperRoleName = exports.getSuperRoleNames = void 0;
const roles_1 = require("../../../../objects/Roles/roles");
const SqlQueryCreator_1 = require("../../../generic/SqlQueryCreator");
// Function to get all role names
function getSuperRoleNames(connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = `SELECT * FROM SuperRoleNames`;
        const [rows] = yield connection.execute(query);
        return rows;
    });
}
exports.getSuperRoleNames = getSuperRoleNames;
// Function to insert a new role name
function insertSuperRoleName(connection, body) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = `
        INSERT INTO SuperRoleNames (roleTypeId, roleName, roleNameDescription)
        VALUES (?, ?, ?)
    `;
        const { roleTypeId, roleName, roleNameDescription } = body;
        // Validate required fields
        if (!roleTypeId || !roleName) {
            throw new Error("roleTypeId and roleName are required to insert a role name");
        }
        yield connection.execute(query, [
            roleTypeId,
            roleName,
            roleNameDescription || null,
        ]);
    });
}
exports.insertSuperRoleName = insertSuperRoleName;
// Function to delete a role name by ID
function deleteSuperRoleName(connection, roleNameId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = `DELETE FROM SuperRoleNames WHERE roleNameId = ?`;
        // Validate required ID
        if (!roleNameId) {
            throw new Error("roleNameId is required to delete a role name");
        }
        yield connection.execute(query, [roleNameId]);
    });
}
exports.deleteSuperRoleName = deleteSuperRoleName;
// Function to update a role name
function updateSuperRoleName(connection, body) {
    return __awaiter(this, void 0, void 0, function* () {
        // Validate required fields
        if (!body.roleNameId) {
            throw new Error("roleNameId is required for updating a role name");
        }
        // Dynamically generate the query
        const updateQuery = (0, SqlQueryCreator_1.generateSQLQuery)("UPDATE", "SuperRoleNames", body, roles_1.SuperRoleNameTable, `roleNameId = ?`, "roleNameId");
        // Dynamically collect values for placeholders
        const values = Object.keys(body)
            .filter((key) => key !== "roleNameId" && body[key] !== undefined) // Exclude `roleNameId` from SET
            .map((key) => body[key]);
        values.push(body.roleNameId); // Add `roleNameId` for WHERE condition
        // Execute the query
        yield connection.execute(updateQuery, values);
    });
}
exports.updateSuperRoleName = updateSuperRoleName;
//# sourceMappingURL=SuperRoleNamesHelper.js.map