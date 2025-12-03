import React, { useState } from "react";
import { FieldProps } from "formik";
import { Box, Typography, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import SelectionDropdown from "app/components/regularinputs/SelectionDropdown";

type Option = {
  id: number;
  name: string;
};

type DropdownProps = FieldProps & {
  label: string;
  options: Option[];
  handleChange?: (args: { name: string; value: string }) => void;
};

const LabelDropdown: React.FC<DropdownProps> = ({
  field,
  form: { touched, errors, setFieldValue, values },
  label,
  options,
  handleChange = () => {},
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const isDisabled = values?.[`${field.name}_disabled`];
  const hasError = touched?.[field.name] && Boolean(errors?.[field.name]);

  const handleSelectChange = (value: number) => {
    setFieldValue(field.name, value);
    const valueName = options.find((f) => f.id === value)?.name || "";
    handleChange({ name: field.name, value: valueName });
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleRowClick = () => {
    if (!isDisabled && !isEditing) {
      setIsEditing(true);
    }
  };

  const getSelectedLabel = () => {
    const selectedOption = options.find((option) => option.id === field.value);
    return selectedOption ? selectedOption.name : "NOT SET";
  };

  return (
    <Box
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
          <SelectionDropdown
            label={"Select"}
            options={options}
            value={field.value}
            onChange={handleSelectChange}
            optionValueKey="id"
            optionLabelKey="name"
            disabled={isDisabled}
            fullWidth
          />
        </>
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
              ml: 2,
              minWidth: 0,
              flex: 1,
              position: "relative",
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
            {!isDisabled && (
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

export default LabelDropdown;
