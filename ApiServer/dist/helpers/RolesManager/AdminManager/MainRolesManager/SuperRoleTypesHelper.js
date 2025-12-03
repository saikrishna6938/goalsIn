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
exports.insertRoleType = exports.deleteRoleType = exports.updateRoleType = exports.getRoleTypes = void 0;
// Function to get all role types
function getRoleTypes(connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = `SELECT * FROM SuperRoleTypes`;
        const [rows] = yield connection.execute(query);
        return rows;
    });
}
exports.getRoleTypes = getRoleTypes;
// Function to update a role type
function updateRoleType(connection, roleType) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!roleType.roleTypeId) {
            throw new Error("roleTypeId is required for updating a role type");
        }
        const query = `
        UPDATE SuperRoleTypes
        SET roleTypeName = ?, roleTypeDescription = ?, updatedDate = NOW()
        WHERE roleTypeId = ?
    `;
        const { roleTypeName, roleTypeDescription, roleTypeId } = roleType;
        yield connection.execute(query, [
            roleTypeName,
            roleTypeDescription,
            roleTypeId,
        ]);
    });
}
exports.updateRoleType = updateRoleType;
// Function to delete a role type
function deleteRoleType(connection, roleTypeId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = `DELETE FROM SuperRoleTypes WHERE roleTypeId = ?`;
        yield connection.execute(query, [roleTypeId]);
    });
}
exports.deleteRoleType = deleteRoleType;
// Function to insert a new role type
function insertRoleType(connection, roleType) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = `
        INSERT INTO SuperRoleTypes (roleTypeName, roleTypeDescription, updatedDate)
        VALUES (?, ?, NOW())
    `;
        const { roleTypeName, roleTypeDescription } = roleType;
        yield connection.execute(query, [roleTypeName, roleTypeDescription]);
    });
}
exports.insertRoleType = insertRoleType;
//# sourceMappingURL=SuperRoleTypesHelper.js.map