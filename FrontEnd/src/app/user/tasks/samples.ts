export const sampleTasks = [
  {
    id: 1,
    taskName: "Sample Task 1",
    createdDate: "2023-08-01",
    assignedTo: "John",
    status: "Completed",
  },
  {
    id: 2,
    taskName: "Sample Task 2",
    createdDate: "2023-08-02",
    assignedTo: "Jane",
    status: "InProgress",
  },
  {
    id: 3,
    taskName: "Sample Task 2",
    createdDate: "2023-08-02",
    assignedTo: "Jane",
    status: "InProgress",
  },
  {
    id: 4,
    taskName: "Sample Task 4",
    createdDate: "2023-08-02",
    assignedTo: "Jane",
    status: "InProgress",
  },
  {
    id: 5,
    taskName: "Sample Task 5",
    createdDate: "2023-08-02",
    assignedTo: "Jane",
    status: "InProgress",
  },
  {
    id: 6,
    taskName: "Sample Task 6",
    createdDate: "2023-08-02",
    assignedTo: "Jane",
    status: "InProgress",
  },
  {
    id: 7,
    taskName: "Sample Task 7",
    createdDate: "2023-08-02",
    assignedTo: "Jane",
    status: "InProgress",
  },
  {
    id: 8,
    taskName: "Sample Task 8",
    createdDate: "2023-08-02",
    assignedTo: "Jane",
    status: "InProgress",
  },
  {
    id: 9,
    taskName: "Sample Task 9",
    createdDate: "2023-08-02",
    assignedTo: "Jane",
    status: "InProgress",
  },
  {
    id: 11,
    taskName: "Sample Task 11",
    createdDate: "2023-08-02",
    assignedTo: "Jane",
    status: "InProgress",
  },
  {
    id: 12,
    taskName: "Sample Task 12",
    createdDate: "2023-08-02",
    assignedTo: "Jane",
    status: "InProgress",
  },
  {
    id: 20,
    taskName: "Sample Task 20",
    createdDate: "2023-08-20",
    assignedTo: "Alice",
    status: "NotStarted",
  },
];

export const sampleColumns: any[] = [
  { id: "id", label: "Task Id", type: "number" },
  { id: "taskName", label: "Task Name", type: "string" },
  { id: "createdDate", label: "Created Date", type: "date" },
  { id: "assignedTo", label: "Assigned To", type: "string" },
  { id: "status", label: "Status", type: "string" },
];

export const userColumns: any[] = [
  { id: "id", label: "User Id", type: "number" },
  { id: "userFullName", label: "Name", type: "string" },
  { id: "userEmail", label: "Email", type: "string" },
  { id: "createdDate", label: "Created", type: "date" },
  { id: "enabled", label: "Enabled", type: "string" },
];

export const applicationsColumns: any[] = [
  { id: "id", label: "User Id", type: "number" },
  { id: "Name", label: "Name", type: "string" },
  { id: "documentGroupName", label: "Country", type: "string" },
  { id: "documentTypeName", label: "Intake", type: "string" },
  { id: "createdDate", label: "Created", type: "date" },
  { id: "updatedDate", label: "Updated", type: "date" },
];
export const taskDetailsColumns: any[] = [
  { id: "id", label: "Application Id", type: "number" },
  { id: "taskName", label: "University Name", type: "string" },
  { id: "updatedDate", label: "Updated", type: "date" },
  { id: "createdDate", label: "Created Date", type: "date" },
];
export const applicationColumns: any[] = [
  { id: "id", label: "Application Id", type: "number" },
  { id: "taskName", label: "University Name", type: "string" },
  { id: "userFullName", label: "User Name", type: "string" },
  { id: "documentTypeName", label: "Intake", type: "string" },
  { id: "documentStateName", label: "Status", type: "string" },
  { id: "updatedDate", label: "Updated", type: "date" },
  { id: "createdDate", label: "Created Date", type: "date" },
];

export const searchColumns: any[] = [
  { id: "id", label: "Id", type: "number" },
  { id: "Name", label: "Name", type: "string" },
  { id: "Concentration", label: "Concentration", type: "string" },
  { id: "TuitionFee", label: "TutionFee", type: "string" },
];

export function convertIdToLowerCase(objects: any[]): any[] {
  return objects.map((obj) => {
    const newObj = { ...obj };
    if (newObj.hasOwnProperty("Id")) {
      newObj["id"] = newObj["Id"];
      delete newObj["Id"];
    }
    return newObj;
  });
}
