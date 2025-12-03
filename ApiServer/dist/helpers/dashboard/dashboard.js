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
exports.getTaskSummary = exports.getUserIdNameList = exports.getUserTaskCounts = exports.getDocumentTypeNames = exports.getDocumentGroupCounts = exports.getDocumentStateCounts = exports.getTasksByEntity = exports.getTasksByIds = exports.filterTasksByType = exports.getOldestUserTasks = exports.getRecentUserTasks = exports.getUserPendingTasks = exports.getAssisgnedUserTaskCount = exports.getDocumentTypeCountsBySeason = exports.getTotalTasksForDocumentTypes = exports.getTotalTasksForDocumentGroups = exports.getTaskCounts = void 0;
const TaskHelpers_1 = require("../tasks/TaskHelpers");
const SuperDocumentTypeRolesHelper_1 = require("../RolesManager/AdminManager/DocumentRoles/SuperDocumentTypeRolesHelper");
function getTaskCounts(connection, type, entities) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentYear = new Date().getFullYear();
        const currentWeekStart = new Date();
        currentWeekStart.setHours(0, 0, 0, 0);
        currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
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
        }
        else {
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
        const [rows] = yield connection.execute(queryString);
        const onTimeTaskIds = [];
        const criticalTaskIds = [];
        //@ts-ignore
        for (const row of rows) {
            const entityId = yield (0, TaskHelpers_1.taskEntity)(connection, +row.taskId);
            if (entities.split(",").includes(`${entityId}`)) {
                const [result] = yield connection.execute(`SELECT T.*, T.taskId as id, DT.* from Tasks as T LEFT JOIN DocumentType DT ON T.documentTypeId = DT.documentTypeId WHERE T.taskId = ${row.taskId}`, [row.taskId]);
                if (result[0])
                    onTimeTaskIds.push(result[0]);
            }
            else if (entities.split(",").includes(`1`) ||
                entities.split(",").includes("-1")) {
                const [result] = yield connection.execute(`SELECT T.*, T.taskId as id, DT.* from Tasks as T LEFT JOIN DocumentType DT ON T.documentTypeId = DT.documentTypeId WHERE  T.taskId = ${row.taskId}`, [row.taskId]);
                if (result[0])
                    onTimeTaskIds.push(result[0]);
            }
        }
        return onTimeTaskIds;
    });
}
exports.getTaskCounts = getTaskCounts;
function getTotalTasksForDocumentGroups(connection, userId) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const [rows] = yield connection.execute(query, [userId]);
        // Initialize a nested Map structure
        const groupedTasks = new Map();
        //@ts-ignore
        rows.forEach((row) => {
            if (!groupedTasks.has(row.documentGroupName)) {
                groupedTasks.set(row.documentGroupName, new Map());
            }
            const typeMap = groupedTasks.get(row.documentGroupName);
            if (!typeMap.has(row.documentTypeName)) {
                typeMap.set(row.documentTypeName, []);
            }
            typeMap.get(row.documentTypeName).push(row.taskId);
        });
        return groupedTasks;
    });
}
exports.getTotalTasksForDocumentGroups = getTotalTasksForDocumentGroups;
function getTotalTasksForDocumentTypes(connection, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userId) {
            throw new Error("userId is required");
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
        const documentTasksMap = new Map();
        // Execute the query
        const [rows] = yield connection.execute(query, [userId]);
        // Process rows
        yield Promise.all(
        //@ts-ignore
        rows.map((row) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!row.documentStateId)
                return;
            // Fetch task entities
            const entities = yield (0, SuperDocumentTypeRolesHelper_1.getTaskEntityId)(connection, +row.taskId);
            // Default to entityId = 1 if no entities are found
            const entity = entities.length > 0 ? entities[0] : 1;
            // Check for assigned approvers
            const assignedApprovers = yield (0, SuperDocumentTypeRolesHelper_1.getAssignedApprovers)(connection, +row.documentStateId, +entity);
            // Verify if the user is an assigned approver
            if (assignedApprovers.some((approver) => approver.userId === userId)) {
                // Add the taskId to the corresponding documentTypeName in the Map
                if (!documentTasksMap.has(row.documentTypeName)) {
                    documentTasksMap.set(row.documentTypeName, []);
                }
                (_a = documentTasksMap.get(row.documentTypeName)) === null || _a === void 0 ? void 0 : _a.push(row.taskId);
            }
        })));
        return documentTasksMap;
    });
}
exports.getTotalTasksForDocumentTypes = getTotalTasksForDocumentTypes;
function getDocumentTypeCountsBySeason(connection, season) {
    return __awaiter(this, void 0, void 0, function* () {
        const startDate = season === "spring" ? "2024-03-20" : "2024-09-22";
        const endDate = season === "spring" ? "2024-06-20" : "2024-12-21";
        try {
            // First, get all distinct document type names
            const [allDocumentTypes] = yield connection.execute(`SELECT documentTypeName FROM DocumentType`);
            //@ts-ignore
            const counts = Array.from(allDocumentTypes).reduce((acc, { documentTypeName }) => {
                acc[documentTypeName] = 0;
                return acc;
            }, {});
            // Now, query for counts within the specified date range
            const [result] = yield connection.execute(`SELECT dt.documentTypeName, COUNT(*) as count
       FROM DocumentTypeAnswers as da
       JOIN DocumentType as dt ON da.documentTypeId = dt.documentTypeId
       GROUP BY dt.documentTypeName`, [startDate, endDate]);
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
        }
        catch (error) {
            console.error("Error fetching document type counts by season:", error);
            throw error; // Rethrow or handle the error as needed
        }
    });
}
exports.getDocumentTypeCountsBySeason = getDocumentTypeCountsBySeason;
//To get Assigned tasks for the user including Group Name
function getAssisgnedUserTaskCount(connection, userId, groupTypeFilter) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userId) {
            throw new Error("userId is required");
        }
        const filters = ["sur.userId = ?"];
        const params = [userId];
        if (typeof groupTypeFilter === "number") {
            filters.push("dg.groupTypeId = ?");
            params.push(groupTypeFilter);
        }
        else if (Array.isArray(groupTypeFilter) && groupTypeFilter.length > 0) {
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
        const documentTasksMap = new Map();
        // Execute the query
        const [rows] = yield connection.execute(query, params);
        // Process rows
        yield Promise.all(
        //@ts-ignore
        rows.map((row) => __awaiter(this, void 0, void 0, function* () {
            if (!row.documentStateId)
                return;
            // Fetch task entities
            const entities = yield (0, SuperDocumentTypeRolesHelper_1.getTaskEntityId)(connection, +row.taskId);
            // Default to entityId = 1 if no entities are found
            const entity = entities.length > 0 ? entities[0] : 1;
            // Check for assigned approvers
            const assignedApprovers = yield (0, SuperDocumentTypeRolesHelper_1.getAssignedApprovers)(connection, +row.documentStateId, +entity);
            // Verify if the user is an assigned approver
            if (assignedApprovers.some((approver) => approver.userId === userId)) {
                // Add task to the nested map structure
                if (!documentTasksMap.has(row.documentGroupName)) {
                    documentTasksMap.set(row.documentGroupName, new Map());
                }
                const groupMap = documentTasksMap.get(row.documentGroupName);
                if (!groupMap.has(row.documentTypeName)) {
                    groupMap.set(row.documentTypeName, []);
                }
                groupMap.get(row.documentTypeName).push(row.taskId);
            }
        })));
        return documentTasksMap;
    });
}
exports.getAssisgnedUserTaskCount = getAssisgnedUserTaskCount;
//To get Assigned tasks for the user including Group Name
function getUserPendingTasks(connection, userId, entityId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userId) {
            throw new Error("userId is required");
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
        const [rows] = yield connection.execute(query, [userId]);
        // Process rows
        yield Promise.all(
        //@ts-ignore
        rows.map((row) => __awaiter(this, void 0, void 0, function* () {
            if (!row.documentStateId)
                return;
            // Fetch task entities
            const entities = yield (0, SuperDocumentTypeRolesHelper_1.getTaskEntityId)(connection, +row.taskId);
            // Default to entityId = 1 if no entities are found
            const entity = entities.length > 0 ? entities[0] : 1;
            // Check for assigned approvers
            const assignedApprovers = yield (0, SuperDocumentTypeRolesHelper_1.getAssignedApprovers)(connection, +row.documentStateId, +entity);
            // Verify if the user is an assigned approver
            if (assignedApprovers.some((approver) => approver.userId === userId)) {
                tasksIds.push(row.taskId);
            }
        })));
        return tasksIds;
    });
}
exports.getUserPendingTasks = getUserPendingTasks;
function getRecentUserTasks(connection, userId, entityId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userId) {
            throw new Error("userId is required");
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
        const [rows] = yield connection.execute(query, [
            userId,
            entityId,
        ]);
        // Extract taskIds from the result
        return rows.map((row) => row.taskId);
    });
}
exports.getRecentUserTasks = getRecentUserTasks;
function getOldestUserTasks(connection, userId, entityId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userId) {
            throw new Error("userId is required");
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
        const [rows] = yield connection.execute(query, [
            userId,
            entityId,
        ]);
        // Extract taskIds from the result
        return rows.map((row) => row.taskId);
    });
}
exports.getOldestUserTasks = getOldestUserTasks;
function filterTasksByType(connection, taskIds, type) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!taskIds || taskIds.length === 0) {
            return [];
        }
        if (!type || (type !== "OnTime" && type !== "Critical")) {
            throw new Error("Invalid type. Type must be 'OnTime' or 'Critical'");
        }
        const currentWeekStart = new Date();
        currentWeekStart.setHours(0, 0, 0, 0);
        currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
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
        }
        else {
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
        const [rows] = yield connection.execute(queryString, taskIds);
        //@ts-ignore
        return rows.map((row) => row.taskId);
    });
}
exports.filterTasksByType = filterTasksByType;
function getTasksByIds(connection, taskIds) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const [rows] = yield connection.execute(query, taskIds);
        return rows;
    });
}
exports.getTasksByIds = getTasksByIds;
function getTasksByEntity(connection, entityId) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const [rows] = yield connection.execute(query, [entityId]);
        return rows;
    });
}
exports.getTasksByEntity = getTasksByEntity;
function getDocumentStateCounts(tasks) {
    const getRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    const counts = {};
    tasks.forEach((task) => {
        const key = task.documentStateName;
        if (key) {
            if (!counts[key]) {
                counts[key] = {
                    count: 1,
                    typeName: task.documentTypeName || "",
                    groupName: task.documentGroupName || "",
                };
            }
            else {
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
exports.getDocumentStateCounts = getDocumentStateCounts;
function getDocumentGroupCounts(tasks) {
    const getRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    const counts = tasks.reduce((acc, task) => {
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
exports.getDocumentGroupCounts = getDocumentGroupCounts;
function getDocumentTypeNames(tasks) {
    const getRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    const counts = tasks.reduce((acc, task) => {
        if (task.documentTypeName) {
            if (!acc[task.documentTypeName]) {
                acc[task.documentTypeName] = {
                    count: 1,
                    group: task.documentGroupName || "Unknown",
                    status: task.documentStateName || "Unknown",
                };
            }
            else {
                acc[task.documentTypeName].count += 1;
            }
        }
        return acc;
    }, {});
    return Object.keys(counts).map((typeName) => ({
        typeName,
        documentGroupName: counts[typeName].group,
        status: counts[typeName].status,
        value: counts[typeName].count,
        color: getRandomColor(),
        name: typeName,
    }));
}
exports.getDocumentTypeNames = getDocumentTypeNames;
function getUserTaskCounts(tasks) {
    const getRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    const counts = {};
    tasks.forEach((task) => {
        const key = task.userFullName;
        if (key) {
            if (!counts[key]) {
                counts[key] = {
                    count: 1,
                    typeName: task.documentTypeName || "",
                    groupName: task.documentGroupName || "",
                };
            }
            else {
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
exports.getUserTaskCounts = getUserTaskCounts;
function getUserIdNameList(tasks) {
    const userMap = new Map();
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
exports.getUserIdNameList = getUserIdNameList;
function getTaskSummary(tasks) {
    return tasks.map((task) => ({
        id: task.id,
        task_name: task.taskName,
        status: task.documentStateName,
        user_name: task.userFullName,
        typeName: task.documentTypeName,
        documentGroupName: task.documentGroupName,
    }));
}
exports.getTaskSummary = getTaskSummary;
//# sourceMappingURL=dashboard.js.map