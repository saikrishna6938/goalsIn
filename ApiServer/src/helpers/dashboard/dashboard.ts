import mysql, { Connection } from "mysql2/promise";
import { taskEntity, taskUsers } from "../tasks/TaskHelpers";
import {
  getAssignedApprovers,
  getTaskEntityId,
} from "../RolesManager/AdminManager/DocumentRoles/SuperDocumentTypeRolesHelper";

interface TaskCount {
  onTimeTaskIds: number[];
}

interface Task {
  taskId: number;
}
export async function getTaskCounts(
  connection: mysql.Connection,
  type,
  entities: string
): Promise<any> {
  const currentYear = new Date().getFullYear();
  const currentWeekStart = new Date();
  currentWeekStart.setHours(0, 0, 0, 0);
  currentWeekStart.setDate(
    currentWeekStart.getDate() - currentWeekStart.getDay()
  );

  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekEnd.getDate() + 7);

  const prevYearStart = new Date(currentYear - 1, 0, 1); // Start of previous year
  const prevYearEnd = new Date(currentYear - 1, 11, 31, 23, 59, 59); // End of previous year

  const currentDate = new Date();
  let queryString = "";
  if (type == "OnTime") {
    queryString = `SELECT
    taskId,
    MAX(taskWorkflowDate) AS latestTaskWorkflowDate
  FROM TaskWorkflow 
  WHERE (taskWorkflowDate BETWEEN '${currentWeekStart.toISOString()}' AND '${currentWeekEnd.toISOString()}')
  GROUP BY taskId`;
  } else {
    queryString = `
    SELECT
        taskId,
        MAX(taskWorkflowDate) AS latestTaskWorkflowDate
    FROM
        TaskWorkflow
    WHERE
        taskId NOT IN (
            SELECT DISTINCT taskId
            FROM TaskWorkflow
            WHERE taskWorkflowDate BETWEEN '${currentWeekStart.toISOString()}' AND '${currentWeekEnd.toISOString()}'
        )
    GROUP BY
        taskId
`;
  }

  const [rows] = await connection.execute(queryString);
  const onTimeTaskIds: any[] = [];
  const criticalTaskIds: any[] = [];
  //@ts-ignore
  for (const row of rows) {
    const entityId = await taskEntity(connection, +row.taskId);
    if (entities.split(",").includes(`${entityId}`)) {
      const [result] = await connection.execute(
        `SELECT T.*, T.taskId as id, DT.* from Tasks as T LEFT JOIN DocumentType DT ON T.documentTypeId = DT.documentTypeId WHERE T.taskId = ${row.taskId}`,
        [row.taskId]
      );
      if (result[0]) onTimeTaskIds.push(result[0]);
    } else if (
      entities.split(",").includes(`1`) ||
      entities.split(",").includes("-1")
    ) {
      const [result] = await connection.execute(
        `SELECT T.*, T.taskId as id, DT.* from Tasks as T LEFT JOIN DocumentType DT ON T.documentTypeId = DT.documentTypeId WHERE  T.taskId = ${row.taskId}`,
        [row.taskId]
      );
      if (result[0]) onTimeTaskIds.push(result[0]);
    }
  }

  return onTimeTaskIds;
}
export async function getTotalTasksForDocumentGroups(
  connection: Connection,
  userId: number
): Promise<Map<string, Map<string, number[]>>> {
  if (!userId) {
    throw new Error("userId is required");
  }

  const query = `
      SELECT 
          dg.documentGroupName,
          dt.documentTypeId,
          dt.documentTypeName,
          t.taskId
      FROM 
          Tasks t
      JOIN 
          DocumentType dt ON t.documentTypeId = dt.documentTypeId
      JOIN 
          DocumentGroup dg ON dt.documentGroupId = dg.documentGroupId
      JOIN 
          SuperDocumentTypeRoles sdtr ON t.documentTypeId = sdtr.documentTypeId
      JOIN 
          SuperUserRoles sur ON sdtr.roleNameId = sur.userRoleNameId
      WHERE 
          sur.userId = ?
      ORDER BY 
          dg.documentGroupName, dt.documentTypeName;
  `;

  const [rows] = await connection.execute(query, [userId]);

  // Initialize a nested Map structure
  const groupedTasks = new Map<string, Map<string, number[]>>();
  //@ts-ignore
  rows.forEach(
    (row: {
      documentGroupName: string;
      documentTypeName: string;
      taskId: number;
    }) => {
      if (!groupedTasks.has(row.documentGroupName)) {
        groupedTasks.set(row.documentGroupName, new Map());
      }

      const typeMap = groupedTasks.get(row.documentGroupName)!;

      if (!typeMap.has(row.documentTypeName)) {
        typeMap.set(row.documentTypeName, []);
      }

      typeMap.get(row.documentTypeName)!.push(row.taskId);
    }
  );

  return groupedTasks;
}

