import React from "react";
import { FieldProps } from "formik";
import { Typography } from "@mui/material";

type SingleSelectionButtonProps = FieldProps & {
  label: string;
  options: { name: string; id: string }[];
  onChange: (selectedOption: { name: string; id: string }) => void;
  selectedValue?: string;
};

const SingleSelectionButton: React.FC<SingleSelectionButtonProps> = ({
  field,
  form: { touched, errors, setFieldValue },
  label,
  options,
  onChange,
  selectedValue,
}) => {
  const handleClick = (name: string, id: string) => {
    if (field.value !== name) {
      setFieldValue(field.name, name);
      onChange({ name, id });
    }
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <Typography variant="subtitle2" align="left" gutterBottom>
        {label}
      </Typography>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5em" }}>
        {options.map((option) => (
          <button
            type="button"
            key={option.id}
            onClick={() => handleClick(option.name, option.id)}
            style={{
              padding: "7px 14px",
              border: `2px solid ${
                selectedValue === option.name ? "#333" : "#ccc"
              }`, // Dark border for selected option
              backgroundColor:
                selectedValue === option.name ? "#e0e0e0" : "#f9f9f9", // Highlight selected option
              transition: "background-color 0.3s, border-color 0.3s",
              color: selectedValue === option.name ? "#333" : "#000",
              cursor: "pointer",
              borderRadius: "4px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {option.name}
          </button>
        ))}
      </div>

      {touched[field.name] && errors[field.name] && (
        <div style={{ color: "red", marginTop: "8px" }}>
          {errors[field.name] as string}
        </div>
      )}
    </div>
  );
};

export default SingleSelectionButton;
