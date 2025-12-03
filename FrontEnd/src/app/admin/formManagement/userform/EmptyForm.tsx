interface DocumentTemplate {
  documentTagType: string;

  selections: Selection[];

  filterOptions: any[];

  sections: Section[];
}

interface Selection {
  questions: number[];

  options: Option[];
}

interface Option {
  id: string;

  name: string;
}

interface Section {
  sectionName: string;

  repeated: boolean;

  validationSchema: Record<string, string>;

  initialValues: Record<string, string>;

  formDetails: FormDetail[];
}

interface FormDetail {
  groupName: string;

  repeated: boolean;

  form: FormField[];
}

interface FormField {
  order: string;

  attributeName: string;

  attributeDescription: string;

  attributeType: string;
}

const createEmptyDocumentTemplate = (): DocumentTemplate => ({
  documentTagType: "",

  selections: [],

  filterOptions: [],

  sections: [],
});

export default createEmptyDocumentTemplate;