export async function getTotalTasksForDocumentTypes(
  connection: Connection,
  userId: number
): Promise<Map<string, number[]>> {
  if (!userId) {
    throw new Error("userId is required");
  }

  interface ReturnObject {
    documentTypeId: number;
    documentTypeName: string;
    totalTasks: number;
    documentStateId: number;
    taskId: number;
  }

  const query = `
      SELECT 
          dt.documentTypeId,
          dt.documentTypeName,
          t.documentStateId,
          t.taskId,
          COUNT(DISTINCT t.taskId) AS totalTasks
      FROM 
          Tasks t
      JOIN 
          DocumentType dt ON t.documentTypeId = dt.documentTypeId
      JOIN 
          SuperDocumentTypeRoles sdtr ON t.documentTypeId = sdtr.documentTypeId
      JOIN 
          SuperUserRoles sur ON sdtr.roleNameId = sur.userRoleNameId
      WHERE 
          sur.userId = ?
      GROUP BY 
          dt.documentTypeId, dt.documentTypeName, t.documentStateId, t.taskId;
  `;

  // Map to store document type and associated task IDs
  const documentTasksMap: Map<string, number[]> = new Map();

  // Execute the query
  const [rows] = await connection.execute(query, [userId]);

  // Process rows
  await Promise.all(
    //@ts-ignore
    rows.map(async (row: ReturnObject) => {
      if (!row.documentStateId) return;

      // Fetch task entities
      const entities = await getTaskEntityId(connection, +row.taskId);

      // Default to entityId = 1 if no entities are found
      const entity = entities.length > 0 ? entities[0] : 1;

      // Check for assigned approvers
      const assignedApprovers = await getAssignedApprovers(
        connection,
        +row.documentStateId,
        +entity
      );

      // Verify if the user is an assigned approver
      if (assignedApprovers.some((approver) => approver.userId === userId)) {
        // Add the taskId to the corresponding documentTypeName in the Map
        if (!documentTasksMap.has(row.documentTypeName)) {
          documentTasksMap.set(row.documentTypeName, []);
        }
        documentTasksMap.get(row.documentTypeName)?.push(row.taskId);
      }
    })
  );
  return documentTasksMap;
}

export async function getDocumentTypeCountsBySeason(
  connection: mysql.Connection,
  season: "spring" | "fall"
) {
  const startDate = season === "spring" ? "2024-03-20" : "2024-09-22";
  const endDate = season === "spring" ? "2024-06-20" : "2024-12-21";

  try {
    // First, get all distinct document type names
    const [allDocumentTypes] = await connection.execute(
      `SELECT documentTypeName FROM DocumentType`
    );

    //@ts-ignore
    const counts = Array.from(allDocumentTypes).reduce(
      (acc: any, { documentTypeName }) => {
        acc[documentTypeName] = 0;
        return acc;
      },
      {}
    );

    // Now, query for counts within the specified date range
    const [result] = await connection.execute(
      `SELECT dt.documentTypeName, COUNT(*) as count
       FROM DocumentTypeAnswers as da
       JOIN DocumentType as dt ON da.documentTypeId = dt.documentTypeId
       GROUP BY dt.documentTypeName`,
      [startDate, endDate]
    );

    //@ts-ignore
    for (const row of result) {
      const { documentTypeName, count } = row;
      counts[documentTypeName] = Number(count);
    }

    // // Calculate the total count
    // counts["Total"] = Object.values(counts).reduce(
    //   (total: number, count: number) => total + count,
    //   0
    // );

    return counts;
  } catch (error) {
    console.error("Error fetching document type counts by season:", error);
    throw error; // Rethrow or handle the error as needed
  }
}

