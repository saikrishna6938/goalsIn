import { Connection } from "mysql2/promise";
import { generateSQLQuery } from "../../../generic/SqlQueryCreator";
import {
  getSuperUserRolesByUserId,
  getUserEntities,
} from "../UserManager/UserRolesManagerHelper";
import { getSuperUserRoles } from "../UserRoles/SuperUserRolesHelper";

export async function getDocumentTypeRoles(
  connection: Connection,
  condition?: string
): Promise<
  {
    documentTypeRoleId: number;
    documentTypeId: number;
    roleNameId: number;
    documentSecurity: string;
  }[]
> {
  const query = generateSQLQuery(
    "SELECT",
    "SuperDocumentTypeRoles",
    {},
    {
      documentTypeRoleId: "number",
      documentTypeId: "number",
      roleNameId: "number",
      documentSecurity: "string",
    },
    condition
  );

  const [rows] = await connection.execute(query);
  return rows as {
    documentTypeRoleId: number;
    documentTypeId: number;
    roleNameId: number;
    documentSecurity: string;
  }[];
}

export async function insertDocumentTypeRole(
  connection: Connection,
  body: { documentTypeId: number; roleNameId: number; documentSecurity: string }
): Promise<void> {
  const insertQuery = generateSQLQuery(
    "INSERT",
    "SuperDocumentTypeRoles",
    body,
    {
      documentTypeId: "number",
      roleNameId: "number",
      documentSecurity: "string",
    }
  );

  const { documentTypeId, roleNameId, documentSecurity } = body;

  if (!documentTypeId || !roleNameId || !documentSecurity) {
    throw new Error(
      "documentTypeId, roleNameId, and documentSecurity are required for inserting a document type role"
    );
  }

  await connection.execute(insertQuery, [
    documentTypeId,
    roleNameId,
    documentSecurity,
  ]);
}

export async function updateDocumentTypeRole(
  connection: Connection,
  body: {
    documentTypeRoleId: number;
    documentTypeId?: number;
    roleNameId?: number;
    documentSecurity?: string;
  }
): Promise<void> {
  const updateQuery = generateSQLQuery(
    "UPDATE",
    "SuperDocumentTypeRoles",
    body,
    {
      documentTypeId: "number",
      roleNameId: "number",
      documentSecurity: "string",
    },
    `documentTypeRoleId = ?`
  );

  const { documentTypeRoleId, documentTypeId, roleNameId, documentSecurity } =
    body;

  if (!documentTypeRoleId) {
    throw new Error(
      "documentTypeRoleId is required for updating a document type role"
    );
  }

  const values = [documentTypeId, roleNameId, documentSecurity].filter(
    (value) => value !== undefined
  );
  values.push(documentTypeRoleId);

  await connection.execute(updateQuery, values);
}

export async function deleteDocumentTypeRole(
  connection: Connection,
  documentTypeRoleId: number
): Promise<void> {
  const deleteQuery = generateSQLQuery(
    "DELETE",
    "SuperDocumentTypeRoles",
    {},
    {
      documentTypeRoleId: "number",
    },
    `documentTypeRoleId = ?`
  );

  if (!documentTypeRoleId) {
    throw new Error(
      "documentTypeRoleId is required for deleting a document type role"
    );
  }

  await connection.execute(deleteQuery, [documentTypeRoleId]);
}

export async function getUserDocumentTypes(
  connection: Connection,
  userId: number,
  typeId = 2
): Promise<
  {
    documentTypeId: number;
    documentTypeName: string;
    documentTypeObjectId: string | null;
    tableName: string | null;
    documentGroupId: number | null;
    documentTypeTableId: number | null;
    documentGroupName: string | null;
    roleTypeId: number;
    roleTypeName: string;
    documentSecurity: string | null;
  }[]
> {
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

  const [rows] = await connection.execute(query, [userId]);
  return rows as {
    documentTypeId: number;
    documentTypeName: string;
    documentTypeObjectId: string | null;
    tableName: string | null;
    documentGroupId: number | null;
    documentTypeTableId: number | null;
    documentGroupName: string | null;
    roleTypeId: number;
    roleTypeName: string;
    documentSecurity: string | null;
  }[];
}

//Filter the user documents using userId and roleTypeId
export async function getFilteredDocumentTypes(
  connection: Connection,
  userId: number,
  roleTypeId: number
): Promise<
  { documentTypeId: number; documentTypeName: string; roleTypeName: string }[]
