import { makeAutoObservable, action } from "mobx";
class DashboardStore {
  selectedFilter: Record<string, any> = {};
  entities: any[] = [];
  documentType: any[] = [];
  selectedEntity: string = "";
  selectedPeriod: any[] = [];
  selectedLocation: any = "";
  selectedDocumentObj: any = null;

  constructor() {
    makeAutoObservable(this, {
      setSelectedFilter: action,
      removeFilter: action,
      resetFilters: action,
      setEntities: action,
      setDocumentType: action,
      setSelectedEntity: action,
      setSelectedPeriod: action,
      setSelectedDocumentObject: action,
      setSelectedLocation: action,
      clearAll: action,
    });
  }

  setSelectedLocation(loaction: any) {
    this.selectedLocation = loaction;
  }

  setSelectedDocumentObject(newdoc: any) {
    this.selectedDocumentObj = newdoc;
  }
  setDocumentType(doc: any[]) {
    this.documentType = doc;
  }

  setEntities(newEntities: any[]) {
    this.entities = newEntities;
  }

  setSelectedEntity(entity: string) {
    this.selectedEntity = entity;
  }

  setSelectedPeriod(period: any[]) {
    this.selectedPeriod = period;
  }

  setSelectedFilter(filter: Record<string, any>) {
    this.selectedFilter = { ...this.selectedFilter, ...filter };
  }

  removeFilter(filterKey: string) {
    if (filterKey in this.selectedFilter) {
      delete this.selectedFilter[filterKey];
      this.selectedFilter = { ...this.selectedFilter };
    }
  }

  clearAll() {
    this.selectedPeriod = [];
    this.selectedDocumentObj = "";
    this.selectedLocation = "";
  }

  resetFilters() {
    this.selectedFilter = {};
  }
}

const dashboardStore = new DashboardStore();
export default dashboardStore;