//To get Assigned tasks for the user including Group Name
export async function getAssisgnedUserTaskCount(
  connection: Connection,
  userId: number,
  groupTypeFilter?: number | number[]
): Promise<Map<string, Map<string, number[]>>> {
  if (!userId) {
    throw new Error("userId is required");
  }

  interface ReturnObject {
    documentGroupName: string;
    documentTypeId: number;
    documentTypeName: string;
    documentStateId: number;
    taskId: number;
  }

  const filters = ["sur.userId = ?"];
  const params: (number | string)[] = [userId];

  if (typeof groupTypeFilter === "number") {
    filters.push("dg.groupTypeId = ?");
    params.push(groupTypeFilter);
  } else if (Array.isArray(groupTypeFilter) && groupTypeFilter.length > 0) {
    const placeholders = groupTypeFilter.map(() => "?").join(", ");
    filters.push(`dg.groupTypeId IN (${placeholders})`);
    params.push(...groupTypeFilter);
  }

  const query = `
      SELECT 
          dg.documentGroupName,
          dt.documentTypeId,
          dt.documentTypeName,
          t.documentStateId,
          t.taskId
      FROM 
          Tasks t
      JOIN 
          DocumentType dt ON t.documentTypeId = dt.documentTypeId
      JOIN 
          DocumentGroup dg ON dt.documentGroupId = dg.documentGroupId
      JOIN 
          SuperDocumentTypeRoles sdtr ON t.documentTypeId = sdtr.documentTypeId
      JOIN 
          SuperUserRoles sur ON sdtr.roleNameId = sur.userRoleNameId
      WHERE 
          ${filters.join("\n          AND ")}
      ORDER BY 
          dg.documentGroupName, dt.documentTypeName, t.taskId;
  `;

  // Initialize a nested Map structure
  const documentTasksMap: Map<string, Map<string, number[]>> = new Map();

  // Execute the query
  const [rows] = await connection.execute(query, params);

  // Process rows
  await Promise.all(
    //@ts-ignore
    rows.map(async (row: ReturnObject) => {
      if (!row.documentStateId) return;

      // Fetch task entities
      const entities = await getTaskEntityId(connection, +row.taskId);

      // Default to entityId = 1 if no entities are found
      const entity = entities.length > 0 ? entities[0] : 1;

      // Check for assigned approvers
      const assignedApprovers = await getAssignedApprovers(
        connection,
        +row.documentStateId,
        +entity
      );

      // Verify if the user is an assigned approver
      if (assignedApprovers.some((approver) => approver.userId === userId)) {
        // Add task to the nested map structure
        if (!documentTasksMap.has(row.documentGroupName)) {
          documentTasksMap.set(row.documentGroupName, new Map());
        }

        const groupMap = documentTasksMap.get(row.documentGroupName)!;

        if (!groupMap.has(row.documentTypeName)) {
          groupMap.set(row.documentTypeName, []);
        }

        groupMap.get(row.documentTypeName)!.push(row.taskId);
      }
    })
  );

  return documentTasksMap;
}

