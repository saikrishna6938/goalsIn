import { makeAutoObservable } from "mobx";

class FormEditStore {
  formData: any = null;

  constructor() {
    makeAutoObservable(this);
  }

  setFormData(data: any) {
    this.formData = data;
  }

  getFormData() {
    return this.formData;
  }

  clearFormData() {
    this.formData = null;
  }
}

const formEditStore = new FormEditStore();
export default formEditStore;
