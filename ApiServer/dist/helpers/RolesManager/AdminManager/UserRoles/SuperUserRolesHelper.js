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
exports.deleteMultipleSuperUserRoles = exports.insertMultipleSuperUserRoles = exports.updateMultipleSuperUserRoles = exports.getSuperUserRoles = exports.deleteSuperUserRole = exports.updateSuperUserRole = exports.insertSuperUserRole = void 0;
const SqlQueryCreator_1 = require("../../../generic/SqlQueryCreator");
const roles_1 = require("../../../../objects/Roles/roles");
// Insert a new SuperUserRole
function insertSuperUserRole(connection, body) {
    return __awaiter(this, void 0, void 0, function* () {
        const insertQuery = (0, SqlQueryCreator_1.generateSQLQuery)("INSERT", "SuperUserRoles", body, roles_1.SuperUserRolesTable);
        const { userId, userRoleNameId } = body;
        if (!userId || !userRoleNameId) {
            throw new Error("userId and userRoleNameId are required for inserting a SuperUserRole");
        }
        yield connection.execute(insertQuery, [userId, userRoleNameId]);
    });
}
exports.insertSuperUserRole = insertSuperUserRole;
// Update an existing SuperUserRole
function updateSuperUserRole(connection, body) {
    return __awaiter(this, void 0, void 0, function* () {
        // Dynamically collect values for placeholders
        const values = Object.keys(body)
            .filter((key) => key !== "superUserRoleId" && body[key] !== undefined) // Exclude `superUserRoleId` from SET
            .map((key) => body[key]);
        values.push(body.superUserRoleId);
        if (!body.superUserRoleId) {
            throw new Error("superUserRoleId is required for updating a SuperUserRole");
        }
        const updateQuery = (0, SqlQueryCreator_1.generateSQLQuery)("UPDATE", "SuperUserRoles", body, roles_1.SuperUserRolesTable, `superUserRoleId = ?`, "superUserRoleId");
        yield connection.execute(updateQuery, values);
    });
}
exports.updateSuperUserRole = updateSuperUserRole;
// Delete a SuperUserRole
function deleteSuperUserRole(connection, superUserRoleId) {
    return __awaiter(this, void 0, void 0, function* () {
        const deleteQuery = (0, SqlQueryCreator_1.generateSQLQuery)("DELETE", "SuperUserRoles", {}, {
            superUserRoleId: "number",
        }, `superUserRoleId = ?`);
        if (!superUserRoleId) {
            throw new Error("superUserRoleId is required for deleting a SuperUserRole");
        }
        yield connection.execute(deleteQuery, [superUserRoleId]);
    });
}
exports.deleteSuperUserRole = deleteSuperUserRole;
// Get all SuperUserRoles or by condition
function getSuperUserRoles(connection, condition) {
    return __awaiter(this, void 0, void 0, function* () {
        const selectQuery = (0, SqlQueryCreator_1.generateSQLQuery)("SELECT", "SuperUserRoles", {}, roles_1.SuperUserRolesTable, condition);
        const [rows] = yield connection.execute(selectQuery);
        return rows;
    });
}
exports.getSuperUserRoles = getSuperUserRoles;
function updateMultipleSuperUserRoles(connection, body) {
    return __awaiter(this, void 0, void 0, function* () {
        const updatePromises = body.map((role) => {
            if (!role.superUserRoleId) {
                throw new Error("Each role must have a superUserRoleId for updating");
            }
            const updateQuery = (0, SqlQueryCreator_1.generateSQLQuery)("UPDATE", "SuperUserRoles", role, {
                userId: "number",
                userRoleNameId: "number",
            }, `superUserRoleId = ?`, "superUserRoleId");
            const { userId, userRoleNameId, superUserRoleId } = role;
            return connection.execute(updateQuery, [
                userId,
                userRoleNameId,
                superUserRoleId,
            ]);
        });
        yield Promise.all(updatePromises); // Wait for all update operations to complete
    });
}
exports.updateMultipleSuperUserRoles = updateMultipleSuperUserRoles;
function insertMultipleSuperUserRoles(connection, body) {
    return __awaiter(this, void 0, void 0, function* () {
        const insertQuery = (0, SqlQueryCreator_1.generateSQLQuery)("INSERT", "SuperUserRoles", body[0], // Use the first object to generate the query
        {
            userId: "number",
            userRoleNameId: "number",
        });
        const insertValues = body.map((role) => {
            if (!role.userId || !role.userRoleNameId) {
                throw new Error("Each role must have userId and userRoleNameId for inserting");
            }
            return [role.userId, role.userRoleNameId];
        });
        const insertPromises = insertValues.map((values) => connection.execute(insertQuery, values));
        yield Promise.all(insertPromises); // Wait for all insert operations to complete
    });
}
exports.insertMultipleSuperUserRoles = insertMultipleSuperUserRoles;
function deleteMultipleSuperUserRoles(connection, ids) {
    return __awaiter(this, void 0, void 0, function* () {
        const deleteQuery = (0, SqlQueryCreator_1.generateSQLQuery)("DELETE", "SuperUserRoles", {}, {
            superUserRoleId: "number",
        }, `superUserRoleId = ?`);
        const deletePromises = ids.map((id) => {
            if (!id) {
                throw new Error("Each ID must be valid for deletion");
            }
            return connection.execute(deleteQuery, [id]);
        });
        yield Promise.all(deletePromises); // Wait for all delete operations to complete
    });
}
exports.deleteMultipleSuperUserRoles = deleteMultipleSuperUserRoles;
//# sourceMappingURL=SuperUserRolesHelper.js.map