//To get Assigned tasks for the user including Group Name
export async function getUserPendingTasks(
  connection: Connection,
  userId: number,
  entityId: number
): Promise<any[]> {
  if (!userId) {
    throw new Error("userId is required");
  }

  interface ReturnObject {
    documentGroupName: string;
    documentTypeId: number;
    documentTypeName: string;
    documentStateId: number;
    taskId: number;
  }

  const query = `
      SELECT 
          dg.documentGroupName,
          dt.documentTypeId,
          dt.documentTypeName,
          t.documentStateId,
          t.taskId
      FROM 
          Tasks t
      JOIN 
          DocumentType dt ON t.documentTypeId = dt.documentTypeId
      JOIN 
          DocumentGroup dg ON dt.documentGroupId = dg.documentGroupId
      JOIN 
          SuperDocumentTypeRoles sdtr ON t.documentTypeId = sdtr.documentTypeId
      JOIN 
          SuperUserRoles sur ON sdtr.roleNameId = sur.userRoleNameId
      WHERE 
          sur.userId = ?
      ORDER BY 
          dg.documentGroupName, dt.documentTypeName, t.taskId;
  `;

  // Initialize a nested Map structure
  const tasksIds = [];

  // Execute the query
  const [rows] = await connection.execute(query, [userId]);

  // Process rows
  await Promise.all(
    //@ts-ignore
    rows.map(async (row: ReturnObject) => {
      if (!row.documentStateId) return;

      // Fetch task entities
      const entities = await getTaskEntityId(connection, +row.taskId);

      // Default to entityId = 1 if no entities are found
      const entity = entities.length > 0 ? entities[0] : 1;

      // Check for assigned approvers
      const assignedApprovers = await getAssignedApprovers(
        connection,
        +row.documentStateId,
        +entity
      );

      // Verify if the user is an assigned approver
      if (assignedApprovers.some((approver) => approver.userId === userId)) {
        tasksIds.push(row.taskId);
      }
    })
  );

  return tasksIds;
}

export async function getRecentUserTasks(
  connection: Connection,
  userId: number,
  entityId: number
): Promise<number[]> {
  if (!userId) {
    throw new Error("userId is required");
  }

  interface TaskWorkflowObject {
    taskId: number;
    taskWorkflowDate: Date;
  }

  const query = `
  SELECT 
    tw.taskId,
    tw.taskWorkflowDate
  FROM 
    TaskWorkflow tw
  JOIN 
    Tasks t ON tw.taskId = t.taskId
  JOIN 
    TaskEntities TE ON TE.taskId = t.taskId
  JOIN 
    SuperDocumentTypeRoles sdtr ON t.documentTypeId = sdtr.documentTypeId
  JOIN 
    SuperUserRoles sur ON sdtr.roleNameId = sur.userRoleNameId
  WHERE 
    sur.userId = ? 
    AND TE.taskEntityId = ?
  ORDER BY 
    tw.taskWorkflowDate DESC
  LIMIT 3;
`;

  //@ts-ignore
  const [rows]: [TaskWorkflowObject[]] = await connection.execute(query, [
    userId,
    entityId,
  ]);

  // Extract taskIds from the result
  return rows.map((row) => row.taskId);
}

export async function getOldestUserTasks(
  connection: Connection,
  userId: number,
  entityId: number
): Promise<number[]> {
  if (!userId) {
    throw new Error("userId is required");
  }

  interface TaskWorkflowObject {
    taskId: number;
    taskWorkflowDate: Date;
  }

  const query = `
  SELECT 
    tw.taskId,
    tw.taskWorkflowDate
  FROM 
    TaskWorkflow tw
  JOIN 
    Tasks t ON tw.taskId = t.taskId
  JOIN 
    TaskEntities TE ON TE.taskId = t.taskId
  JOIN 
    SuperDocumentTypeRoles sdtr ON t.documentTypeId = sdtr.documentTypeId
  JOIN 
    SuperUserRoles sur ON sdtr.roleNameId = sur.userRoleNameId
  WHERE 
    sur.userId = ? 
    AND TE.taskEntityId = ?
  ORDER BY 
    tw.taskWorkflowDate ASC
  LIMIT 3;
`;

  //@ts-ignore
  const [rows]: [TaskWorkflowObject[]] = await connection.execute(query, [
    userId,
    entityId,
  ]);

  // Extract taskIds from the result
  return rows.map((row) => row.taskId);
}

