import { User } from "@auth0/auth0-spa-js";

interface DocumentType {
  documentTypeId: number;
  documentName: string; // I'm assuming there's a name or title for each DocumentType
  // ... any other fields related to DocumentType
}

interface DocumentState {
  documentStateId: number;
  documentTypeId: number;
  documentStateName: string;
  documentStateDescription: string;
  documentStateCreatedDate: Date;
  documentStateUpdatedDate: Date;
}

interface Action {
  actionId: number;
  documentStateId: number;
  actionName: string;
  actionDescription: string;
  actionCreatedDate: Date;
  actionUpdatedDate: Date;
}

export interface Task {
  taskId: number;
  taskName: string;
  documentTypeAnswersId: number;
  documentTypeId: number;
  userId: number;
  createdDate: Date;
  updatedDate: Date;
  attachments: string;
  documentStateId: number;
  taskUsers: string;
  taskTagId: number;
  taskTableId: number;
  taskApprovers: User[];
  taskEntity: number;
}

// Combined Workflow Interface
interface Workflow {
  documentType: DocumentType;
  tasks: Task[];
  states: DocumentState[];
  actions: Action[];
}
