import React, { cloneElement, useEffect, useState, useRef } from "react";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Step, Stepper, StepLabel, Grid, Divider } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  Box,
  Typography,
  CardContent,
  Card,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { api } from "api/API";
import { useLocation, useNavigate } from "react-router-dom";
import appStore from "app/mobxStore/AppStore";
import { renderFormFields } from "./FormFields";
import { v4 as uuidv4 } from "uuid";
import SimpleDialog from "app/dialogs/SimpleDialog";
import {
  ArrowBack,
  ArrowForward,
  ContentCopy,
  Delete,
  ForkRight,
  Padding,
  PostAddOutlined,
  Remove,
  Save,
} from "@mui/icons-material";
import Toast from "app/formComponents/Toast";
import { Themecolors } from "api/Colors";
import Loading from "app/components/Loading";
import { User } from "app/types/User";
import { HeaderStyled } from "app/appComponents/HeaderBox";
import { IndexType } from "app/types/User";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";
import { Condition } from "app/admin/formManagement/userform/FormTriggerType";

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
interface DocumentFormProps {
  documentTypeId?: number;
  userObj?: User;
  showFormDoc?: Function;
  onCloseMainDialog?: () => void;
  showCloneButton?: boolean;
  isInitialCheck?: boolean;
  indexType?: number;
  Data?: any;
}

const StyledSection = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[0],
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1),
}));

const GroupHeader = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  padding: theme.spacing(1),
}));

const GroupTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#333",
}));

