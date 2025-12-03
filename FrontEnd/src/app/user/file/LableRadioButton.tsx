import React, { useState, useRef, useEffect } from "react";
import { FieldProps } from "formik";
import {
  Box,
  Typography,
  IconButton,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  ClickAwayListener,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

type Option = {
  id: string;
  name: string;
};

type RadioButtonProps = FieldProps & {
  label: string;
  options: Option[];
  handleChange?: (args: { name: string; value: string }) => void;
};

const LabelRadioButton: React.FC<RadioButtonProps> = ({
  field,
  form: { touched, errors, setFieldValue, values },
  label,
  options,
  handleChange = () => {},
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState<string>(field.value || "");
  const isDisabled = values?.[`${field.name}_disabled`];
  const hasError = touched?.[field.name] && Boolean(errors?.[field.name]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempValue(field.value || "");
  }, [field.value]);

  useEffect(() => {
    const handleCloseEvent = () => {
      if (isEditing) {
        saveAndClose();
      }
    };

    window.addEventListener("close-other-fields", handleCloseEvent);
    return () => {
      window.removeEventListener("close-other-fields", handleCloseEvent);
    };
  }, [isEditing]);

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setTempValue(value);
  };

  const saveAndClose = () => {
    setFieldValue(field.name, tempValue);
    handleChange({ name: field.name, value: tempValue });
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setTempValue(field.value || "");
    setIsEditing(false);
  };

  const handleEditClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!isDisabled) {
      window.dispatchEvent(new CustomEvent("close-other-fields"));
      setIsEditing(true);
    }
  };

  const handleClickAway = () => {
    if (isEditing) {
      saveAndClose();
    }
  };

  const getSelectedLabel = () => {
    const selectedOption = options.find(
      (option) => option.name === field.value
    );
    return selectedOption ? selectedOption.name : "NOT SET";
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box
        ref={containerRef}
        sx={{
          borderBottom: isEditing ? "" : "1px solid #ccc",
          width: "100%",
          position: "relative",
        }}
      >
        {isEditing ? (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
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
                }}
              >
                {label}
              </Typography>
              <IconButton size="small" onClick={cancelEdit}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={tempValue}
                onChange={handleRadioChange}
                style={{ flexDirection: "row", flexWrap: "wrap" }}
              >
                {options.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    value={option.name}
                    control={<Radio />}
                    label={option.name}
                    sx={{ mr: 2, mb: 1 }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              minWidth: 0,
              height: "3vh",
              cursor: !isDisabled ? "pointer" : "default",
            }}
            onClick={handleEditClick}
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
                ml: 2,
                minWidth: 0,
                flex: 1,
                position: "relative",
                "&:hover .edit-icon": {
                  opacity: !isDisabled ? 1 : 0,
                },
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
                {getSelectedLabel()}
              </Typography>

              {!isDisabled && !isEditing && (
                <IconButton
                  size="small"
                  className="edit-icon"
                  sx={{
                    position: "absolute",
                    right: 0,
                    opacity: 0,
                    transition: "opacity 0.2s",
                    "&:hover": { opacity: 1 },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick();
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default LabelRadioButton;
