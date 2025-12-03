import React, { useEffect, useState } from "react";
import { FormikProvider, useFormik } from "formik";
import { ErrorMessage, Field } from "formik";

import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Input,
  Box,
  Autocomplete,
  Typography,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PanelComponent from "./PanelComponent";
import { Themecolors } from "api/Colors";
import { color } from "echarts";
import UserHeaderComponent, {
  UserHeaderBox,
  UserInfoBox,
} from "app/appComponents/UserHeaderComponent";
import TextInput from "./TextInput";
import NumericInput from "./NumericInput";
import Dropdown from "./DropDown";
import CombinedDropdown from "./CombinedDropdown";
import PasswordInput from "./PasswordInput";
import CustomTextarea from "./CustomTextArea";
import HtmlEditor from "./HtmlEditor";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import Tooltip from "@mui/material/Tooltip";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SaveIcon from "@mui/icons-material/Save";
import ProfileImageField from "./ProfileImageField";
import UserAvatar from "app/admin/formManagement/userform/UserAvatar";

const StyledGroup = styled(Box)(({ theme }) => ({
  display: "grid",
  width: "100%",
}));

const StyledField = styled(Box)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(1),
  boxSizing: "border-box",
}));

interface FormValues {
  userName: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  showHeaderComponent?: boolean;
  showSaveButton?: boolean;
}

interface GenericFormProps {
  initialValues: any;
  validationSchema: any;
  fields: any[];
  onSubmit: (values: any) => void;
  columns: number;
  readOnly: boolean;
  showSaveButton?: boolean;
  showHeaderComponent?: boolean;
  showUserInfo?: boolean;
  showPrevButton?: boolean;
  showEditButton?: boolean;
  onPrvButtonClick?: () => void;
  onEditButtonClick?: () => void;
  avatar?: string;
  onLoad?: () => void;
}

