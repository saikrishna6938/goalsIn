import React from "react";
import { FieldProps } from "formik";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";

type YesNoButtonProps = FieldProps & {
  label: string;
};

const YesNoButton: React.FC<YesNoButtonProps> = ({
  field,
  form: { touched, errors, setFieldValue },
  label,
}) => {
  const handleYesClick = () => setFieldValue(field.name, true);
  const handleNoClick = () => setFieldValue(field.name, false);

  return (
    <div>
      <label>{label}</label>
      <ButtonGroup variant="contained" color="primary">
        <Button
          onClick={handleYesClick}
          color={field.value === true ? "secondary" : "primary"}
        >
          Yes
        </Button>
        <Button
          onClick={handleNoClick}
          color={field.value === false ? "secondary" : "primary"}
        >
          No
        </Button>
      </ButtonGroup>
      {touched[field.name] && errors[field.name] && (
        <div style={{ color: "red" }}>{errors[field.name] as any}</div>
      )}
    </div>
  );
};

export default YesNoButton;
