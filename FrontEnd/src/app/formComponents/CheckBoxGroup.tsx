import React from "react";
import { FieldProps } from "formik";
import {
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { values } from "mobx";

type Option = {
  id: string;
  name: string;
};

type CheckboxGroupProps = FieldProps & {
  label: string;
  options: Option[];
  handleChange: Function;
};

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  field,
  form: { touched, errors, setFieldValue },
  label,
  options,
  handleChange = () => {},
}) => {
  const handleValuesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const checked = event.target.checked;

    let newValue: string[] = [];

    if (field.value) newValue = [...field.value];

    if (checked) {
      if (!newValue.includes(value)) {
        newValue.push(value);
      }
    } else {
      const index = newValue.indexOf(value);
      if (index > -1) {
        newValue.splice(index, 1);
      }
    }

    setFieldValue(field.name, newValue);
    handleChange({ name: field.name, value: newValue });
  };

  return (
    <FormControl
      component="fieldset"
      error={touched[field.name] && Boolean(errors[field.name])}
      fullWidth
    >
      <FormGroup style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {options.map((option) => (
          <FormControlLabel
            key={option.name}
            control={
              <Checkbox
                value={option.name}
                onChange={handleValuesChange}
                checked={
                  (field.value && field.value.includes(option.name)) ?? false
                }
              />
            }
            label={option.name}
          />
        ))}
      </FormGroup>

      {touched[field.name] && errors[field.name] && (
        <div style={{ color: "red" }}>{errors[field.name] as any}</div>
      )}
    </FormControl>
  );
};

export default CheckboxGroup;
