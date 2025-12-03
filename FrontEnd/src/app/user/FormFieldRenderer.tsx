import * as React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { ErrorMessage, Field } from "formik";
import TextInput from "app/formComponents/TextInput";
import CustomTextarea from "app/formComponents/CustomTextArea";
import CheckboxGroup from "app/formComponents/CheckBoxGroup";
import RadioButton from "app/formComponents/RadioButton";
import CustomUploadFile from "app/formComponents/CustomUploadFile";
import NumericInput from "app/formComponents/NumericInput";
import Dropdown from "app/formComponents/DropDown";
import CustomDatePicker from "app/formComponents/CustomDatePicker";
import { api } from "api/API";
import { useState, useEffect } from "react";

const FormFieldRenderer = ({
  item,
  i,
  handleChange,
  values,
  errors,
  getSelections,
  documentTagType,
  answerObject = null,
  handleFileClick = (file: any) => {},
}) => {
  // State for storing files
  const [files, setFiles] = useState([]);

  // Effect to handle API calls and set files
  useEffect(() => {
    if (
      answerObject &&
      answerObject.hasOwnProperty(item.order) &&
      +item.attributeType == 5
    ) {
      const fetchFiles = async () => {
        let tempFiles = [];
        const uploadAnswers = answerObject[item.order];

        for (let uploadName of uploadAnswers) {
          try {
            const res = await api.post(`get/file`, {
              body: {
                uploadName: uploadName,
              },
            });
            if (res.status) tempFiles.push(res.data);
          } catch (error) {
            console.error("Error fetching file:", error);
          }
        }
        setFiles(tempFiles);
      };
      fetchFiles();
    }
  }, [answerObject, item.order]);

  // The switch renderer code...
  switch (+item.attributeType) {
    case 1: // Textbox
    case 10: //document tag type
      return (
        <Box marginBottom={2}>
          <Typography variant="subtitle2" align="left" gutterBottom>
            {item.attributeName}
          </Typography>
          <Field
            name={item.order}
            label={item.attributeDescription}
            component={TextInput}
          />

          {errors[item.order] && (
            <Typography variant="caption" color="error">
              <ErrorMessage name={item.order} />
            </Typography>
          )}
        </Box>
      );
    case 2: //Description box
      return (
        <Box marginBottom={2}>
          <Typography variant="subtitle2" align="left" gutterBottom>
            {item.attributeName}
          </Typography>
          <Field
            name={item.order}
            label={item.attributeDescription}
            component={CustomTextarea}
          />
          {errors[item.order] && (
            <Typography variant="caption" color="error">
              <ErrorMessage name={item.order} />
            </Typography>
          )}
        </Box>
      );

    case 3: //checkbox
      return (
        <Box marginBottom={2}>
          <Typography variant="subtitle2" align="left" gutterBottom>
            {item.attributeName}
          </Typography>
          <Field
            name={item.order}
            label={item.attributeDescription}
            options={getSelections(item.order)}
            component={CheckboxGroup}
          />
          {errors[item.order] && (
            <Typography variant="caption" color="error">
              <ErrorMessage name={item.order} />
            </Typography>
          )}
        </Box>
      );
    case 4: //radio button
      return (
        <Box marginBottom={2}>
          <Field
            name={item.order}
            label={item.attributeDescription}
            options={getSelections(item.order)}
            component={RadioButton}
          />
          {errors[item.order] && (
            <Typography variant="caption" color="error">
              <ErrorMessage name={item.order} />
            </Typography>
          )}
        </Box>
      );
    case 5: // UploadButton
      return (
        <Box marginBottom={2} flexDirection={"row"}>
          <Typography variant="caption" align="left">
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
          {answerObject && (
            <Box mt={2}>
              <Grid container spacing={2}>
                {files?.map((file: any, index: number) => (
                  <Grid item key={index}>
                    <Box
                      sx={{
                        border: "1px solid #000",
                        padding: 1,
                        minWidth: 100,
                        minHeight: 30,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onClick={() => handleFileClick(file)}
                    >
                      <Typography variant="body2">{file.fileName}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      );
    case 6: //numeric box
      return (
        <Box marginBottom={2}>
          <Typography variant="subtitle2" align="left" gutterBottom>
            {item.attributeName}
          </Typography>
          <Field
            name={item.order}
            label={item.attributeDescription}
            component={NumericInput}
          />

          {errors[item.order] && (
            <Typography variant="caption" color="error">
              <ErrorMessage name={item.order} />
            </Typography>
          )}
        </Box>
      );
    case 8: //dropdown
      return (
        <Box marginBottom={2} flexDirection={"row"}>
          <Typography variant="caption" align="left">
            {item.attributeName}
          </Typography>
          <Field
            key={item.order}
            name={item.order}
            label={item.attributeDescription}
            options={getSelections(item.order)}
            component={Dropdown}
          />

          {errors[item.order] && (
            <Typography variant="caption" color="error">
              <ErrorMessage name={item.order} />
            </Typography>
          )}
        </Box>
      );
    case 9: //date picker
      return (
        <Box marginBottom={2} flexDirection={"column"}>
          <Typography variant="caption" align="left">
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
        </Box>
      );
    default:
      return null;
  }
};

export default FormFieldRenderer;
