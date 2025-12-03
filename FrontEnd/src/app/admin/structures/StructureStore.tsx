import { makeAutoObservable, action } from "mobx";

class StructureStore {
  roleData: any[] = [];

  constructor() {
    makeAutoObservable(this, {
      roleData: true,
      setRoleData: action,
    });
  }

  setRoleData(data: any[]) {
    this.roleData = data;
  }

  getRoleData() {
    return this.roleData;
  }
}

const structureStore = new StructureStore();
export default structureStore;
