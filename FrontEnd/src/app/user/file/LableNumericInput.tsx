import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import { FieldProps } from "formik";
import { Box, Typography, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { sharedInputStyles } from "app/components/regularinputs/InputStyles";

type NumericInputProps = FieldProps & {
  label: string;
  handleChange?: (args: { name: string; value: string }) => void;
  fieldError?: (value: boolean) => void;
};

const LabelNumericInput: React.FC<NumericInputProps> = ({
  field,
  form: { touched, errors, setFieldValue, values },
  label,
  handleChange = () => {},
  fieldError = () => {},
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(field.value ?? "");

  const isDisabled = values?.[`${field.name}_disabled`];
  const hasError = touched?.[field.name] && Boolean(errors?.[field.name]);

  useEffect(() => {
    fieldError(hasError);
  }, [hasError, fieldError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTempValue(newValue);
  };

  const saveAndClose = () => {
    setFieldValue(field.name, tempValue);
    handleChange({ name: field.name, value: tempValue });
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setTempValue(field.value ?? "");
    setIsEditing(false);
  };

  const handleRowClick = () => {
    if (!isDisabled && !isEditing) {
      setTempValue(field.value ?? "");
      setIsEditing(true);
    }
  };

  return (
    <Box
      sx={{
        borderBottom: isEditing
          ? ""
          : hasError
          ? "2px solid red"
          : "1px solid #ccc",

        width: "100%",
      }}
    >
      {isEditing ? (
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <TextField
            {...field}
            label={label}
            name={field.name}
            variant="outlined"
            value={tempValue}
            onChange={handleInputChange}
            onBlur={(e) => {
              field.onBlur(e);
              saveAndClose();
            }}
            autoFocus
            fullWidth
            type="number"
            error={hasError}
            disabled={isDisabled}
            InputLabelProps={{
              sx: sharedInputStyles.labelProps,
            }}
            InputProps={{
              inputProps: { min: 0, step: 0.5 },
              sx: {
                ...sharedInputStyles.inputProps,
                width: "100%",
              },
            }}
            sx={{
              ...sharedInputStyles.root,
              flex: 1,
              minWidth: 0,
            }}
          />
          <IconButton size="small" onClick={cancelEdit} sx={{ ml: 1 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Box
          onClick={handleRowClick}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            minWidth: 0,
            height: "3vh",
            cursor: !isDisabled ? "pointer" : "default",
            "&:hover .edit-icon": {
              opacity: !isDisabled ? 1 : 0,
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: "#555",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {label}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flex: 1,
              ml: 2,
              minWidth: 0,
              gap: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                minWidth: 0,
              }}
            >
              <Typography variant="body2" component="span">
                -
              </Typography>
              <Typography
                variant="body2"
                component="span"
                sx={{
                  color: field.value ? "text.primary" : "#aaa",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontStyle: !field.value ? "italic" : "normal",
                  ml: 2,
                  flex: 1,
                }}
              >
                {field.value || "NOT SET"}
              </Typography>
            </Box>

            {!isDisabled && (
              <IconButton
                size="small"
                className="edit-icon"
                sx={{
                  opacity: 0,
                  transition: "opacity 0.2s",
                  flexShrink: 0,
                  "&:hover": { opacity: 1 },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default LabelNumericInput;