> {
  if (!userId || !roleTypeId) {
    throw new Error(
      "Both userId and roleTypeId are required to fetch filtered document types"
    );
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

  const [rows] = await connection.execute(query, [userId, roleTypeId]);
  return rows as {
    documentTypeId: number;
    documentTypeName: string;
    roleTypeName: string;
  }[];
}

export async function validateUserAccess(
  connection: Connection,
  taskId: number,
  userId: number,
  entity: number
): Promise<{
  accessGranted: boolean;
  message: string;
  taskUsers?: {
    userId: number;
    userName: string;
    userEmail: string;
    userFirstName: string;
    userLastName: string;
    documentSecurity: string;
  }[];
  taskDetails?: {
    taskId: number;
    taskName: string;
    documentTypeAnswersId: number;
    documentTypeId: number;
  };
  taskApprovers?: {
    userId: number;
    userName: string;
    userEmail: string;
    userFirstName: string;
    userLastName: string;
    userPhoneOne: string | null;
  }[];
}> {
  if (!taskId || !userId) {
    throw new Error("Both taskId and userId are required");
  }

  const entities = await getUserEntities(connection, userId);
  // Step 1: Fetch task details and documentTypeId
  const [taskRows] = await connection.execute(
    `SELECT * FROM Tasks WHERE taskId = ?`,
    [taskId]
  );
  const task = taskRows[0] as {
    taskId: number;
    taskName: string;
    documentTypeAnswersId: number;
    documentTypeId: number;
    documentStateId: number;
    taskTableId: number;
    taskTagId: number;
  };

  if (!task) {
    return { accessGranted: false, message: "Task not found" };
  }
  const approvers = await getAssignedApprovers(
    connection,
    task.documentStateId,
    Number(entity)
  );
  const [taskEntityRows] = await connection.execute(
    `SELECT taskEntityId FROM TaskEntities WHERE taskId = ?`,
    [taskId]
  );
  //@ts-ignore
  const taskEntities = taskEntityRows.map(
    (row: { taskEntityId: number }) => row.taskEntityId
  );

  // Step 2: Check if taskEntityId is included in entities
  const entityIds = entities.map(
    (entity: { entityId: number }) => entity.entityId
  );

  const isTaskEntityIncluded = taskEntities.some((taskEntityId) =>
    entityIds.includes(taskEntityId)
  );

  if (!isTaskEntityIncluded) {
    return { accessGranted: false, message: "Don't have access" };
  }
  // Step 3: Check user access in SuperDocumentTypeRoles
  const [accessRows] = await connection.execute(
    `
      SELECT 
          sdtr.roleNameId, sdtr.documentSecurity
      FROM 
          SuperDocumentTypeRoles sdtr
      WHERE 
          sdtr.documentTypeId = ?
      `,
    [task.documentTypeId]
  );
  const documentAccess = accessRows as {
    roleNameId: number;
    documentSecurity: string;
  }[];

  if (!documentAccess || documentAccess.length === 0) {
    return {
      accessGranted: false,
      message: "No access configuration found for this document type",
    };
  }

  const roleNameIds = documentAccess.map((access) => access.roleNameId);

  // Step 4: Verify if user has any of the required roleNameId
  const [userRoleRows] = await connection.execute(
    `
      SELECT 
          1
      FROM 
          SuperUserRoles sur
      WHERE 
          sur.userId = ? AND sur.userRoleNameId IN (${roleNameIds
            .map(() => "?")
            .join(", ")})
      `,
    [userId, ...roleNameIds]
  );
  //@ts-ignore
  const hasAccess = userRoleRows.length > 0;

  if (!hasAccess) {
    return { accessGranted: false, message: "Access denied" };
  }

  // Step 5: Retrieve all users with the required roleNameIds and their documentSecurity
  const [usersRows] = await connection.execute(
    `
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
      `,
    [...roleNameIds]
  );
  const users = usersRows as {
    userId: number;
    userName: string;
    userEmail: string;
    userFirstName: string;
    userLastName: string;
    documentSecurity: string;
  }[];

  return {
    accessGranted: true,
    message: "Access granted",
    taskUsers: users,
    taskDetails: task,
    taskApprovers: approvers,
  };
}

export async function getAssignedApprovers(
  connection: Connection,
  documentStateId: number,
  entityId: number
): Promise<
  {
    userId: number;
    userName: string;
    userEmail: string;
    userFirstName: string;
    userLastName: string;
    userPhoneOne: string | null;
  }[]
> {
  if (!documentStateId || !entityId) {
    throw new Error("Both documentStateId and entityId are required");
  }

  // Step 1: Fetch roleNameIds for the documentStateId
  const [roleRows] = await connection.execute(
    `
      SELECT 
          dsa.roleNameId
      FROM 
          DocumentStatesApprovers dsa
      WHERE 
          dsa.documentStatesId = ?
      `,
    [documentStateId]
  );
  //@ts-ignore
  const roleNameIds = roleRows.map(
    (row: { roleNameId: number }) => row.roleNameId
  );

  if (roleNameIds.length === 0) {
    return [];
  }

  // Step 2: Fetch users filtered by entityId
  const [entityFilteredUsersRows] = await connection.execute(
    `
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
      `,
    [entityId]
  );

  const entityFilteredUsers = entityFilteredUsersRows as {
    userId: number;
    userName: string;
    userEmail: string;
    userFirstName: string;
    userLastName: string;
    userPhoneOne: string | null;
    userRoleNameId: number;
  }[];

  // Step 3: Filter users by checking their roles
  const assignedApprovers = await Promise.all(
    entityFilteredUsers.map(async (user) => {
      const roles = await getSuperUserRolesByUserId(connection, user.userId);
      if (roles.some((r) => roleNameIds.includes(r.roleNameId))) {
        return user;
      }
      return null;
    })
  );

  // Filter out null values from the assignedApprovers array
  const filteredApprovers = assignedApprovers.filter(
    (approver) => approver !== null
  ) as {
    userId: number;
    userName: string;
    userEmail: string;
    userFirstName: string;
    userLastName: string;
    userPhoneOne: string | null;
  }[];

  return filteredApprovers.map((user) => ({
    userId: user.userId,
    userName: user.userName,
    userEmail: user.userEmail,
    userFirstName: user.userFirstName,
    userLastName: user.userLastName,
    userPhoneOne: user.userPhoneOne,
  }));
}

export async function getTaskEntityId(
  connection: Connection,
  taskId: number
): Promise<number[]> {
  if (!taskId) {
    throw new Error("taskId is required to fetch task entities");
  }

  const query = `
      SELECT taskEntityId 
      FROM TaskEntities 
      WHERE taskId = ?
  `;

  const [rows] = await connection.execute(query, [taskId]);

  //@ts-ignore
  return rows.map((row: { taskEntityId: number }) => row.taskEntityId);
}
