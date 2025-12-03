import React from "react";
import TextField from "@mui/material/TextField";
import { FieldProps } from "formik";
import { Themecolors } from "api/Colors";
import { Box, Typography } from "@mui/material";
import { sharedInputStyles } from "app/components/regularinputs/InputStyles";

type TextInputProps = FieldProps & {
  label: string;
  handleChange: Function;
};

const TextInput: React.FC<TextInputProps> = ({
  field = undefined,
  form: { touched, errors, setFieldValue, values } = undefined,
  label = undefined,
  handleChange = () => {},
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(field.name, e.target.value);
    handleChange({ name: field.name, value: e.target.value });
  };

  const isDisabled = values?.[`${field.name}_disabled`];

  return (
    <>
      <TextField
        {...field}
        // label={label}
        name={field.name}
        variant="outlined"
        value={field.value ?? ""}
        error={touched[field.name] && Boolean(errors[field.name])}
        onChange={handleInputChange}
        disabled={isDisabled}
        fullWidth
        InputLabelProps={{
          sx: sharedInputStyles.labelProps,
        }}
        InputProps={{
          sx: sharedInputStyles.inputProps,
        }}
        sx={sharedInputStyles.root}
      />
    </>
  );
};

export default TextInput;
