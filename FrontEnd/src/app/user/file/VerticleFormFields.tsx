import * as React from "react";
import { Box, Typography } from "@mui/material";
import { ErrorMessage, Field } from "formik";
import CheckboxGroup from "app/formComponents/CheckBoxGroup";
import RadioButton from "app/formComponents/RadioButton";
import CustomUploadFile from "app/formComponents/CustomUploadFile";
import Dropdown from "app/formComponents/DropDown";
import CustomDatePicker from "app/formComponents/CustomDatePicker";
import HtmlEditors from "app/formComponents/HtmlEditors";
import { Themecolors } from "api/Colors";
import SingleSelectionButton from "../SingleSelectionComponent";
import LabelInputTextField from "./LableInputTextField";
import LabelCustomTextarea from "./LableCustomTextarea";
import LabelNumericInput from "./LableNumericInput";
import LabelCheckboxGroup from "./LableCheckboxGroup";
import LabelRadioButton from "./LableRadioButton";
import LabelDropdown from "./LableDropdown";

interface TriggerType {
  id: number;
  type: string;
  value: string;
  compareId: string;
}

export const VerticleFormFields = (
  item,
  i,
  handleChange,
  values,
  errors,
  getSelections,
  documentTagType,
  onFireTrigger?: (args: { name: string; value: string; type: string }) => void,
  fieldError?: (fieldName: string, hasError: boolean) => void
) => {
  if (item.visible === "1") {
    return null;
  }

  const handleselectionvalue = (
    selectedOption: { name: string; id: string },
    fieldName: string
  ) => {
    handleChange({ target: { name: fieldName, value: selectedOption.id } });
  };

  const shouldFieldBeVisible = (trigger: TriggerType | null) => {
    if (!trigger) return true;
    const currentValues = values[trigger.compareId];
    const selectedvalues = item.trigger?.value.split(",");
    return selectedvalues.includes(currentValues);
  };

  if (item.trigger && !shouldFieldBeVisible(item.trigger)) {
    return null;
  }

  const hasError = errors[item.order];

  switch (+item.attributeType) {
    case 1: // Textbox
      return (
        <Box key={item.order} sx={{ mb: hasError ? "1px" : "16px" }}>
          <Field
            name={item.order}
            label={item.attributeName}
            component={LabelInputTextField}
            handleChange={(args) => {
              onFireTrigger(args);
            }}
            fieldError={(value: boolean) => {
              fieldError?.(item.order, value);
            }}
          />

          {errors[item.order] && (
            <Typography variant="caption" color="error">
              <ErrorMessage name={item.order} />
            </Typography>
          )}
          {item.attributeDescription && (
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.7rem",
                color: Themecolors.InputText_Color4,
                display: "block",
              }}
            >
              {item.attributeDescription}
            </Typography>
          )}
        </Box>
      );
    case 2: //Description box
      return (
        <Box key={item.order} sx={{ mb: hasError ? "1px" : "16px" }}>
          <Field
            name={item.order}
            label={item.attributeName}
            component={LabelCustomTextarea}
            handleChange={(args) => {
              onFireTrigger(args);
            }}
            fieldError={(value: boolean) => {
              fieldError?.(item.order, value);
            }}
          />
          {errors[item.order] && (
            <Typography variant="caption" color="error">
              <ErrorMessage name={item.order} />
            </Typography>
          )}
          {item.attributeDescription && (
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.7rem",
                color: Themecolors.InputText_Color4,
                display: "block",
              }}
            >
              {item.attributeDescription}
            </Typography>
          )}
        </Box>
      );

    case 3: //checkbox
      return (
        <Box key={item.order} marginBottom={2}>
          <Field
            name={item.order}
            label={item.attributeName}
            options={getSelections(item.order)}
            component={LabelCheckboxGroup}
            handleChange={(args) => {
              onFireTrigger(args);
            }}
          />
          {errors[item.order] && (
            <Typography variant="caption" color="error">
              <ErrorMessage name={item.order} />
            </Typography>
          )}
          {item.attributeDescription && (
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.7rem",
                color: Themecolors.InputText_Color4,
                display: "block",
              }}
            >
              {item.attributeDescription}
            </Typography>
          )}
        </Box>
      );
    case 4: //radio button
      return (
        <Box key={item.order} marginBottom={2}>
          <Field
            name={item.order}
            label={item.attributeName}
            options={getSelections(item.order)}
            component={LabelRadioButton}
            handleChange={(args) => {
              onFireTrigger(args);
            }}
          />
          {errors[item.order] && (
            <Typography variant="caption" color="error">
              <ErrorMessage name={item.order} />
            </Typography>
          )}
          {item.attributeDescription && (
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.7rem",
                color: Themecolors.InputText_Color4,
                display: "block",
              }}
            >
              {item.attributeDescription}
            </Typography>
          )}
        </Box>
      );
    case 5: // UploadButton
      return (
        <Box key={item.order} marginBottom={2} flexDirection={"row"}>
          <Typography
            variant="caption"
            align="left"
            gutterBottom
            style={{ fontSize: "0.60rem", color: "#6b6b6b" }}
          >
            {item.attributeName}
          </Typography>
          <Field
            key={item.order}
            name={item.order}
            label={item.attributeDescription}
            component={CustomUploadFile}
          />
          {errors[item.order] && (
            <Typography variant="caption" color="error">
              <ErrorMessage name={item.order} />
            </Typography>
          )}
          {item.attributeDescription && (
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.7rem",
                color: Themecolors.InputText_Color4,
                display: "block",
              }}
            >
              {item.attributeDescription}
            </Typography>
          )}
        </Box>
      );
    case 6: //numeric box
      return (
        <Box key={item.order} sx={{ mb: hasError ? "1px" : "16px" }}>
          <Field
            name={item.order}
            label={item.attributeName}
            component={LabelNumericInput}
            handleChange={(args) => {
              onFireTrigger(args);
            }}
            fieldError={(value: boolean) => {
              fieldError?.(item.order, value);
            }}
          />

          {errors[item.order] && (
            <Typography variant="caption" color="error">
              <ErrorMessage name={item.order} />
            </Typography>
          )}
          {item.attributeDescription && (
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.7rem",
                color: Themecolors.InputText_Color4,
                display: "block",
              }}
            >
              {item.attributeDescription}
            </Typography>
          )}
        </Box>
      );
    case 8: //dropdown
      return (
        <Box key={item.order} marginBottom={2} flexDirection={"row"}>
          <Field
            key={item.order}
            name={item.order}
            label={item.attributeName}
            options={getSelections(item.order)}
            component={LabelDropdown}
            handleChange={(args) => {
              onFireTrigger(args);
            }}
          />

          {errors[item.order] && (
            <Typography variant="caption" color="error">
              <ErrorMessage name={item.order} />
            </Typography>
          )}
          {item.attributeDescription && (
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.7rem",
                color: Themecolors.InputText_Color4,
                display: "block",
              }}
            >
              {item.attributeDescription}
            </Typography>
          )}
        </Box>
      );
    case 9: //date picker
      return (
        <Box key={item.order} marginBottom={2} flexDirection={"column"}>
          <Typography
            variant="caption"
            align="left"
            gutterBottom
            style={{ fontSize: "0.60rem", color: "#6b6b6b" }}
          >
            {item.attributeName}
          </Typography>
          <br></br>
          <Field
            key={item.order}
            name={item.order}
            label={item.attributeDescription}
            component={CustomDatePicker}
          />

          {errors[item.order] && (
            <Typography variant="caption" color="error">
              <ErrorMessage name={item.order} />
            </Typography>
          )}
          {item.attributeDescription && (
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.7rem",
                color: Themecolors.InputText_Color4,
                display: "block",
              }}
            >
              {item.attributeDescription}
            </Typography>
          )}
        </Box>
      );
    case 10: // Single Selection Button
      return (
        <Box key={item.order} marginBottom={2} flexDirection={"row"}>
          <Field
            key={item.order}
            name={item.order}
            label={item.attributeDescription}
            options={getSelections(item.order)}
            component={SingleSelectionButton}
            selectedValue={values[item.order] ?? ""}
            onChange={(selectedOption) => {
              handleselectionvalue(selectedOption, item.attributeName);
            }}
          />
          {errors[item.order] && (
            <Typography variant="caption" color="error">
              <ErrorMessage name={item.order} />
            </Typography>
          )}
          {item.attributeDescription && (
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.7rem",
                color: Themecolors.InputText_Color4,
                display: "block",
              }}
            >
              {item.attributeDescription}
            </Typography>
          )}
        </Box>
      );

    case 11: //Html Editor
      return (
        <Box key={item.order} marginBottom={2} flexDirection={"column"}>
          <Typography
            variant="caption"
            align="left"
            gutterBottom
            style={{ fontSize: "0.60rem", color: "#6b6b6b" }}
          >
            {item.attributeName}
          </Typography>
          <Field name={item.order} component={HtmlEditors} />
          {errors[item.order] && (
            <Typography variant="caption" color="error">
              <ErrorMessage name={item.order} />
            </Typography>
          )}
          {item.attributeDescription && (
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.7rem",
                color: Themecolors.InputText_Color4,
                display: "block",
              }}
            >
              {item.attributeDescription}
            </Typography>
          )}
        </Box>
      );

    default:
      return null;
  }
};
