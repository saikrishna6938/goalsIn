interface FormDetail {
  order: number;
  attributeName: string;
  attributeDescription: string;
  attributeType: number;
}

interface Section {
  sectionTitle: string;
  sectionDescription: string;
  initialValues: {
    FirstName: string;
    LastName: string;
    DateOfBirth: string;
    Email: string;  
    ContactNumber: string;
    CurrentCountry: string;
    USACitizen: string;
    PreviousEducation: string;
    UploadDocuments: null;
  };
  formDetails: FormDetail[];
}

interface FormData {
  sections: Section[];
}
