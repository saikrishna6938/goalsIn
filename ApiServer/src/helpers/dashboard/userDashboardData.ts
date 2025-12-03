import type { Connection } from "mysql2/promise";
import { getUserNotes } from "../notes/TaskNotes";
import {
  filterTasksByType,
  getAssisgnedUserTaskCount,
  getDocumentTypeCountsBySeason,
  getOldestUserTasks,
  getRecentUserTasks,
  getUserPendingTasks,
} from "./dashboard";

type NestedTaskMap = Record<string, Record<string, number[]>>;

type DashboardTasks = {
  onTime: number[];
  critical: number[];
};

export interface UserDashboardData {
  notes: unknown;
  dashboardCounts: unknown;
  pendingTaskIds: number[];
  recentTaskIds: number[];
  oldestTaskIds: number[];
  pendingApplicationTasks: NestedTaskMap;
  pendingAssignedTasks: NestedTaskMap;
  tasks: DashboardTasks;
}

const toPlainObject = (
  tasksMap: Map<string, Map<string, number[]>>
): NestedTaskMap =>
  Object.fromEntries(
    Array.from(tasksMap.entries()).map(([groupName, typeMap]) => [
      groupName,
      Object.fromEntries(typeMap),
    ])
  );

export async function buildUserDashboardData(
  connection: Connection,
  userId: number,
  entityId?: number | null
): Promise<UserDashboardData> {
  const safeEntityId = typeof entityId === "number" ? entityId : undefined;

  const [
    notes,
    pendingTaskIds,
    recentTaskIds,
    oldestTaskIds,
    dashboardCounts,
    pendingApplicationTasksMap,
    pendingAssignedTasksMap,
  ] = await Promise.all([
    getUserNotes(connection, userId),
    getUserPendingTasks(connection, userId, safeEntityId ?? 0),
    safeEntityId ? getRecentUserTasks(connection, userId, safeEntityId) : Promise.resolve([]),
    safeEntityId ? getOldestUserTasks(connection, userId, safeEntityId) : Promise.resolve([]),
    getDocumentTypeCountsBySeason(connection, "spring"),
    getAssisgnedUserTaskCount(connection, userId, [2]),
    getAssisgnedUserTaskCount(connection, userId, [1, 3]),
  ]);

  const [criticalTaskIds, onTimeTaskIds] = await Promise.all([
    filterTasksByType(connection, pendingTaskIds, "Critical"),
    filterTasksByType(connection, pendingTaskIds, "OnTime"),
  ]);

  return {
    notes,
    dashboardCounts,
    pendingTaskIds,
    recentTaskIds,
    oldestTaskIds,
    pendingApplicationTasks: toPlainObject(pendingApplicationTasksMap),
    pendingAssignedTasks: toPlainObject(pendingAssignedTasksMap),
    tasks: { onTime: onTimeTaskIds, critical: criticalTaskIds },
  };
}
