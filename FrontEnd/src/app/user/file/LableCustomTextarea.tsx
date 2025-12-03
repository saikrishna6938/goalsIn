import React, { useEffect, useState } from "react";
import { FieldProps } from "formik";
import { Box, Typography, IconButton, TextField } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { Themecolors } from "api/Colors";

type TextareaProps = FieldProps & {
  label: string;
  placeholder?: string;
  rows?: number;
  handleChange?: (args: { name: string; value: string }) => void;
  fieldError?: (value: boolean) => void;
};

const LabelCustomTextarea: React.FC<TextareaProps> = ({
  field,
  form: { touched, errors, setFieldValue, values },
  label,
  placeholder,
  rows = 4,
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
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
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
            multiline
            rows={rows}
            fullWidth
            error={hasError}
            disabled={isDisabled}
            placeholder={placeholder}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: "4px",
                "& fieldset": {
                  borderColor: hasError ? "#f44336" : "#bdbdbd",
                  borderWidth: hasError ? "2px" : "1px",
                },
                "&:hover fieldset": {
                  borderColor: hasError ? "#f44336" : Themecolors.InputBorder2,
                },
                "&.Mui-focused fieldset": {
                  borderColor: hasError ? "#f44336" : Themecolors.InputBorder2,
                },
              },
            }}
            InputLabelProps={{
              sx: {
                color: Themecolors.InputText_Color1,
                "&.Mui-focused": {
                  color: Themecolors.InputText_Color1,
                },
              },
            }}
            InputProps={{
              sx: {
                color: Themecolors.InputText_Color1,
                "& .MuiInputBase-input": {
                  color: Themecolors.InputText_Color1,
                },
              },
            }}
          />
          <IconButton
            size="small"
            onClick={cancelEdit}
            sx={{
              flexShrink: 0,
              backgroundColor: "background.paper",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Box
          onClick={handleRowClick}
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            height: "3vh",
            minWidth: 0,
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
            {label || "Description"}
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
              height: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                minWidth: 0,
                height: "100%",
                position: "relative",
              }}
            >
              <Typography
                variant="body2"
                component="span"
                sx={{
                  mr: 1,
                  lineHeight: "3vh",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                -
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    color: field.value ? "text.primary" : "#aaa",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    lineClamp: 2,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    fontStyle: !field.value ? "italic" : "normal",
                    lineHeight: "1.4",
                    width: "100%",
                    maxHeight: "3vh",
                    ml: 1,
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
        </Box>
      )}
    </Box>
  );
};

export default LabelCustomTextarea;
