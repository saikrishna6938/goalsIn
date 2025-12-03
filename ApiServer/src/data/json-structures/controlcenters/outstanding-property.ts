export const outstandingEntityTasks = {
  dashboard_id: 2,
  dashboard_name: "Tasks By Property",
  type: 0,
  rows: [
    {
      row: [
        {
          type: "pie",
          title: "Country",
          number: "one",
          columnHeader: [],
          styles: { width: "30%", height: "100%" },
          filters: ["documentGroupName"],
          filterFields: "documentGroupName",
          data: [],
        },
        {
          type: "bar",
          title: "Application by Intake",
          number: "two",
          styles: { width: "100%", height: "100%" },
          filters: ["status"],
          filterFields: "status",
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
          title: "Status",
          number: "three",
          styles: { width: "65%", height: "100%" },
          filters: [],
          filterFields: "status",
          columnHeader: [
            { id: "status", label: "Status", type: "string" },
            { id: "value", label: "Tasks Count", type: "number" },
          ],
          data: [],
        },
        {
          type: "data-grid",
          title: "Tasks List",
          number: "four",
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