const FormHeader = styled(HeaderStyled)(({ theme }) => ({
  backgroundColor: Themecolors.F_bg2,
  color: Themecolors.F_text1,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const DocumentForm: React.FC<DocumentFormProps> = ({
  Data,
  documentTypeId,
  userObj,
  showFormDoc,
  onCloseMainDialog,
  showCloneButton = true,
  isInitialCheck = true,
  indexType = IndexType.APPLY,
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
  const user: User = userObj ?? appStore.loginResponse.user[0];
  const [showFormViewer, setShowFormViewer] = useState(false);
  const [formHasErrors, setFormHasErrors] = useState(false);
  const [loading, SetLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (Data && Array.isArray(Data.sections) && Data.sections.length > 0) {
      setFormData(Data.sections);
      setDocumentTagType(Data.documentTagType);
      setSelections(Data.selections || []);
      SetLoading(false);
      return;
    }

    if (isInitialCheck) {
      let canSubmit = false;
      checkUserSubmittedDocument(user.userId, documentTypeId).then((res) => {
        if (res.data > 0) {
          canSubmit = false;
          // if (res.data == 1) {
          //   canSubmit = false;
          // } else {
          //   canSubmit = true;
          // }
        } else {
          canSubmit = true;
        }
        try {
          if (canSubmit) {
            const typeId = documentTypeId ?? params[params.length - 1];
            fetchDocumentTypeData(typeId);
          } else {
            setShowFormViewer(true);
          }
        } catch (error) {
          throw error;
        } finally {
          SetLoading(false);
        }
      });

      return () => {
        setStep(0);
        setFormData([]);
        setShowFormViewer(false);
      };
    } else {
      const typeId = documentTypeId ?? params[params.length - 1];
      fetchDocumentTypeData(typeId);
    }
    //setFormData(data.sections);
  }, [params[params.length - 1]]);

  const fetchDocumentTypeData = async (typeId: any) => {
    try {
      const data = await api.get(`document-type/get-object/${typeId}`);
      if (data.status) {
        setFormData(data.data[0].documentTypeObject.sections);
        setDocumentType(data.data[0].documentTypeId);
        setSelections(data.data[0].documentTypeObject.selections);
        setDocumentTagType(
          data.data[0].documentTypeObject?.documentTagType ?? "1"
        );
      }
    } catch (error) {
      throw error;
    } finally {
      SetLoading(false);
    }
  };

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

  const getValidationFromStr = (str: any) => {
    let validation = Yup.string();
    if (Array.isArray(str)) {
      str.forEach((validator) => {
        if (validator.type === "req") {
          validation = validation.required("Required");
        } else if (validator.type === "email") {
          validation = validation.email("Invalid email address");
        } else if (validator.type === "min") {
          const num = parseInt(validator.value);
          if (!isNaN(num)) {
            validation = validation.min(
              num,
              `Must be at least ${num} characters`
            );
          }
        }
      });
    } else if (typeof str === "string") {
      const validators = str.split(",");
      for (let i = 0; i < validators.length; i++) {
        const v = validators[i].trim();
        if (v === "req") validation = validation.required("Required");
        else if (v === "email")
          validation = validation.email("Invalid email address");
        else if (v === "min") {
          const num = parseInt(validators[i + 1]);
          if (!isNaN(num)) {
            validation = validation.min(
              num,
              `Must be at least ${num} characters`
            );
            i++; // skip next item because it's the number
          }
        }
      }
    }
    return validation;
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
        } else if (typeof rules === "string") {
          schema[key] = getValidationFromStr(rules);
        }
      }
    });

    return Yup.object().shape(schema);
  };

  const validationSchema = generateValidationSchema(formData);
  const initialValues = formData[step]?.initialValues ?? {};
  const formDetails: any[] = formData[step]?.formDetails ?? [];
  const sections = formData.length;

  const handleNext = async () => {
    if (FormRef.current) {
      const formik = FormRef.current;

      const errors = await formik.validateForm();

      const stepFields =
        formData[step]?.formDetails?.flatMap((group) =>
          group.form.map((item) => item.order)
        ) ?? [];

      const touchedObj = stepFields.reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {} as Record<string, boolean>);

      formik.setTouched({ ...formik.touched, ...touchedObj });

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
    navigate("/dashboard/default");
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

    if (hasErrors) {
      setIsSubmitting(false);
    }
    return hasErrors;
  };

  const UserType = appStore.loginResponse.user[0].userType;
  if (showFormViewer) {
    return (
      <>
        {UserType === 2 ? (
          <SimpleDialog
            show={showFormViewer}
            description="You have already submitted the document successfully. For more details, please check at my tasks."
            title="Submitted Successfully"
            buttonText="Close"
            onClose={() => {
              hanldeClose();
            }}
          />
        ) : (
          <SimpleDialog
            show={showFormViewer}
            description="Application has already created for the selected user."
            title="Submitted Successfully"
            buttonText="Close"
            onClose={() => {
              onCloseMainDialog();
            }}
          />
        )}
      </>
    );
  }

  const checkUserSubmittedDocument = async (
    userId: number,
    documentTypeId: number
  ) => {
    try {
      const response = await api.post(`check-user-submitted-document`, {
        body: {
          userId,
          documentTypeId,
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  };
  const saveAnswer = (answerObject, tasks, files) => {
    api
      .post(`answer/save`, {
        body: {
          ...answerObject,
          tasks: tasks,
          entityId: appStore.selectedEntity,
        },
      })
      .then((res) => {
        if (res.status) {
          setMsgDialog(true);

          files.map(async (file) => {
            const reader = new FileReader();

            reader.onloadend = async function () {
              console.log(reader.result);
              const response = await api.post(`upload/file`, {
                body: {
                  ...file,
                  fileData: reader.result,
                },
              });

              if (response.success) {
                // showFormDoc();
              }
            };

            reader.readAsDataURL(file.fileData);
          });

          showFormDoc && showFormDoc();
          onCloseMainDialog();
        } else {
          appStore.showToast(res.message, "error");
          onCloseMainDialog();
        }
      });
  };

  const handleFormSubmit = async () => {
    if (!FormRef.current) return;
    const formik = FormRef.current;
    const validation = await formik.validateForm();

    formik.setTouched(
      Object.keys(validation).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      )
    );

    const hasErrors = Object.keys(validation).length > 0;

    setFormHasErrors(hasErrors);
    if (!hasErrors) {
      FormRef.current.submitForm();
      setIsSubmitting(true);
    } else {
      appStore.showToast("Some fields are required", "warning");
      setIsSubmitting(false);
    }
  };

  const showButton = sections === 1 || step === sections - 1;
  return (
    <>
      {loading ? (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <Loading />
        </Box>
      ) : (
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
            <FormHeader sx={{ padding: "7px" }}>
              <Typography
                align="center"
                sx={{ fontSize: "1.25em", flexGrow: 1 }}
              >
                {formData[step]?.sectionName ?? ""}
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                {showCloneButton && (
                  <PrimaryButton
                    label="Clone Profile"
                    type="button"
                    startIcon={<ContentCopy />}
                    onClick={() => {
                      setIsCloning(true);
                      api.get(`clone-profile/${userObj.userId}`).then((res) => {
                        if (res.status && res.data) {
                          const answerObject = {
                            documentTypeId: documentTypeId,
                            userId:
                              userObj?.userId ??
                              appStore.loginResponse.user[0].userId,
                            documentTypeAnswersObject:
                              res.data.documentTypeAnswersObject,
                          };
                          api
                            .post(`answer/save`, {
                              body: {
                                ...answerObject,
                                tasks: [],
                              },
                            })
                            .then((res) => {
                              setMsgDialog(true);
                            });
                          showFormDoc && showFormDoc();
                          onCloseMainDialog();
                        } else {
                          appStore.showToast(
                            "No data available to clone",
                            "error"
                          );
                          onCloseMainDialog();
                        }
                      });
                    }}
                    height={"1.8rem"}
                  />
                )}
              </Box>
            </FormHeader>

            <CardContent
              sx={{
                flexGrow: 1,
                padding: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              >
                <Formik
                  innerRef={FormRef}
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  key={documentType}
                  onSubmit={async (values, {}) => {
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
                      documentTypeId: documentTypeId,
                      userId:
                        userObj?.userId ??
                        appStore.loginResponse.user[0].userId,
                      documentTypeAnswersObject: JSON.stringify(formValues),
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
                  }) => (
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
                          marginBottom: "20px",
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
                            const isMultiColumn = group.form.length > 5;
                            const splitIndex = Math.ceil(group.form.length / 2);
                            const formColumn1 = isMultiColumn
                              ? group.form.slice(0, splitIndex)
                              : group.form;
                            const formColumn2 = group.form.slice(splitIndex);
                            return (
                              <StyledSection key={index}>
                                {group.repeated && index == 0 && (
                                  <>
                                    <Box
                                      display="flex"
                                      justifyContent="flex-end"
                                      alignItems="center"
                                      mb={"0.3rem"}
                                    >
                                      <PrimaryButton
                                        label="Add New Row"
                                        startIcon={<AddIcon />}
                                        type="button"
                                        onClick={() =>
                                          handleAddNewRow(step, index)
                                        }
                                        iconPosition="end"
                                        height={"1.8rem"}
                                      />
                                    </Box>
                                    <GroupHeader>
                                      <GroupTitle>{group.groupName}</GroupTitle>
                                    </GroupHeader>
                                  </>
                                )}
                                {!group.repeated && (
                                  <GroupHeader>
                                    <GroupTitle>{group.groupName}</GroupTitle>
                                  </GroupHeader>
                                )}

                                <Grid
                                  container
                                  spacing={1}
                                  style={{
                                    boxSizing: "border-box",
                                    marginLeft: 0,
                                    paddingRight: isMultiColumn
                                      ? "0px"
                                      : "16px",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: "100%",
                                      display: "flex",
                                      justifyContent: "end",
                                    }}
                                  >
                                    {group.repeated && index > 0 && (
                                      <Delete
                                        sx={{
                                          alignItems: "end",
                                          mr: isMultiColumn ? "16px" : "0",
                                        }}
                                        onClick={() =>
                                          handleDeleteNewRow(step, index)
                                        }
                                      />
                                    )}
                                  </Box>
                                  <Grid item xs={isMultiColumn ? 5.5 : 12}>
                                    {formColumn1.map((item, i) =>
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
                                  {isMultiColumn && (
                                    <>
                                      <Divider
                                        orientation="vertical"
                                        flexItem
                                        variant="middle"
                                        style={{
                                          paddingLeft: 6,
                                          paddingRight: 3,
                                          color: "red",
                                        }}
                                      />
                                      <Grid
                                        item
                                        xs={6}
                                        style={{
                                          paddingLeft: "10px",
                                        }}
                                      >
                                        {formColumn2.map((item, i) =>
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
                                    </>
                                  )}
                                </Grid>
                              </StyledSection>
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
                        {sections > 1 ? (
                          <Box
                            sx={{
                              paddingY: "14px",
                              width: "98%",
                              borderTop: "1px solid #ccc",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between", // left, middle, right
                                width: "100%",
                                px: 2.3,
                              }}
                            >
                              <Box sx={{ display: "flex", gap: 1 }}>
                                {step >= 1 && (
                                  <PrimaryButton
                                    label="Back"
                                    type="button"
                                    onClick={onBack}
                                    startIcon={<ArrowBack />}
                                    height={"2rem"}
                                  />
                                )}
                              </Box>
                              <Stepper
                                activeStep={step}
                                alternativeLabel
                                sx={{
                                  backgroundColor: "#FFF",
                                  flex: 1,
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
                                    onClick={() => setStep(i)}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <StepLabel
                                      error={stepHasErrors(errors, i, formData)}
                                    >
                                      {/* {`Step  ${i + 1}`} */}
                                    </StepLabel>
                                  </Step>
                                ))}
                              </Stepper>
                              <Box sx={{ display: "flex", gap: 1 }}>
                                {step < sections - 1 && (
                                  <PrimaryButton
                                    label="Next"
                                    type="button"
                                    onClick={handleNext}
                                    startIcon={<ArrowForward />}
                                    height={"2rem"}
                                    iconPosition="end"
                                  />
                                )}
                                <>
                                  {showButton && (
                                    <PrimaryButton
                                      label="submit"
                                      type="submit"
                                      startIcon={<Save />}
                                      onClick={() => handleFormSubmit()}
                                      height={"2rem"}
                                    />
                                  )}
                                </>
                              </Box>
                            </Box>
                          </Box>
                        ) : (
                          <>
                            <Box
                              sx={{
                                paddingY: "14px",
                                width: "98%",
                                borderTop: "1px solid #ccc",
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <PrimaryButton
                                label="submit"
                                type="submit"
                                startIcon={<Save />}
                                onClick={() => handleFormSubmit()}
                                height={"2rem"}
                              />
                            </Box>
                          </>
                        )}
                      </Box>
                    </Box>
                  )}
                </Formik>
              </Box>
            </CardContent>
          </Card>
          {UserType === 2 && (
            <>
              {msgDialog && (
                <SimpleDialog
                  show={msgDialog}
                  description="Thank you for submitting the Application. Our team will contact you very soon."
                  title="Submitted Successfully"
                  buttonText="Close"
                  onClose={hanldeClose}
                />
              )}
            </>
          )}
          {/* {showErrorToast && formHasErrors && (
            <Toast
              open={showErrorToast}
              severity={"error"}
              onClose={() => setShowErrorToast(false)}
              message={"Some fields are required"}
            />
          )} */}
        </Box>
      )}
    </>
  );
};

export default DocumentForm;
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
