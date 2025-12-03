interface FormDetails {
  order: number;
  attributeName: string;
  attributeDescription: string;
  attributeType: string;
}

interface GroupDetails {
  groupName: string;
  form: FormDetails[];
}

interface Section {
  sectionName: string;
  repeated: boolean;
  initialValues?: { [key: string]: string };
  formDetails: GroupDetails[];
}

interface RootObject {
  sections: Section[];
}

export interface UserDocument {
  id: number;
  userName: string;
  Name: string;
  userEnabled: number;
  userEmail: string;
  userImage: string;
  userLocked: number;
  documentTypeAnswersId: number;
  documentTypeId: number;
  userId: number;
  taskId?: number;
  documentTypeAnswersObject: {
    [key: string]: string | number | string[];
  };
  createdDate: string;
  updatedDate: string;
  documentTypeName: string;
  documentTypeDescription: string;
  documentTypeObjectId: number;
  tableName: string;
  documentTypeRoles: string;
  documentGroupId: number;
  documentTypeObject: any;
  documentTypeTableId: number;
  openFile?: Function;
  documentGroupName?: string;
}
