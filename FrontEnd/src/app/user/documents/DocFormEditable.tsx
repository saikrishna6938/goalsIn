import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Divider,
} from "@mui/material";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import Loading from "app/components/Loading";
import { Themecolors } from "api/Colors";
import { renderFormFields } from "app/user/FormFields";
import { useLocation } from "react-router-dom";
import appStore from "app/mobxStore/AppStore";
import { v4 as uuidv4 } from "uuid";
import { Delete } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import { api } from "api/API";
import { Condition } from "app/admin/formManagement/userform/FormTriggerType";

interface FormField {
  label: string;
  type: string;
  name: string;
}

interface FormGroup {
  groupName: string;
  repeated: boolean;
  form: FormField[];
}

interface FormManagementFormProps {
  Data: any;
  showCloneButton?: boolean;
  onCloseMainDialog?: () => void;
  documentTypeAnswersId?: Number;
  reload?: Function;
}

const DocFormEditable: React.FC<FormManagementFormProps> = ({
  Data,
  showCloneButton = true,
  onCloseMainDialog,
  documentTypeAnswersId,
  reload,
}) => {
  const FormRef = useRef(null);
  const [formData, setFormData] = useState<any>([]);
  const [step, setStep] = useState(0);
  const [documentType, setDocumentType] = useState(0);
  const location = useLocation();
  const currentPath = location.pathname;
  const params = currentPath.split("/");
  const [selections, setSelections] = useState([]);
  const [msgDialog, setMsgDialog] = useState(false);
  const [documentTagType, setDocumentTagType] = useState("1");
  const [showFormViewer, setShowFormViewer] = useState(false);
  const [formHasErrors, setFormHasErrors] = useState(false);
  useEffect(() => {
    const populateUploadedFiles = async () => {
      if (!Data || !Data.sections) return;

      const updatedSections = [...Data.sections];

      for (let i = 0; i < updatedSections.length; i++) {
        const section = updatedSections[i];
        if (!section.initialValues) continue;

        const keys = Object.keys(section.initialValues);
        for (let j = 0; j < keys.length; j++) {
          const key = keys[j];
          const uploadIds = section.initialValues[key];

          if (Array.isArray(uploadIds) && uploadIds.length > 0) {
            const filesWithData: File[] = [];

            for (let k = 0; k < uploadIds.length; k++) {
              const uploadName = uploadIds[k];
              try {
                const res = await api.post("get/file", {
                  body: { uploadName },
                });
                if (res.status && res.data) {
                  const blob = new Blob([], { type: res.data.fileType });
                  const file = new File([blob], res.data.fileName, {
                    type: res.data.fileType,
                  });

                  (file as any).uploadName = res.data.uploadName;

                  filesWithData.push(file);
                }
              } catch (err) {
                console.error(`Failed to fetch file ${uploadName}:`, err);
              }
            }

            section.initialValues[key] = filesWithData;
          }
        }
      }

      setFormData(updatedSections);
    };

    populateUploadedFiles();
  }, [Data]);

  const validationMap: {
    [key: string]: (
      schema: Yup.StringSchema,
      value: string
    ) => Yup.StringSchema;
  } = {
    req: (schema) => schema.required("Required"),
    min: (schema, value) =>
      schema.min(Number(value), `Minimum  ${value} characters`),
    max: (schema, value) =>
      schema.max(Number(value), `Maximum  ${value} characters`),
    email: (schema, _value) => schema.email("Invalid email"),
    less_than: (schema, value) =>
      schema.test("less_than", `Must be less than ${value}`, (val) => {
        if (val === undefined || val === "") return true;
        return Number(val) < Number(value);
      }),
    greater_than: (schema, value) =>
      schema.test("greater_than", `Must be greater than ${value}`, (val) => {
        if (val === undefined || val === "") return true;
        return Number(val) > Number(value);
      }),
  };

  const applyValidationRules = (
    rules: { type: string; value: string }[]
  ): Yup.StringSchema => {
    let schema = Yup.string();
    for (const rule of rules) {
      const validator = validationMap[rule.type];
      if (validator) {
        schema = validator(schema, rule.value);
      } else {
        console.warn(`Unsupported validation type: ${rule.type}`);
      }
    }
    return schema;
  };

  const generateValidationSchema = (sections) => {
    const schema: { [key: string]: Yup.StringSchema } = {};
    sections.forEach((section) => {
      const validations = section.validationSchema;
      if (!validations) return;
      for (const key in validations) {
        const rules = validations[key];
        if (Array.isArray(rules)) {
          schema[key] = applyValidationRules(rules);
        }
      }
    });
    return Yup.object().shape(schema);
  };

  const validationSchema = generateValidationSchema(formData);
  const getAllInitialValues = () => {
    const allValues = {};
    formData.forEach((section) => {
      if (section.initialValues) {
        Object.assign(allValues, section.initialValues);
      }
    });
    return allValues;
  };

  const initialValues = getAllInitialValues();

  const formDetails: any[] = formData[step]?.formDetails ?? [];

  const sections = formData.length;

  const handleNext = async () => {
    if (FormRef.current) {
      const formik = FormRef.current;

      const errors = await formik.validateForm();
      if (stepHasErrors(errors, step, formData)) {
        setFormHasErrors(true);
      } else {
        setFormHasErrors(false);
      }
    }
    if (step < sections - 1) setStep(step + 1);
  };

  const onBack = () => {
    if (step > 0) setStep(step - 1);
  };
  const hanldeClose = () => {
    // navigate("/dashboard/default");
  };

  const checkIsStructure = (selections, questionIndex) => {
    for (const item of selections) {
      if (item.questions.includes(questionIndex)) {
        for (const option of item.options) {
          if (typeof option === "string" && option.includes("%")) {
            const parts = option.split("%");
            const type = parts[1]?.trim();
            const value = parts[3]?.trim();

            if ((type === "Entity" || type === "Options") && value) {
              return {
                type: type,
                value: value,
              };
            }
          }
        }
      }
    }
    return false;
  };

  const selectionCache = useRef<Record<string, any[]>>({});

  const getSelections = (order: string): any[] => {
    const splitOrder = String(order).split("-");
    if (!selections) return [];

    const questionIndex = +splitOrder[0];
    // 2. Check if we have cached data
    if (selectionCache.current[order]) {
      return selectionCache.current[order];
    }

    const checkIsStructureOption = checkIsStructure(selections, questionIndex);
    // 3. Handle Entity type (original async case)
    if (checkIsStructureOption) {
      switch (checkIsStructureOption.type) {
        case "Entity":
          callEntityApi(checkIsStructureOption.value)
            .then((result) => {
              selectionCache.current = {
                ...selectionCache.current,
                [order]: Array.isArray(result) ? result : [],
              };
              setFormData((prev) => [...prev]);
            })
            .catch((error) => {
              console.error("Entity API Error:", error);
            });
          break;
        case "Options":
          callOptionsApi(checkIsStructureOption.value)
            .then((result) => {
              selectionCache.current = {
                ...selectionCache.current,
                [order]: Array.isArray(result) ? result : [],
              };
              setFormData((prev) => [...prev]);
            })
            .catch((error) => {
              console.error("Options API Error:", error);
            });
          break;
        default:
          break;
      }
      return [];
    }
    // 4. Original synchronous processing
    const result = selections.reduce((acc, curr) => {
      if (curr.questions.includes(questionIndex)) {
        return [...acc, ...curr.options];
      }
      return acc;
    }, []);
    // Cache the synchronous result
    selectionCache.current = { ...selectionCache.current, [order]: result };
    return result;
  };

  const callOptionsApi = async (optionValue) => {
    try {
      const res = await api.get(`administrator/options/${optionValue}`);
      const filteredOptions = res.data.options.map((item) => ({
        id: String(item.id),
        name: item.name,
      }));
      return filteredOptions;
    } catch (error) {
      console.error("Options API Error:", error);
      return [];
    }
  };

  const entityResponseCache: Record<string, any[]> = {};

  const callEntityApi = async (label) => {
    if (entityResponseCache[label]) {
      return entityResponseCache[label];
    }

    let entity = 1;
    try {
      const res = await api.get(`administrator/options/value-labels/${entity}`);
      const data = res.data;
      const matched = data.find((item) => item.valueLabel === label);

      if (matched) {
        const option = await api.get(
          `administrator/options/structure-values/values/${matched.id}`
        );
        const fullOptionsList = option.data?.fullOptionsList;
        const transformedOptions = fullOptionsList.map((item) => ({
          id: String(item.id),
          name: item.name,
        }));

        entityResponseCache[label] = transformedOptions;
        return transformedOptions;
      }

      entityResponseCache[label] = [];
      return [];
    } catch (error) {
      console.error("API Error:", error);
      return [];
    }
  };

  const checkConditionMatched = (
    condition: Condition,
    currentValue: string,
    compareValue: string
  ): boolean => {
    const isNumericCondition =
      condition === Condition.Greater || condition === Condition.Less;
    const a = isNumericCondition ? parseFloat(currentValue) : currentValue;
    const b = isNumericCondition ? parseFloat(compareValue) : compareValue;

    const operators: Record<Condition, (a: any, b: any) => boolean> = {
      [Condition.Equal]: (a, b) => a === b,
      [Condition.Greater]: (a, b) => a > b,
      [Condition.Less]: (a, b) => a < b,
    };

    return operators[condition]?.(a, b) ?? false;
  };

  const updateQuestion = (
    actionType: string,
    target: any,
    value: any,
    matched: boolean
  ) => {
    switch (actionType) {
      case "setValue":
        if (FormRef.current) {
          FormRef.current.setFieldValue(target.order, matched ? value : "");
        }
        break;
      case "show":
        target.visible = matched ? "0" : "1";
        break;
      case "hide":
        target.visible = matched ? "1" : "0";
        break;
      case "clearValue":
        if (FormRef.current) {
          FormRef.current.setFieldValue(target.order, matched ? "" : value);
        }
        break;
      case "enable":
        if (FormRef.current) {
          FormRef.current.setFieldValue(`${target.order}_disabled`, "0");
        }
        break;

      case "disable":
        if (FormRef.current) {
          FormRef.current.setFieldValue(
            `${target.order}_disabled`,
            matched ? true : false
          );
        }
        break;

      default:
        break;
    }
  };

  const onFireTrigger = (args: {
    name: string;
    value: string;
    type: string;
  }) => {
    const allQuestions = formData
      .flatMap((section) => section.formDetails)
      .flatMap((group) => group.form ?? []);

    const changedQuestion = allQuestions.find((q) => q.order === args.name);
    if (!changedQuestion) return;

    const triggers = (changedQuestion.triggers ?? []).filter(
      (t) => t.triggerType === "onChange"
    );

    for (const trigger of triggers) {
      const matched = checkConditionMatched(
        trigger.condition as Condition,
        args.value,
        trigger.compareValue
      );

      for (const action of trigger.actions ?? []) {
        const target = allQuestions.find(
          (q) => q.order === action.targetQuestionId
        );
        if (!target) continue;

        updateQuestion(action.type, target, action.value, matched);
      }
    }
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

  const handleDeleteNewRow = (sectionIndex, groupIndex) => {
    const newSections = [...formData];
    newSections[sectionIndex].formDetails[groupIndex] = { form: [] };

    setFormData(newSections);
  };

  const stepHasErrors = (errors, currentStep, formData) => {
    const currentFormDetails = formData[currentStep]?.formDetails ?? [];
    const hasErrors = currentFormDetails.some((group) =>
      group.form.some((item) => errors[item.order])
    );
    setFormHasErrors(Object.entries(errors).length > 0);

    // if (hasErrors) {
    //   setIsSubmitting(false);
    // }
    return hasErrors;
  };

  const saveAnswer = (answerObject, tasks, files) => {
    api
      .post(`answer/update`, {
        body: {
          ...answerObject,
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
              reload?.();
            };

            reader.readAsDataURL(file.fileData);
          });
        } else {
          appStore.showToast(res.message, "error");
        }
      })
      .catch((error) => {
        console.error("Update error:", error);
      });
    onCloseMainDialog();
  };

  const handleSubmit = () => {
    if (FormRef.current && !formHasErrors) {
      FormRef.current.submitForm();
    } else if (formHasErrors) {
      appStore.showToast("Some fields are required", "warning");
    }
  };

  const showButton = sections === 1 || step === sections - 1;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f4f6f8",
          width: "100%",
          height: "100%",
        }}
      >
        <Card
          sx={{
            width: "100%",
            height: "100%",
            borderRadius: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <Grid
            padding={"7px"}
            justifyContent={"space-between"}
            display={"flex"}
            width={"100%"}
            style={{
              backgroundColor: Themecolors.theme_Main,
              color: Themecolors.F_text1,
              maxHeight: "6vh",
            }}
          >
            {step >= 1 && (
              <Button
                type="button"
                variant="outlined"
                onClick={onBack}
                sx={{
                  borderColor: Themecolors.Button1,
                  backgroundColor: Themecolors.Button1,
                  color: Themecolors.Button2,
                  "&:hover": {
                    backgroundImage: Themecolors.B_hv1,
                    borderColor: Themecolors.Button1,
                  },
                }}
              >
                Back
              </Button>
            )}
            <Typography
              align="left"
              sx={{
                display: "flex",
                justifyContent: "center",
                fontSize: "1.25em",
              }}
            >
              {formData[step]?.sectionName ?? ""}
            </Typography>
            {step < sections - 1 && (
              <Button
                type="button"
                variant="outlined"
                color="primary"
                onClick={handleNext}
                sx={{
                  borderColor: Themecolors.Button1,
                  backgroundColor: Themecolors.Button1,
                  color: Themecolors.Button2,
                  "&:hover": {
                    backgroundImage: Themecolors.B_hv1,
                    borderColor: Themecolors.Button1,
                  },
                }}
              >
                Next
              </Button>
            )}
            {showButton && (
              <Button
                type="submit"
                variant="outlined"
                color="primary"
                onClick={handleSubmit}
                disabled={false}
                sx={{
                  borderColor: Themecolors.Button1,
                  backgroundColor: Themecolors.Button1,
                  color: Themecolors.Button2,
                  "&:hover": {
                    backgroundImage: Themecolors.B_hv1,
                    borderColor: Themecolors.Button1,
                  },
                }}
              >
                Submit
              </Button>
            )}
          </Grid>
          <CardContent
            sx={{
              flexGrow: 1,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <Formik
                innerRef={FormRef}
                initialValues={initialValues}
                validationSchema={validationSchema}
                enableReinitialize={true}
                key={documentType}
                onSubmit={async (values, {}) => {
                  const formValues = { ...values };
                  const files: any[] = [];
                  const tasks: string[] = [];
                  formData.forEach((section) => {
                    section.formDetails.forEach((f) => {
                      f.form.forEach((res) => {
                        if (res.attributeType == "5") {
                          const uploadNames: string[] = [];
                          if (!!formValues[`${res.order}`]) {
                            Array.from(formValues[`${res.order}`]).forEach(
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
                    documentTypeAnswerId: documentTypeAnswersId,
                    documentAnswerObject: JSON.stringify(formValues),
                  };

                  saveAnswer(answerObject, tasks, files);
                }}
              >
                {({
                  errors,
                  submitCount,
                  isSubmitting,
                  values,
                  handleSubmit,
                  handleChange,
                }) => {
                  return (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          flexGrow: 1,
                          overflowY: "auto",
                          overflowX: "hidden",
                          boxSizing: "border-box",
                        }}
                      >
                        <Form
                          style={{
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {formDetails.map((group, index) => {
                            if (group.form.length === 0) {
                              return null;
                            }
                            const visibleQuestions = group.form.filter(
                              (q) => q.visible !== "1"
                            );
                            const sectionColumns =
                              formData[step]?.columns || "1";
                            const isMultiColumn = sectionColumns === "2";
                            let formColumn1: any[] = [];
                            let formColumn2: any[] = [];

                            if (isMultiColumn) {
                              const rows = [];
                              for (
                                let i = 0;
                                i < visibleQuestions.length;
                                i += 2
                              ) {
                                rows.push([
                                  visibleQuestions[i],
                                  visibleQuestions[i + 1],
                                ]);
                              }

                              formColumn1 = rows
                                .map((row) => row[0])
                                .filter(Boolean);
                              formColumn2 = rows
                                .map((row) => row[1])
                                .filter(Boolean);
                            } else {
                              formColumn1 = visibleQuestions;
                            }

                            if (group.display === "horizontal") {
                              return (
                                <Grid
                                  container
                                  spacing={0}
                                  key={index}
                                  sx={{
                                    pt: "8px",
                                    width: "100%",
                                    m: 0,
                                  }}
                                >
                                  <Grid item xs={12}>
                                    <Box
                                      sx={{
                                        backgroundColor: "#f5f5f5",
                                        paddingLeft: 0,
                                      }}
                                    >
                                      <Typography
                                        variant="h6"
                                        sx={{
                                          color: "#333",
                                          p: "5px",
                                        }}
                                      >
                                        {group.groupName}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Grid
                                      container
                                      spacing={1}
                                      sx={{ width: "100%", m: 0, pr: 1 }}
                                    >
                                      {group.form.map((item, i) => (
                                        <Grid
                                          item
                                          xs={12 / group.form.length}
                                          key={item.order || i}
                                          sx={{ width: "100%" }}
                                        >
                                          {renderFormFields(
                                            item,
                                            i,
                                            handleChange,
                                            values,
                                            errors,
                                            getSelections,
                                            documentTagType,
                                            onFireTrigger
                                          )}
                                        </Grid>
                                      ))}
                                    </Grid>
                                  </Grid>
                                </Grid>
                              );
                            }
                            return (
                              <Box
                                key={index}
                                marginTop="10px"
                                borderBottom={1}
                                borderColor="grey.300"
                                sx={{
                                  width: "100%",
                                  boxSizing: "border-box",
                                }}
                              >
                                {group.repeated && index === 0 && (
                                  <>
                                    <Box
                                      display="flex"
                                      justifyContent="flex-end"
                                      alignItems="center"
                                    >
                                      <Button
                                        variant="outlined"
                                        color="primary"
                                        endIcon={<AddIcon />}
                                        onClick={() =>
                                          handleAddNewRow(step, index)
                                        }
                                        style={{
                                          marginRight: "16px",
                                          height: "2.2em",
                                        }}
                                      >
                                        Add New Row
                                      </Button>
                                    </Box>
                                    <Box
                                      sx={{
                                        backgroundColor: "#f5f5f5",
                                        padding: "6px",
                                      }}
                                    >
                                      <Typography
                                        variant="h6"
                                        align="left"
                                        sx={{ color: "#333" }}
                                      >
                                        {group.groupName}
                                      </Typography>
                                    </Box>
                                  </>
                                )}

                                {!group.repeated && (
                                  <Box
                                    sx={{
                                      backgroundColor: "#f5f5f5",
                                      padding: "6px",
                                    }}
                                  >
                                    <Typography
                                      variant="h6"
                                      align="left"
                                      sx={{ color: "#333" }}
                                    >
                                      {group.groupName}
                                    </Typography>
                                  </Box>
                                )}

                                <Grid
                                  container
                                  spacing={1}
                                  sx={{
                                    boxSizing: "border-box",
                                    marginLeft: 0,
                                    width: "100%",
                                    paddingLeft: "5px",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: "100%",
                                      display: "flex",
                                      justifyContent: "flex-end",
                                    }}
                                  >
                                    {group.repeated && index > 0 && (
                                      <Delete
                                        sx={{
                                          alignItems: "end",
                                          mr: isMultiColumn ? "16px" : "0",
                                          cursor: "pointer",
                                        }}
                                        onClick={() =>
                                          handleDeleteNewRow(step, index)
                                        }
                                      />
                                    )}
                                  </Box>

                                  {isMultiColumn ? (
                                    visibleQuestions.map((_, i) => {
                                      if (i % 2 !== 0) return null;
                                      const left = visibleQuestions[i];
                                      const right = visibleQuestions[i + 1];

                                      return (
                                        <Grid
                                          container
                                          spacing={1}
                                          key={`row-${index}-${i}`}
                                          sx={{
                                            width: "100%",
                                            margin: 0,
                                            alignItems: "center",
                                            boxSizing: "border-box",
                                          }}
                                        >
                                          <Grid item xs={6}>
                                            {renderFormFields(
                                              left,
                                              i,
                                              handleChange,
                                              values,
                                              errors,
                                              getSelections,
                                              documentTagType,
                                              onFireTrigger
                                            )}
                                          </Grid>

                                          <Grid
                                            item
                                            xs={0.3}
                                            sx={{
                                              display: "flex",
                                              justifyContent: "center",
                                            }}
                                          >
                                            <Divider
                                              orientation="vertical"
                                              flexItem
                                            />
                                          </Grid>

                                          <Grid item xs={5.5}>
                                            {right &&
                                              renderFormFields(
                                                right,
                                                i + 1,
                                                handleChange,
                                                values,
                                                errors,
                                                getSelections,
                                                documentTagType,
                                                onFireTrigger
                                              )}
                                          </Grid>
                                        </Grid>
                                      );
                                    })
                                  ) : (
                                    <Grid
                                      item
                                      xs={12}
                                      sx={{
                                        paddingRight: "12px",
                                      }}
                                    >
                                      {visibleQuestions.map((item, i) =>
                                        renderFormFields(
                                          item,
                                          i,
                                          handleChange,
                                          values,
                                          errors,
                                          getSelections,
                                          documentTagType,
                                          onFireTrigger
                                        )
                                      )}
                                    </Grid>
                                  )}
                                </Grid>
                              </Box>
                            );
                          })}
                        </Form>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          position: "absolute",
                          left: 0,
                          bottom: 0,
                          width: "100%",
                          backgroundColor: "#FFF",
                          boxSizing: "border-box",
                          overflow: "hidden",
                        }}
                      >
                        {sections > 1 && (
                          <Box
                            sx={{
                              paddingY: "14px",
                              width: "98%",
                              borderTop: "1px solid #ccc",
                            }}
                          >
                            <Stepper
                              activeStep={step}
                              alternativeLabel
                              sx={{
                                backgroundColor: "#FFF",
                                width: "100%",
                                "& .MuiStepIcon-root": {
                                  color: Themecolors.Button_bg2,
                                  "&.Mui-active": {
                                    color: Themecolors.Button_bg1,
                                  },
                                  "&.Mui-completed": {
                                    color: Themecolors.main_bg1,
                                  },
                                  "&.Mui-error": {
                                    color: "#FF3D57",
                                  },
                                },
                                "& .MuiStepLabel-root": {
                                  "&.Mui-error": {
                                    color: Themecolors.Error_Color,
                                  },
                                },
                              }}
                            >
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
                                  >
                                    {/* {`Step  ${i + 1}`} */}
                                  </StepLabel>
                                </Step>
                              ))}
                            </Stepper>{" "}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                }}
              </Formik>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default DocFormEditable;
