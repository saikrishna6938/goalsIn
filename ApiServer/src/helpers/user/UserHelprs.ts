import * as mysql from "mysql2/promise";
import path from "path";
import keys from "../../keys";
export async function getRoleTypesFromUserRoles(
  connection: mysql.Connection,
  userRoles: string
): Promise<string[]> {
  const roleIds = userRoles.split(",").map((roleId) => parseInt(roleId, 10));

  const placeholders = Array.from({ length: roleIds.length }, () => "?").join(
    ","
  );

  const [rolesResult] = await connection.execute(
    `SELECT GROUP_CONCAT(roles) as rolesString FROM Roles WHERE roleId IN (${placeholders})`,
    roleIds
  );

  const rolesString = rolesResult[0]?.rolesString || "";
  const rolesIds = rolesString.split(",").map((roleId) => parseInt(roleId, 10));
  const roleTypeIds = rolesIds.map((roleTypeId) => parseInt(roleTypeId, 10));
  const roleTypePlaceholders = Array.from(
    { length: roleTypeIds.length },
    () => "?"
  ).join(",");

  const [roleTypes] = await connection.execute(
    `SELECT roleTypeId,roleTypeName FROM RoleTypes WHERE roleTypeId IN (${roleTypePlaceholders})`,
    roleTypeIds
  );

  // Extract the role type names from the result
  //@ts-ignore
  //const roleTypeNames = roleTypes.map((roleType: any) => roleType.roleTypeName);

  return roleTypes as any;
}
const pool = mysql.createPool(keys.database);
interface SettingNameRow extends mysql.RowDataPacket {
  Name: string;
}
export async function getSettingNamesBySubProfileId(
  subProfileId: number,
  db = pool
): Promise<string[]> {
  const sql = `
    SELECT DISTINCT ust.Name
    FROM SubProfileSettings AS sps
    INNER JOIN UserSettingsTypes AS ust ON ust.Id = sps.SettingId
    WHERE sps.subProfileId = ?
    ORDER BY ust.Name ASC
  `;
  const [rows] = await db.query<SettingNameRow[]>(sql, [subProfileId]);
  return rows.map((r) => r.Name);
}

export async function getUsersByUserIds(
  connection: mysql.Connection,
  userIds: number[]
): Promise<any[]> {
  const placeholders = userIds.map(() => "?").join(",");

  const query = `
    SELECT userId, userFirstName, userLastName, userEmail,roles,entities
    FROM Users
    WHERE userId IN (${placeholders})
  `;

  const [result] = await connection.execute(query, userIds);

  return result as any;
}

export const fetchUserSettings = async (
  connection: mysql.Connection,
  userId: number
): Promise<any[]> => {
  try {
    if (isNaN(userId)) {
      throw new Error("Invalid userId");
    }

    const [settings] = await connection.execute(
      `
      SELECT  ust.Id 
      FROM UserSettingsTypes ust
      INNER JOIN SubProfileSettings sps ON ust.Id = sps.SettingId
      INNER JOIN UserSubProfileTypes uspt ON sps.subProfileId = uspt.subProfileId
      WHERE uspt.userId = ?
      `,
      [userId]
    );

    return (settings as any[]).map((s) => s.Id);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch user settings");
  }
};
