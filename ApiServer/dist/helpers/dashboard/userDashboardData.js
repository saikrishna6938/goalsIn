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
exports.buildUserDashboardData = void 0;
const TaskNotes_1 = require("../notes/TaskNotes");
const dashboard_1 = require("./dashboard");
const toPlainObject = (tasksMap) => Object.fromEntries(Array.from(tasksMap.entries()).map(([groupName, typeMap]) => [
    groupName,
    Object.fromEntries(typeMap),
]));
function buildUserDashboardData(connection, userId, entityId) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeEntityId = typeof entityId === "number" ? entityId : undefined;
        const [notes, pendingTaskIds, recentTaskIds, oldestTaskIds, dashboardCounts, pendingApplicationTasksMap, pendingAssignedTasksMap,] = yield Promise.all([
            (0, TaskNotes_1.getUserNotes)(connection, userId),
            (0, dashboard_1.getUserPendingTasks)(connection, userId, safeEntityId !== null && safeEntityId !== void 0 ? safeEntityId : 0),
            safeEntityId ? (0, dashboard_1.getRecentUserTasks)(connection, userId, safeEntityId) : Promise.resolve([]),
            safeEntityId ? (0, dashboard_1.getOldestUserTasks)(connection, userId, safeEntityId) : Promise.resolve([]),
            (0, dashboard_1.getDocumentTypeCountsBySeason)(connection, "spring"),
            (0, dashboard_1.getAssisgnedUserTaskCount)(connection, userId, [2]),
            (0, dashboard_1.getAssisgnedUserTaskCount)(connection, userId, [1, 3]),
        ]);
        const [criticalTaskIds, onTimeTaskIds] = yield Promise.all([
            (0, dashboard_1.filterTasksByType)(connection, pendingTaskIds, "Critical"),
            (0, dashboard_1.filterTasksByType)(connection, pendingTaskIds, "OnTime"),
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
    });
}
exports.buildUserDashboardData = buildUserDashboardData;
//# sourceMappingURL=userDashboardData.js.map