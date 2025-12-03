import React from "react";
import { FieldProps } from "formik";
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { Themecolors } from "api/Colors";

type Option = {
  id: string;
  name: string;
};

type RadioButtonProps = FieldProps & {
  label: string;
  options: Option[];
  handleChange?: Function;
};

const RadioButton: React.FC<RadioButtonProps> = ({
  field,
  form: { touched, errors },
  label,
  options,
  handleChange = () => {},
}) => (
  <FormControl
    component="fieldset"
    error={touched[field.name] && Boolean(errors[field.name])}
    fullWidth
  >
    <FormControl component="fieldset" variant="filled">
      <RadioGroup
        {...field}
        value={field.value || ""}
        onChange={(event) => {
          const value = event.target.value;
          field.onChange(event);
          handleChange({ name: field.name, value });
        }}
        style={{ flexDirection: "row", flexWrap: "wrap" }}
      >
        {options.map((option, index) => (
          <FormControlLabel
            key={index}
            value={option.name}
            control={
              <Radio
                sx={{ "&.Mui-checked": { color: Themecolors.RB_Selected2 } }}
              />
            }
            label={option.name}
          />
        ))}
      </RadioGroup>
    </FormControl>
    {/* {touched[field.name] && errors[field.name] && (
      <div style={{ color: "red" }}>{errors[field.name] as any}</div>
    )} */}
  </FormControl>
);

export default RadioButton;
