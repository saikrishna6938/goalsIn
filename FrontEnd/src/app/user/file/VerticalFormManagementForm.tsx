import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Delete } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import { Condition } from "app/admin/formManagement/userform/FormTriggerType";
import { VerticleFormFields } from "./VerticleFormFields";

interface FormManagementFormProps {
  Data: any;
  onSubmit: (values: any) => void;
  onFieldError?: (fieldName: string, hasError: boolean) => void;
  onFormRef?: Function;
}

const VerticalFormManagementForm: React.FC<FormManagementFormProps> = ({
  Data,
  onSubmit,
  onFieldError,
  onFormRef,
}) => {
  const FormRef = useRef<any>(null);
  const [formData, setFormData] = useState<any[]>([]);
  const [step, setStep] = useState(0);
  const [documentTagType, setDocumentTagType] = useState("1");
  const [selections, setSelections] = useState<any[]>([]);
  const [formHasErrors, setFormHasErrors] = useState(false);

  useEffect(() => {
    onFormRef(FormRef?.current?.values);
  }, [FormRef?.current?.values]);
  useEffect(() => {
    if (Data && Data.sections) {
      setFormData(Data.sections);
      setDocumentTagType(Data.documentTagType);
      setSelections(Data.selections || []);
    }
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
      }
    }
    return schema;
  };

  const generateValidationSchema = (sections: any[]) => {
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
  const initialValues = formData[step]?.initialValues ?? {};
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

  const getSelections = (order: string) => {
    const splitOrder = String(order).split("-");
    if (selections) {
      const questionIndex = +splitOrder[0];
      const res = selections.reduce((acc: any[], curr: any) => {
        if (curr.questions.includes(questionIndex)) {
          return [...acc, ...curr.options];
        }
        return acc;
      }, []);
      return res;
    } else return [];
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
  const fieldError = (fieldName: string, hasError: boolean) => {
    onFieldError?.(fieldName, hasError);
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
      (t: any) => t.triggerType === "onChange"
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

  const handleAddNewRow = (sectionIndex: number, groupIndex: number) => {
    const newSections = [...formData];
    const repeatedForm = newSections[sectionIndex].formDetails[groupIndex].form;
    const currentIndex = newSections[sectionIndex].formDetails.length - 1;

    newSections[sectionIndex].formDetails.push({
      groupName: newSections[sectionIndex].formDetails[groupIndex].groupName,
      repeated: true,
      form: repeatedForm.map((item: any) => ({
        ...item,
        order: `${item.order}-${currentIndex}`,
      })),
    });

    setFormData(newSections);
  };

  const handleDeleteNewRow = (sectionIndex: number, groupIndex: number) => {
    const newSections = [...formData];
    newSections[sectionIndex].formDetails[groupIndex] = { form: [] };
    setFormData(newSections);
  };

  const stepHasErrors = (errors: any, currentStep: number, data: any[]) => {
    const currentFormDetails = data[currentStep]?.formDetails ?? [];
    const hasErrors = currentFormDetails.some((group: any) =>
      group.form.some((item: any) => errors[item.order])
    );
    setFormHasErrors(Object.entries(errors).length > 0);
    return hasErrors;
  };

  return (
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
          <Box sx={{ width: "100%", height: "100%", boxSizing: "border-box" }}>
            <Formik
              innerRef={FormRef}
              initialValues={initialValues}
              validationSchema={validationSchema}
              enableReinitialize={true}
              key={step}
              onSubmit={(values) => onSubmit(values)}
            >
              {({ errors, values, handleChange }) => (
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
                        if (group.form.length === 0) return null;
                        const visibleQuestions = group.form.filter(
                          (q: any) => q.visible !== "1"
                        );
                        return (
                          <Box
                            key={index}
                            mt={1}
                            borderBottom={1}
                            borderColor="grey.300"
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
                                    onClick={() => handleAddNewRow(step, index)}
                                    sx={{ mr: 2, height: "2.2em" }}
                                  >
                                    Add New Row
                                  </Button>
                                </Box>
                                <Box
                                  sx={{ backgroundColor: "#f5f5f5", p: "6px" }}
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
                                sx={{ backgroundColor: "#f5f5f5", p: "6px" }}
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
                              sx={{ m: 0, width: "100%", p: 1 }}
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
                                    sx={{ cursor: "pointer" }}
                                    onClick={() =>
                                      handleDeleteNewRow(step, index)
                                    }
                                  />
                                )}
                              </Box>
                              {visibleQuestions.map((item: any, i: number) => (
                                <Grid item xs={12} key={item.order || i}>
                                  {VerticleFormFields(
                                    item,
                                    i,
                                    handleChange,
                                    values,
                                    errors,
                                    getSelections,
                                    documentTagType,
                                    onFireTrigger,
                                    fieldError
                                  )}
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        );
                      })}
                    </Form>
                  </Box>
                  {sections > 1 && (
                    <Box
                      sx={{
                        py: "14px",
                        width: "98%",
                        borderTop: "1px solid #ccc",
                      }}
                    >
                      <Stepper activeStep={step} alternativeLabel>
                        {Array.from({ length: sections }, (_, i) => (
                          <Step
                            key={i}
                            onClick={() => setStep(i)}
                            style={{ cursor: "pointer" }}
                          >
                            <StepLabel
                              error={stepHasErrors({}, i, formData)}
                            ></StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                    </Box>
                  )}
                </Box>
              )}
            </Formik>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VerticalFormManagementForm;
