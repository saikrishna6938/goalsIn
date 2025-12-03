import React from "react";
import TextField from "@mui/material/TextField";
import { FieldProps } from "formik";
import { sharedInputStyles } from "app/components/regularinputs/InputStyles";

type NumericInputProps = FieldProps & {
  label: string;
  handleChange?: Function;
};

const NumericInput: React.FC<NumericInputProps> = ({
  field,
  form: { touched, errors, values } = undefined,
  label,
  handleChange = () => {},
}) => {
  const isDisabled = values?.[`${field.name}_disabled`];

  return (
    <TextField
      {...field}
      // label={label}
      variant="outlined"
      disabled={isDisabled}
      type="number"
      error={touched[field.name] && Boolean(errors[field.name])}
      fullWidth
      onChange={(event) => {
        const value = event.target.value;
        field.onChange(event);
        handleChange({ name: field.name, value });
      }}
      InputLabelProps={{
        sx: sharedInputStyles.labelProps,
      }}
      sx={sharedInputStyles.root}
      InputProps={{
        inputProps: { min: 0, step: 0.5 },
        sx: sharedInputStyles.inputProps,
      }}
    />
  );
};

export default NumericInput;
