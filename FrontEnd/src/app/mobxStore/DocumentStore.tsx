// src/stores/TaskStore.ts
import { makeAutoObservable, action } from "mobx";

interface Action {
  actionId: number;
  actionName: string;
  actionStateId: number;
  options: Option[];
}

interface Option {
  id: number;
  name: string;
  description: string;
}

interface DocumentState {
  documentStateId: number;
  name: string;
}

class DocumentStore {
  actions: Action[] = [];
  documentState: DocumentState | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setActions(actions: Action[]) {
    this.actions = actions;
  }

  setDocumentState(documentState: DocumentState) {
    this.documentState = documentState;
  }
}

const DocStore = new DocumentStore();
export default DocStore;