export async function filterTasksByType(
  connection: Connection,
  taskIds: number[],
  type: string
): Promise<number[]> {
  if (!taskIds || taskIds.length === 0) {
    return [];
  }

  if (!type || (type !== "OnTime" && type !== "Critical")) {
    throw new Error("Invalid type. Type must be 'OnTime' or 'Critical'");
  }

  const currentWeekStart = new Date();
  currentWeekStart.setHours(0, 0, 0, 0);
  currentWeekStart.setDate(
    currentWeekStart.getDate() - currentWeekStart.getDay()
  );

  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekEnd.getDate() + 7);

  let queryString = "";

  // Build the query based on the type
  if (type === "OnTime") {
    queryString = `
      SELECT
          taskId,
          MAX(taskWorkflowDate) AS latestTaskWorkflowDate
      FROM 
          TaskWorkflow
      WHERE 
          taskId IN (${taskIds.map(() => "?").join(", ")})
          AND taskWorkflowDate BETWEEN '${currentWeekStart.toISOString()}' AND '${currentWeekEnd.toISOString()}'
      GROUP BY taskId
    `;
  } else {
    queryString = `
      SELECT
          taskId,
          MAX(taskWorkflowDate) AS latestTaskWorkflowDate
      FROM 
          TaskWorkflow
      WHERE 
          taskId IN (${taskIds.map(() => "?").join(", ")})
          AND taskId NOT IN (
              SELECT DISTINCT taskId
              FROM TaskWorkflow
              WHERE taskWorkflowDate BETWEEN '${currentWeekStart.toISOString()}' AND '${currentWeekEnd.toISOString()}'
          )
      GROUP BY taskId
    `;
  }

  const [rows] = await connection.execute(queryString, taskIds);

  //@ts-ignore
  return rows.map((row: { taskId: number }) => row.taskId);
}

export async function getTasksByIds(
  connection: Connection,
  taskIds: number[]
): Promise<any[]> {
  if (!taskIds || taskIds.length === 0) {
    return [];
  }

  const query = `
    SELECT 
        t.taskId AS id,
        t.taskName,
        t.documentTypeId,
        dt.documentTypeName,
        t.createdDate,
        t.updatedDate,
        us.userName,
        CONCAT(us.userFirstName, ' ', us.userLastName) AS userFullName,
        ds.documentStateName,
        t.taskTableId,
        t.taskTagId,
        t.taskUsers
    FROM 
        Tasks t
    JOIN 
        DocumentType dt ON t.documentTypeId = dt.documentTypeId
    JOIN
        Users us ON us.userId = t.userId
        JOIN
        DocumentStates ds ON ds.documentStateId = t.documentStateId
    WHERE 
        t.taskId IN (${taskIds.map(() => "?").join(", ")})
  `;

  const [rows] = await connection.execute(query, taskIds);

  return rows as any[];
}

