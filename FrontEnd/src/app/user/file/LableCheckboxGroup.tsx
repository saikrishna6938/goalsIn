import React, { useState, useRef, useEffect } from "react";
import { FieldProps } from "formik";
import {
  Box,
  Typography,
  IconButton,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  ClickAwayListener,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

type Option = {
  id: string;
  name: string;
};

type CheckboxGroupProps = FieldProps & {
  label: string;
  options: Option[];
  handleChange?: (args: { name: string; value: string[] }) => void;
};

const LabelCheckboxGroup: React.FC<CheckboxGroupProps> = ({
  field,
  form: { touched, errors, setFieldValue, values },
  label,
  options,
  handleChange = () => {},
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState<string[]>(field.value || []);
  const isDisabled = values?.[`${field.name}_disabled`];
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempValue(field.value || []);
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

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const checked = event.target.checked;

    const newValue = checked
      ? [...tempValue, value]
      : tempValue.filter((item) => item !== value);

    setTempValue(newValue);
  };

  const saveAndClose = () => {
    setFieldValue(field.name, tempValue);
    handleChange({ name: field.name, value: tempValue });
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setTempValue(field.value || []);
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

  const formatSelectedValues = (values: string[]) => {
    if (!values?.length) return "NOT SET";
    return values.join(", ");
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box
        ref={containerRef}
        sx={{
          borderBottom: isEditing ? "" : "1px solid #ccc",
          width: "100%",
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
                height: "3vh",
                mb: 1,
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
              <FormGroup
                sx={{ flexDirection: "row", flexWrap: "wrap", gap: 1 }}
              >
                {options.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    control={
                      <Checkbox
                        value={option.name}
                        onChange={handleCheckboxChange}
                        checked={tempValue.includes(option.name)}
                      />
                    }
                    label={option.name}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </>
        ) : (
          <Box
            onClick={handleEditClick}
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
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
                pr: 1,
              }}
            >
              {label}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                ml: 1,
                minWidth: 0,
                position: "relative",
                height: "100%",
              }}
            >
              <Typography
                variant="body2"
                component="span"
                sx={{
                  mr: 0.5,
                  lineHeight: "3vh",
                  flexShrink: 0,
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
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  ref={textRef}
                  sx={{
                    color: field.value?.length ? "text.primary" : "#aaa",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontStyle: !field.value?.length ? "italic" : "normal",
                    lineHeight: "1.4",
                    width: "calc(100% - 28px)",
                    ml: 1,
                  }}
                >
                  {formatSelectedValues(field.value || [])}
                </Typography>

                {!isDisabled && (
                  <Box
                    className="edit-icon"
                    sx={{
                      position: "absolute",
                      right: 0,
                      opacity: 0,
                      transition: "opacity 0.2s",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick();
                      }}
                      sx={{
                        height: "24px",
                        width: "24px",
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default LabelCheckboxGroup;
