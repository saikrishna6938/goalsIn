import * as mysql from "mysql2/promise";
import { getDocumentTypeRoles, getTaskDetails } from "./TaskHelpers";
import { getRoleTypesFromUserRoles } from "../user/UserHelprs";
export async function getTaskPermissions(
  connection: mysql.Connection,
  taskId: number,
  userRoles: string
) {
  const [result] = await getTaskDetails(connection, taskId);
  if (result) {
    const documentRoles = await getDocumentTypeRoles(
      connection,
      result.documentTypeId
    );
    const userRoleTypes = await getRoleTypesFromUserRoles(
      connection,
      userRoles
    );
    return [
      {
        permissions: getPermissions(userRoleTypes, documentRoles),
        task: result,
      },
    ];
  }
}

export function checkPermission(
  permissionNumber: number,
  permissionsArray: string[]
): boolean {
  const permissionString = permissionNumber.toString();
  return permissionsArray.includes(permissionString);
}

export function getPermissions(roleTypes, documentTypeRoles): any {
  const permissions = [];
  for (const roleType of roleTypes) {
    const matchingRole = documentTypeRoles.find(
      (docRole) => docRole.documentTypeRoleId === roleType.roleTypeId
    );

    if (matchingRole) {
      permissions.push(matchingRole);
    }
  }
  return getUniquePermissions(permissions) as any;
}

function getUniquePermissions(dataArray: any[]): string[] {
  const allPermissions: string[] = [];
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
