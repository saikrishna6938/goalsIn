import React from "react";
import { FieldProps } from "formik";
import { TextField } from "@mui/material";
import { TimePicker } from "@mui/lab";

type TimePickerProps = FieldProps & {
  label: string;
};

const CustomTimePicker: React.FC<TimePickerProps> = ({
  field,
  form: { touched, errors, setFieldValue },
  label,
}) => {
  const handleChange = (time: Date | null) => {
    setFieldValue(field.name, time);
  };

  return (
    <TimePicker
      label={label}
      value={field.value}
      onChange={handleChange}
      renderInput={(params) => (
        <TextField
          {...params}
          error={touched[field.name] && Boolean(errors[field.name])}
        />
      )}
    />
  );
};

export default CustomTimePicker;
