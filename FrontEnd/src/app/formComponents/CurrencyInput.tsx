import React from "react";
import TextField from "@mui/material/TextField";
import { FieldProps } from "formik";

type CurrencyInputProps = FieldProps & {
  label: string;
  currencySymbol?: string;
};

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  field,
  form: { touched, errors, setFieldValue },
  label,
  currencySymbol = "$",
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const numericValue = value.replace(/[^\d.]/g, ""); // Remove non-numeric characters

    setFieldValue(field.name, numericValue);
  };

  const value = currencySymbol + field.value;

  return (
    <TextField
      {...field}
      value={value}
      onChange={handleChange}
      label={label}
      variant="outlined"
      error={touched[field.name] && Boolean(errors[field.name])}
      fullWidth
    />
  );
};

export default CurrencyInput;
