import React, { cloneElement, useEffect, useState, useRef } from "react";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  Step,
  Stepper,
  StepLabel,
  Grid,
  Dialog,
  DialogContent,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Button, Box, Typography, CardContent, Card } from "@mui/material";
import { api } from "api/API";
import { useLocation } from "react-router-dom";
import appStore from "app/mobxStore/AppStore";
import { renderFormFields } from "./FormFields";
import { v4 as uuidv4 } from "uuid";
import SimpleDialog from "app/dialogs/SimpleDialog";
import FormFieldRenderer from "./FormFieldRenderer";
import FilePreviewDialog from "./FilePreview";
interface IAttribute {
  attributeName: string;
  attributeDescription: string;
  attributeType: number;
  order: string;
}
interface IUploadType {
  uploadName: string;
  fileData: any;
  fileName: string;
  fileSize: number;
  type: string;
}
interface FormPreviewProps {
  updateFromAttachments: (files) => void;
  onOpenAttachment: (file: any) => void;
}
const FormPreview: React.FC<FormPreviewProps> = (props) => {
  const formikRef = useRef(null);
  const [formData, setFormData] = useState<any>([]);
  const [step, setStep] = useState(0);
  const [documentType, setDocumentType] = useState(0);
  const location = useLocation();
  const currentPath = location.pathname;
  const params = currentPath.split("/");
  const [selections, setSelections] = useState([]);
  const [msgDialog, setMsgDialog] = useState(false);
  const [documentTagType, setDocumentTagType] = useState("1");
  const [answerObject, setAnswerObject] = useState();

  useEffect(() => {
    api
      .post(`getobject`, {
        body: {
          taskId: `${params[params.length - 1]}`,
        },
      })
      .then((res) => {
        if (res.status) {
          const ansObject = JSON.parse(res.data.documentTypeAnswersObject);
          setAnswerObject(ansObject);
          const documentTypeId = res.data.documentTypeId;
          api.get(`document-type/get-object/${documentTypeId}`).then((data) => {
            if (data.status) {
              const updatedForm = updateInitialValues(
                data.data[0].documentTypeObject.sections,
                ansObject
              );
              const attachments = getAttachments(ansObject);
              props.updateFromAttachments(attachments);
              setFormData(updatedForm);
              setDocumentType(data.data[0].documentTypeId);
              setSelections(data.data[0].documentTypeObject.selections);
              setDocumentTagType(
                data.data[0].documentTypeObject?.documentTagType ?? "1"
              );
            }
          });
        }
      });

    return () => {
      setStep(0);
    };
    //setFormData(data.sections);
  }, [params[params.length - 1]]);

  const getValidationFromStr = (str: any) => {
    let validation = Yup.string();
    const validators = str.split(",");

    for (let i = 0; i < validators.length; i++) {
      if (validators[i] === "req") {
        validation = validation.required("Required");
      } else if (validators[i] === "email") {
        validation = validation.email("Invalid email address");
      } else if (validators[i] === "min") {
        const num = parseInt(validators[i + 1]);
        if (!isNaN(num)) {
          validation = validation.min(
            num,
            `Must be at least ${num} characters`
          );
          i++; // skip the next loop since it's a parameter for 'min'
        }
      }
      // Add other validators as needed...
    }
    return validation;
  };

  const generateValidationSchema = (sections) => {
    const schema = {};

    sections.forEach((section) => {
      const validationSchema = section.validationSchema;
      for (const key in validationSchema) {
        schema[key] = getValidationFromStr(validationSchema[key]);
      }
    });

    return Yup.object(schema);
  };
  const updateInitialValues = (formData, answerObject) => {
    formData.forEach((section) => {
      for (const key in section.initialValues) {
        if (answerObject) {
          if (answerObject.hasOwnProperty(key)) {
            section.initialValues[key] = answerObject[key];
          }
        }
      }
    });
    return formData;
  };

  const getAttachments = (answerObject) => {
    let attachments = [];
    Object.entries(answerObject).map((a) => {
      if (typeof a[1] == "object") {
        //@ts-ignore
        attachments = [...attachments, ...a[1]];
      }
    });
    return attachments;
  };

  const validationSchema = generateValidationSchema(formData);
  const initialValues = formData[step]?.initialValues ?? {};
  const formDetails: any[] = formData[step]?.formDetails ?? [];
  const sections = formData.length;

  const onNext = () => {
    if (step < sections - 1) setStep(step + 1);
  };

  const onBack = () => {
    if (step > 0) setStep(step - 1);
  };
  const getSelections = (order) => {
    const splitOrder = order.split("-");
    if (selections) {
      const questionIndex = +splitOrder[0];
      const res = selections.reduce((acc, curr) => {
        if (curr.questions.includes(questionIndex)) {
          return [...acc, ...curr.options];
        }
        return acc;
      }, []);
      return res;
    } else return [];
  };

  const handleAddNewRow = (sectionIndex, groupIndex) => {
    // Clone the section
    const newSections = [...formData];
    const repeatedForm = newSections[sectionIndex].formDetails[groupIndex].form;
    const currentIndex = newSections[sectionIndex].formDetails.length - 1;
    // Add the repeated form group

    newSections[sectionIndex].formDetails.push({
      groupName: newSections[sectionIndex].formDetails[groupIndex].groupName,
      repeated: true,
      form: repeatedForm.map((item, index) => ({
        ...item,
        order: `${item.order}-${currentIndex}`,
      })),
    });

    setFormData(newSections);
  };

  const stepHasErrors = (errors, currentStep, formData) => {
    const currentFormDetails = formData[currentStep]?.formDetails ?? [];
    return currentFormDetails.some((group) =>
      group.form.some((item) => errors[item.order])
    );
  };
  const handleExternalSubmit = () => {
    if (formikRef.current) {
      formikRef.current.submitForm();
      console.log("External submit button Working");
    }
  };
  return (
    <Box
      sx={{
        display: "flex",
        backgroundColor: "#f4f6f8",
        padding: 1,
        width: "100%",
        height: "83vh",
      }}
    >
      <Card
        sx={{
          width: "100%",
          height: "82.5vh",
          maxWidth: "90vw",
          maxHeight: "90vh",
        }}
      >
        {sections > 1 && (
          <Grid
            padding={"10px"}
            justifyContent={"space-between"}
            display={"flex"}
            width={"100%"}
            style={{ backgroundColor: "#dedede" }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={onBack}
              disabled={step === 0}
            >
              Back
            </Button>
            <Typography variant="h6" align="left" gutterBottom>
              {formData[step]?.sectionName ?? ""}
            </Typography>
            {step < sections - 1 && (
              <Button
                type="button"
                variant="outlined"
                color="primary"
                onClick={onNext}
              >
                Next
              </Button>
            )}
            {sections > 1 && step === sections - 1 && (
              <Button
                type="submit"
                variant="outlined"
                color="info"
                onClick={handleExternalSubmit}
                disabled={true}
              >
                Submit
              </Button>
            )}
          </Grid>
        )}
        <CardContent sx={{ padding: 0 }}>
          <Box sx={{ width: "100%", margin: "auto" }}>
            <Formik
              initialValues={answerObject}
              validationSchema={validationSchema}
              key={`${documentType}`}
              onSubmit={(values, {}) => {
                //@ts-ignore
                const formValues = { ...values };

                const files: IUploadType[] = [];
                const tasks: string[] = [];
                formData.map((section) => {
                  section.formDetails.map((f) => {
                    f.form.map((res) => {
                      if (res.attributeType == "5") {
                        const uploadNames: string[] = [];
                        if (!!formValues[`${res.order}`]) {
                          Array.from(formValues[`${res.order}`]).map(
                            (file: any) => {
                              const inputId = uuidv4();
                              uploadNames.push(inputId);
                              files.push({
                                uploadName: inputId,
                                fileData: file,
                                fileName: file.name,
                                fileSize: file.size,
                                type: file.type,
                              });
                            }
                          );
                          formValues[`${res.order}`] = uploadNames;
                        }
                      } else if (res.attributeType == "10") {
                        tasks.push(formValues[`${res.order}`]);
                      }
                    });
                  });
                });
                const answerObject = {
                  documentTypeId: documentType,
                  userId: appStore.loginResponse.user[0].userId,
                  documentTypeAnswersObject: JSON.stringify(formValues),
                };
                api
                  .post(`answer/save`, {
                    body: {
                      ...answerObject,
                      tasks: tasks,
                    },
                  })
                  .then((res) => {
                    if (res.status) {
                      setMsgDialog(true);
                      files.map(async (file) => {
                        const reader = new FileReader();

                        reader.onloadend = async function () {
                          const response = await api.post(`upload/file`, {
                            body: {
                              ...file,
                              fileData: reader.result,
                            },
                          });
                          if (response.success) {
                          }
                        };

                        reader.readAsDataURL(file.fileData);
                      });
                    }
                  });
                // "values" here is an object representing the form values
              }}
              innerRef={formikRef}
            >
              {({
                errors,
                submitCount,
                setFieldValue,
                isSubmitting,
                values,
                handleSubmit,
                handleChange,
              }) => (
                <Box
                  style={{
                    width: "100%",
                    padding: 1,
                  }}
                >
                  <Form
                    style={{
                      height: "68vh",

                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      overflowX: "hidden",
                      marginBottom: 5,
                    }}
                    onChange={(ev) => {
                      console.log(ev);
                    }}
                    onSubmit={handleSubmit}
                  >
                    {formDetails.map((group, index) => {
                      const isMultiColumn = group.form.length > 5;
                      const splitIndex = Math.ceil(group.form.length / 2);
                      const formColumn1 = isMultiColumn
                        ? group.form.slice(0, splitIndex)
                        : group.form;
                      const formColumn2 = group.form.slice(splitIndex);
                      return (
                        <Box
                          key={index}
                          borderBottom={1}
                          borderColor="grey.200"
                          marginBottom={2}
                        >
                          {group.repeated && index == 0 && (
                            <>
                              <Typography variant="subtitle2" align="center">
                                {group.groupName}
                              </Typography>
                              <Box
                                display="flex"
                                justifyContent="flex-end"
                                alignItems="center"
                              >
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  endIcon={<AddIcon />}
                                  onClick={() => handleAddNewRow(step, index)}
                                  style={{ marginRight: "10px" }} // adjust as needed
                                >
                                  Add New Row
                                </Button>
                              </Box>
                            </>
                          )}

                          <Grid container spacing={2} padding={1}>
                            <Grid item xs={isMultiColumn ? 6 : 12}>
                              {formColumn1.map((item, i) => (
                                <FormFieldRenderer
                                  item={item}
                                  i={i}
                                  handleChange={(ev) => {
                                    console.log(ev);
                                  }}
                                  values={values}
                                  errors={errors}
                                  getSelections={getSelections}
                                  documentTagType={documentTagType}
                                  answerObject={answerObject}
                                  key={`${item.description}-${item.order}`}
                                  handleFileClick={props.onOpenAttachment}
                                />
                              ))}
                            </Grid>
                            {isMultiColumn && (
                              <Grid item xs={6} padding={1}>
                                {formColumn2.map((item, i) => (
                                  <FormFieldRenderer
                                    item={item}
                                    i={i}
                                    handleChange={(ev) => {
                                      console.log(ev);
                                    }}
                                    values={values}
                                    errors={errors}
                                    getSelections={getSelections}
                                    documentTagType={documentTagType}
                                    answerObject={answerObject}
                                    key={`${item.description}-${item.order}`}
                                    handleFileClick={props.onOpenAttachment}
                                  />
                                ))}
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      );
                    })}

                    <Box marginLeft={"89%"}>
                      {sections > 1 && step === sections - 1 && (
                        <Button
                          type="submit"
                          variant="outlined"
                          color="primary"
                          style={{ display: "none" }}
                        >
                          Submit
                        </Button>
                      )}
                    </Box>
                  </Form>

                  {sections > 1 && (
                    <Box
                      style={{
                        position: "relative",
                        padding: "10px",
                        bottom: "30px",
                      }}
                    >
                      <Stepper activeStep={step} alternativeLabel>
                        {Array.from({ length: sections }, (_, i) => (
                          <Step
                            key={i}
                            onClick={() => {
                              setStep(i);
                            }}
                            style={{
                              cursor: "pointer",
                            }}
                          >
                            <StepLabel
                              error={stepHasErrors(errors, i, formData)}
                            >{`Step  ${i + 1}`}</StepLabel>
                          </Step>
                        ))}
                      </Stepper>{" "}
                    </Box>
                  )}
                </Box>
              )}
            </Formik>
          </Box>
        </CardContent>
      </Card>
      {msgDialog && (
        <SimpleDialog
          show={msgDialog}
          description="Thank you for submitting the Application. Our team will contact you very soon."
          title="Submitted Successfully"
          buttonText="Close"
        />
      )}
    </Box>
  );
};

export default FormPreview;
export const globalPath = "http://192.168.1.14/";
export function base64ToBlob(base64, type = "") {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  const blob = new Blob(byteArrays, { type });
  return blob;
}