const GenericForm: React.FC<GenericFormProps> = ({
  initialValues,
  validationSchema,
  fields,
  onSubmit,
  columns,
  readOnly,
  showSaveButton = false,
  showHeaderComponent = true,
  showUserInfo = true,
  showPrevButton = false,
  showEditButton = false,
  onPrvButtonClick = () => {},
  onEditButtonClick = () => {},
  avatar,
  onLoad,
}) => {
  const [values, setValues] = useState({} as FormValues);

  useEffect(() => {
    setValues(initialValues);
  }, [JSON.stringify(initialValues)]);

  const formik = useFormik({
    initialValues: values,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
      formik.resetForm();
    },
    enableReinitialize: true,
  });

  const handleFieldChange = (event, field) => {
    if (field.name === "userPhoneOne") {
      const generatedEmail = generateServerEmail(event.target.value);
      formik.setFieldValue("userServerEmail", generatedEmail);
    }

    formik.handleChange(event);
  };

  const generateServerEmail = (phoneNumber) => {
    const domain = "@nxtstep.in";
    return `${phoneNumber}${domain}`;
  };

  const renderField = (field, index) => {
    const ServerEmailField = field.name === "userServerEmail";
    const isReadOnly = readOnly || ServerEmailField;

    switch (field.type) {
      case "string":
      case "email":
        return (
          <>
            <Box key={`${field.name}-${index}`}>
              <Typography
                variant="caption"
                align="left"
                gutterBottom
                style={{ fontSize: "0.60rem", color: "#6b6b6b" }}
              >
                {field.label}
              </Typography>
              <Field
                name={field.name}
                // label={field.label}
                component={TextInput}
              />
              {formik.touched[field.name] && formik.errors[field.name] && (
                <Typography variant="caption" color="error">
                  <ErrorMessage name={field.name} />
                </Typography>
              )}
            </Box>
          </>
        );
      case "password":
        return (
          <Box key={`${field.name}-${index}`}>
            <Typography
              variant="caption"
              align="left"
              gutterBottom
              style={{ fontSize: "0.60rem", color: "#6b6b6b" }}
            >
              {field.label}
            </Typography>

            <Field
              name={field.name}
              component={PasswordInput}
              label={field.label}
            />

            {formik.touched[field.name] && formik.errors[field.name] && (
              <Typography variant="caption" color="error">
                <ErrorMessage name={field.name} />
              </Typography>
            )}
          </Box>
        );

      case "numeric":
        return (
          <>
            <Box key={field.name}>
              <Typography
                variant="caption"
                align="left"
                gutterBottom
                style={{ fontSize: "0.60rem", color: "#6b6b6b" }}
              >
                {field.label}
              </Typography>
              <Field name={field.name} component={NumericInput} />
              {formik.errors[field.name] && (
                <Typography variant="caption" color="error">
                  <ErrorMessage name={field.name} />
                </Typography>
              )}
            </Box>
          </>
        );
      case "select":
      case "dropdown":
        return (
          <>
            <Box key={field.name} flexDirection={"row"}>
              <Typography
                variant="caption"
                align="left"
                gutterBottom
                style={{ fontSize: "0.60rem", color: "#6b6b6b" }}
              >
                {field.label}
              </Typography>
              <Field
                name={field.name}
                component={Dropdown}
                options={field.selections}
              />
              {formik.touched[field.name] && formik.errors[field.name] && (
                <Typography variant="caption" color="error">
                  <ErrorMessage name={field.name} />
                </Typography>
              )}
            </Box>
          </>
        );
      case "combinedDropdown":
        return (
          <>
            <Box key={field.name} flexDirection={"row"}>
              <Typography
                variant="caption"
                align="left"
                gutterBottom
                style={{ fontSize: "0.60rem", color: "#6b6b6b" }}
              >
                {field.label}
              </Typography>
              <Field
                key={`${field.name}-${index}`}
                name={field.name}
                component={CombinedDropdown}
                options={field.selections}
                label={field.label}
              />
              {formik.touched[field.name] && formik.errors[field.name] && (
                <Typography variant="caption" color="error">
                  <ErrorMessage name={field.name} />
                </Typography>
              )}
            </Box>
          </>
        );
      case "upload":
        return (
          <>
            <div style={{ margin: "10px" }} key={`${field.name}-${index}`}>
              <InputLabel>{field.label}</InputLabel>
              <Input
                type="file"
                name={field.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                readOnly={readOnly}
                inputProps={{ readOnly: isReadOnly }}
              />
            </div>
          </>
        );

      case "profileImage":
        return (
          <Box key={`${field.name}-${index}`}>
            <Typography
              variant="caption"
              align="left"
              gutterBottom
              style={{ fontSize: "0.60rem", color: "#6b6b6b" }}
            >
              {field.label}
            </Typography>
            <ProfileImageField
              userId={field.userId}
              avatar={avatar}
              onLoad={onLoad}
              userFirstName={initialValues.userFirstName}
              userLastName={initialValues.userLastName}
            />
          </Box>
        );

      case "textArea":
        return (
          <Box key={field.name}>
            <Typography
              variant="caption"
              align="left"
              gutterBottom
              style={{ fontSize: "0.60rem", color: "#6b6b6b" }}
            >
              {field.label}
            </Typography>
            <Field
              name={field.name}
              component={CustomTextarea}
              rows={field.rows || 2}
            />
            {formik.touched[field.name] && formik.errors[field.name] && (
              <Typography variant="caption" color="error">
                <ErrorMessage name={field.name} />
              </Typography>
            )}
          </Box>
        );

      case "htmlEditor":
        return (
          <Box key={field.name}>
            <Typography
              variant="caption"
              align="left"
              gutterBottom
              style={{ fontSize: "0.60rem", color: "#6b6b6b" }}
            >
              {field.label}
            </Typography>
            <Field
              name={field.name}
              component={HtmlEditor}
              height={field.height}
            />
            {formik.touched[field.name] && formik.errors[field.name] && (
              <Typography variant="caption" color="error">
                <ErrorMessage name={field.name} />
              </Typography>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  const userFullName = `${formik.values.userFirstName || ""} ${
    formik.values.userLastName || ""
  }`.trim();

  return (
    <FormikProvider value={formik}>
      <div
        style={{
          backgroundColor: "#ffffff",
          height: "100%",
          paddingTop: "10px",
          paddingBottom: "10px",
        }}
      >
        <form
          onSubmit={formik.handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            border: "0.5px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <Box>
            {showHeaderComponent && (
              <UserHeaderComponent
                ShowsaveButton={true}
                ButtonName={"Save"}
                userInfoComponent={
                  showUserInfo && (
                    <>
                      <UserHeaderBox>
                        <UserAvatar
                          avatarUrl={avatar}
                          fullName={userFullName}
                          fontSize={18}
                        />

                        <UserInfoBox>
                          <Typography
                            variant="h6"
                            sx={{ color: Themecolors.UH_text3 }}
                          >
                            {userFullName}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: Themecolors.UH_text3 }}
                          >
                            {formik.values.userEmail}
                          </Typography>
                        </UserInfoBox>
                      </UserHeaderBox>
                    </>
                  )
                }
              />
            )}
          </Box>

          <Box sx={{ overflowY: "auto" }}>
            <PanelComponent title="">
              <input
                type="text"
                name="dummyUsername"
                style={{ display: "none" }}
              />
              <input
                type="password"
                name="dummyPassword"
                style={{ display: "none" }}
              />
              <input
                type="email"
                name="dummyEmail"
                style={{ display: "none" }}
              />
              <input type="email" name="LastName" style={{ display: "none" }} />
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                {showEditButton && (
                  <Tooltip title="EDIT">
                    <IconButton
                      onClick={onEditButtonClick}
                      sx={{
                        padding: "10px",
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}

                {showPrevButton && (
                  <Tooltip title="PREVIEW">
                    <IconButton
                      onClick={onPrvButtonClick}
                      sx={{
                        padding: "10px",
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {showSaveButton && (
                  <Tooltip title="SAVE">
                    <IconButton
                      type="submit"
                      sx={{
                        padding: "10px",
                      }}
                    >
                      <SaveIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              <StyledGroup
                sx={{
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                }}
              >
                {fields.map((field, index) => {
                  return (
                    <StyledField
                      key={index}
                      sx={{
                        gridColumn:
                          field.column === 1 ? `span ${columns}` : "auto",
                      }}
                    >
                      {renderField(field, index)}
                    </StyledField>
                  );
                })}
              </StyledGroup>
            </PanelComponent>
          </Box>
        </form>
      </div>
    </FormikProvider>
  );
};

export default GenericForm;
