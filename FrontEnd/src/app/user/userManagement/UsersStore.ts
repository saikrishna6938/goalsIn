import { makeAutoObservable } from "mobx";

class UsersStore {
  users: string[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  addUser(user: string) {
    this.users.push(user);
  }
}

export default UsersStore;
