import { makeAutoObservable } from "mobx";
import UsersStore from "./UsersStore";

export interface User {
  userId: number;
  userName: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  [key: string]: any;
}

class UserStore {
  users: User[] = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  setUsers(users: User[]) {
    this.users = users;
  }

  getUsers(): User[] {
    return this.users;
  }

  clearUsers() {
    this.users = [];
  }
}

const userStore = new UserStore();

export default userStore;
