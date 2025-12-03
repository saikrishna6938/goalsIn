import React from "react";
import { FieldProps } from "formik";
import { TextField } from "@mui/material";
import { Themecolors } from "api/Colors";

type TextareaProps = FieldProps & {
  label: string;
  placeholder?: string;
  rows?: number;
  handleChange?: Function;
};

const CustomTextarea: React.FC<TextareaProps> = ({
  field,
  form: { touched, errors, setFieldValue, values } = undefined,
  label,
  placeholder,
  rows = 6,
  handleChange = () => {},
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(field.name, e.target.value);
    handleChange({ name: field.name, value: e.target.value });
  };
  const isDisabled = values?.[`${field.name}_disabled`];

  return (
    <TextField
      {...field}
      // label={label}
      value={field.value ?? ""}
      placeholder={placeholder}
      multiline
      disabled={isDisabled}
      rows={rows}
      variant="outlined"
      fullWidth
      onChange={handleInputChange}
      error={touched[field.name] && Boolean(errors[field.name])}
      InputLabelProps={{
        sx: {
          color: Themecolors.InputText_Color1,
          "&.Mui-focused": {
            color: Themecolors.InputText_Color1,
          },
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "4px",
          "& fieldset": {
            borderColor:
              touched?.[field.name] && errors?.[field.name]
                ? "#f44336"
                : "#bdbdbd",
            borderWidth:
              touched?.[field.name] && errors?.[field.name] ? "2px" : "1px",
          },
          "&:hover fieldset": {
            borderColor:
              touched?.[field.name] && errors?.[field.name]
                ? "#f44336"
                : Themecolors.InputBorder2,
          },
          "&.Mui-focused fieldset": {
            borderColor:
              touched?.[field.name] && errors?.[field.name]
                ? "#f44336"
                : Themecolors.InputBorder2,
          },
        },
      }}
      InputProps={{
        sx: {
          color: Themecolors.InputText_Color1,
          "& .MuiInputBase-input": {
            color: Themecolors.InputText_Color1,
          },
        },
      }}
    />
  );
};

export default CustomTextarea;
