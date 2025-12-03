import { Connection } from "mysql2/promise";

export async function getSuperUserRolesByUserId(
  connection: Connection,
  userId: number
): Promise<
  {
    roleName: string;
    roleType: number;
    roleTypeName: string;
    roleNameId: number;
  }[]
> {
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

  const [rows] = await connection.execute(query, [userId]);
  return rows as {
    roleName: string;
    roleType: number;
    roleTypeName: string;
    roleNameId: number;
  }[];
}

export async function getUserEntities(
  connection: Connection,
  userId: number
): Promise<
  {
    entityId: number;
    entityName: string;
    entityLocation: string;
    entityPhone: string;
    entityDescription: string | null;
  }[]
> {
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

  const [rows] = await connection.execute(query, [userId]);
  return rows as {
    entityId: number;
    entityName: string;
    entityLocation: string;
    entityPhone: string;
    entityDescription: string | null;
  }[];
}

export async function getUsersByEntityId(
  connection: Connection,
  entityId: number
): Promise<
  {
    userId: number;
    userName: string;
    userEmail: string;
    userFirstName: string;
    userLastName: string;
    userImage: string | null;
    userAddress: string | null;
    userServerEmail: string | null;
    userPhoneOne: string | null;
    userPhoneTwo: string | null;
    userLastLogin: Date | null;
    userCreated: Date | null;
    userEnabled: boolean;
    userLocked: boolean;
    userType: string;
    lastNotesSeen: Date | null;
  }[]
> {
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

  const queryParams: any[] = [entityId];

  const [rows] = await connection.execute(query, queryParams);
  return rows as {
    userId: number;
    userName: string;
    userEmail: string;
    userFirstName: string;
    userLastName: string;
    userImage: string | null;
    userAddress: string | null;
    userServerEmail: string | null;
    userPhoneOne: string | null;
    userPhoneTwo: string | null;
    userLastLogin: Date | null;
    userCreated: Date | null;
    userEnabled: boolean;
    userLocked: boolean;
    userType: string;
    lastNotesSeen: Date | null;
  }[];
}

export async function getUsersByJob(
  connection: Connection,
  entityId: number,
  userType: number
): Promise<
  {
    userId: number;
    userName: string;
    userEmail: string;
    userFirstName: string;
    userLastName: string;
    userImage: string | null;
    userAddress: string | null;
    userServerEmail: string | null;
    userPhoneOne: string | null;
    userPhoneTwo: string | null;
    userLastLogin: Date | null;
    userCreated: Date | null;
    userEnabled: boolean;
    userLocked: boolean;
    userType: string;
    lastNotesSeen: Date | null;
  }[]
> {
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

  const queryParams: any[] = [];

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
  } else {
    query += ` WHERE u.userType != -1`;
  }

  const [rows] = await connection.execute(query, queryParams);
  return rows as {
    userId: number;
    userName: string;
    userEmail: string;
    userFirstName: string;
    userLastName: string;
    userImage: string | null;
    userAddress: string | null;
    userServerEmail: string | null;
    userPhoneOne: string | null;
    userPhoneTwo: string | null;
    userLastLogin: Date | null;
    userCreated: Date | null;
    userEnabled: boolean;
    userLocked: boolean;
    userType: string;
    lastNotesSeen: Date | null;
  }[];
}

export async function getEntityRoleName(
  connection: Connection,
  entityId: number
): Promise<string | null> {
  if (!entityId) {
    throw new Error("entityId is required");
  }

  const query = `
    SELECT sr.roleNameId
    FROM Structure s
    JOIN SuperRoleNames sr ON s.userRoleNameId = sr.roleNameId
    WHERE s.entityId = ?
  `;

  const [rows] = await connection.execute(query, [entityId]);

  //@ts-ignore
  if (rows.length > 0) {
    return rows[0].roleNameId;
  }

  return null;
}
