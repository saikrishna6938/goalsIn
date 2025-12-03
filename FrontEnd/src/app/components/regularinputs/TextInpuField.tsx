import React from "react";
import TextField from "@mui/material/TextField";
import { Themecolors } from "api/Colors";
import { sharedInputStyles } from "./InputStyles";

interface TextInputFieldProps {
  label?: string;
  id?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  variant?: "outlined" | "filled" | "standard";
  sx?: any;
  readOnly?: boolean;
  placeholder?: string;
}

const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  id,
  value,
  onChange,
  type = "text",
  error = false,
  helperText = "",
  required = false,
  disabled,
  name,
  variant = "outlined",
  sx,
  readOnly,
  placeholder,
}) => {
  return (
    <TextField
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      fullWidth
      variant={variant}
      error={error}
      helperText={helperText}
      required={required}
      sx={{ ...sharedInputStyles.root, ...sx }}
      InputProps={{
        sx: sharedInputStyles.inputProps,
        readOnly,
      }}
      InputLabelProps={{
        sx: {
          ...sharedInputStyles.labelProps,
          ...(variant !== "standard" && {
            top: "50%",
            transform: "translateY(-50%)",
            left: "14px",
            position: "absolute",
            pointerEvents: "none",
            transition: "all 0.2s ease",
            color: Themecolors.InputText_Color1,
            "&.MuiInputLabel-shrink": {
              top: "-8px",
              transform: "translateY(0) scale(0.65)",
            },
          }),
        },
      }}
    />
  );
};

export default TextInputField;
