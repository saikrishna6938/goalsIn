"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outstandingEntityTasks = void 0;
exports.outstandingEntityTasks = {
    dashboard_id: 1,
    dashboard_name: "Applications by Users",
    rows: [
        {
            row: [
                {
                    type: "pie",
                    title: "Progress",
                    columnHeader: [],
                    styles: { width: "30%", height: "100%" },
                    filters: ["status"],
                    filterFields: "status",
                    data: [],
                },
                {
                    type: "bar",
                    title: "Users List",
                    styles: { width: "100%", height: "100%" },
                    filters: ["user_name"],
                    filterFields: "user_name",
                    columnHeader: [],
                    data: [],
                },
            ],
            styles: { height: "30%" },
        },
        {
            row: [
                {
                    type: "data-grid",
                    title: "Users",
                    styles: { width: "65%", height: "100%" },
                    filters: [],
                    filterFields: "user_name",
                    columnHeader: [
                        { id: "id", label: "User ID", type: "number" },
                        { id: "user_name", label: "User Name", type: "string" },
                    ],
                    data: [],
                },
                {
                    type: "data-grid",
                    title: "Tasks List",
                    styles: { width: "100%", height: "100%" },
                    filters: ["user_name", "status"],
                    filterFields: "",
                    columnHeader: [
                        { id: "id", label: "Task Id", type: "number" },
                        { id: "user_name", label: "User Name", type: "string" },
                        { id: "task_name", label: "Task Name", type: "string" },
                        { id: "status", label: "Status", type: "string" },
                    ],
                    data: [],
                },
            ],
            styles: { height: "70%" },
        },
    ],
};
//# sourceMappingURL=outstanding-tasks.js.map