import { makeAutoObservable } from "mobx";

class DocumentFormStore {
  appName: string;
  version: string;

  constructor() {
    this.appName = "My Application";
    this.version = "1.0.0";

    makeAutoObservable(this);
  }

  setAppName(name: string) {
    this.appName = name;
  }

  setVersion(version: string) {
    this.version = version;
  }
}

const documentStore = new DocumentFormStore();

export default documentStore;
