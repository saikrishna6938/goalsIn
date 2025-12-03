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
exports.getPermissions = exports.checkPermission = exports.getTaskPermissions = void 0;
const TaskHelpers_1 = require("./TaskHelpers");
const UserHelprs_1 = require("../user/UserHelprs");
function getTaskPermissions(connection, taskId, userRoles) {
    return __awaiter(this, void 0, void 0, function* () {
        const [result] = yield (0, TaskHelpers_1.getTaskDetails)(connection, taskId);
        if (result) {
            const documentRoles = yield (0, TaskHelpers_1.getDocumentTypeRoles)(connection, result.documentTypeId);
            const userRoleTypes = yield (0, UserHelprs_1.getRoleTypesFromUserRoles)(connection, userRoles);
            return [
                {
                    permissions: getPermissions(userRoleTypes, documentRoles),
                    task: result,
                },
            ];
        }
    });
}
exports.getTaskPermissions = getTaskPermissions;
function checkPermission(permissionNumber, permissionsArray) {
    const permissionString = permissionNumber.toString();
    return permissionsArray.includes(permissionString);
}
exports.checkPermission = checkPermission;
function getPermissions(roleTypes, documentTypeRoles) {
    const permissions = [];
    for (const roleType of roleTypes) {
        const matchingRole = documentTypeRoles.find((docRole) => docRole.documentTypeRoleId === roleType.roleTypeId);
        if (matchingRole) {
            permissions.push(matchingRole);
        }
    }
    return getUniquePermissions(permissions);
}
exports.getPermissions = getPermissions;
function getUniquePermissions(dataArray) {
    const allPermissions = [];
    dataArray.forEach((item) => {
        const permissionsArray = item.permissions
            .split(",")
            .map((permission) => permission.trim());
        allPermissions.push(...permissionsArray);
    });
    const uniquePermissionsSet = new Set(allPermissions);
    const uniquePermissionsArray = Array.from(uniquePermissionsSet);
    return uniquePermissionsArray;
}
//# sourceMappingURL=TaskPermissions.js.map