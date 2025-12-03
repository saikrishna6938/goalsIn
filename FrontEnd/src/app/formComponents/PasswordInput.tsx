import React from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import { FieldProps } from "formik";
import { Themecolors } from "api/Colors";
import { sharedInputStyles } from "app/components/regularinputs/InputStyles";

// Password generator
const generateRandomPassword = (): string => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(
    { length: 10 },
    () => charset[Math.floor(Math.random() * charset.length)]
  ).join("");
};

type PasswordInputProps = FieldProps & {
  label?: string;
};

const PasswordInput: React.FC<PasswordInputProps> = ({
  field,
  form: { touched, errors, setFieldValue },
  label = "Password",
}) => {
  const isTouched = touched[field.name];
  const errorMessage = errors[field.name];
  const isError = isTouched && typeof errorMessage === "string";

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setFieldValue(field.name, newPassword);
  };

  return (
    <TextField
      {...field}
      type="text"
      value={field.value ?? ""}
      error={!!isError}
      helperText={isError ? errorMessage : ""}
      onChange={(e) => setFieldValue(field.name, e.target.value)}
      fullWidth
      variant="outlined"
      InputLabelProps={{
        sx: sharedInputStyles.labelProps,
      }}
      sx={sharedInputStyles.root}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={handleGeneratePassword}
              title="Generate Password"
              edge="end"
            >
              <LockResetIcon />
            </IconButton>
          </InputAdornment>
        ),
        sx: sharedInputStyles.inputProps,
      }}
    />
  );
};

export default PasswordInput;