export async function getTasksByEntity(
  connection: Connection,
  entityId: number
): Promise<any[]> {
  if (!entityId) {
    return [];
  }

  const query = `
    SELECT 
        t.taskId AS id,
        t.taskName,
        t.documentTypeId,
        dt.documentTypeName,
        dg.documentGroupName,
        dg.groupTypeId,
        t.createdDate,
        t.updatedDate,
        us.userName,
        us.userId,
        CONCAT(us.userFirstName, ' ', us.userLastName) AS userFullName,
        ds.documentStateName,
        t.taskTableId,
        t.taskTagId,
        t.taskUsers
    FROM 
        Tasks t
    JOIN 
        DocumentType dt ON t.documentTypeId = dt.documentTypeId
    JOIN 
        DocumentGroup dg ON dt.documentGroupId = dg.documentGroupId
    JOIN 
        Users us ON us.userId = t.userId
    JOIN 
        DocumentStates ds ON ds.documentStateId = t.documentStateId
    JOIN 
        TaskEntities te ON te.taskId = t.taskId
    WHERE 
        te.taskEntityId = ?
  `;

  const [rows] = await connection.execute(query, [entityId]);

  return rows as any[];
}
export function getDocumentStateCounts(tasks: any[]): any[] {
  const getRandomColor = () =>
    `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  const counts: Record<
    string,
    { count: number; typeName?: string; groupName?: string }
  > = {};

  tasks.forEach((task) => {
    const key = task.documentStateName;
    if (key) {
      if (!counts[key]) {
        counts[key] = {
          count: 1,
          typeName: task.documentTypeName || "",
          groupName: task.documentGroupName || "",
        };
      } else {
        counts[key].count += 1;
      }
    }
  });

  return Object.entries(counts).map(([status, data], index) => ({
    id: index + 1,
    status,
    name: status,
    value: data.count,
    documentTypeName: data.typeName,
    documentGroupName: data.groupName,
    color: getRandomColor(),
  }));
}

export function getDocumentGroupCounts(tasks: any[]): any[] {
  const getRandomColor = () =>
    `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  const counts = tasks.reduce((acc: Record<string, number>, task) => {
    if (task.documentGroupName) {
      acc[task.documentGroupName] = (acc[task.documentGroupName] || 0) + 1;
    }
    return acc;
  }, {});

  return Object.keys(counts).map((group) => ({
    documentGroupName: group,
    value: counts[group] || 0,
    color: getRandomColor(),
    status: group,
  }));
}

export function getDocumentTypeNames(tasks: any[]): any[] {
  const getRandomColor = () =>
    `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  const counts = tasks.reduce(
    (
      acc: Record<string, { count: number; group: string; status: string }>,
      task
    ) => {
      if (task.documentTypeName) {
        if (!acc[task.documentTypeName]) {
          acc[task.documentTypeName] = {
            count: 1,
            group: task.documentGroupName || "Unknown",
            status: task.documentStateName || "Unknown",
          };
        } else {
          acc[task.documentTypeName].count += 1;
        }
      }
      return acc;
    },
    {}
  );

  return Object.keys(counts).map((typeName) => ({
    typeName,
    documentGroupName: counts[typeName].group,
    status: counts[typeName].status,
    value: counts[typeName].count,
    color: getRandomColor(),
    name: typeName,
  }));
}

export function getUserTaskCounts(tasks: any[]): any[] {
  const getRandomColor = () =>
    `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  const counts: Record<
    string,
    { count: number; typeName?: string; groupName?: string }
  > = {};

  tasks.forEach((task) => {
    const key = task.userFullName;
    if (key) {
      if (!counts[key]) {
        counts[key] = {
          count: 1,
          typeName: task.documentTypeName || "",
          groupName: task.documentGroupName || "",
        };
      } else {
        counts[key].count += 1;
      }
    }
  });

  return Object.entries(counts).map(([user_name, data]) => ({
    user_name,
    value: data.count,
    color: getRandomColor(),
    documentTypeName: data.typeName,
    documentGroupName: data.groupName,
  }));
}

export function getUserIdNameList(tasks: any[]): any[] {
  const userMap = new Map<
    number,
    { user_name: string; documentTypeName?: string; documentGroupName?: string }
  >();

  tasks.forEach((task) => {
    if (task.userId && task.userFullName) {
      if (!userMap.has(task.userId)) {
        userMap.set(task.userId, {
          user_name: task.userFullName,
          documentTypeName: task.documentTypeName || "",
          documentGroupName: task.documentGroupName || "",
        });
      }
    }
  });

  return Array.from(userMap.entries()).map(([id, user]) => ({
    id,
    user_name: user.user_name,
    documentTypeName: user.documentTypeName,
    documentGroupName: user.documentGroupName,
  }));
}

export function getTaskSummary(tasks: any[]): any[] {
  return tasks.map((task) => ({
    id: task.id,
    task_name: task.taskName,
    status: task.documentStateName,
    user_name: task.userFullName,
    typeName: task.documentTypeName,
    documentGroupName: task.documentGroupName,
  }));
}
