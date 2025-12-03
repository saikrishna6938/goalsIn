import React from "react";
import {
  TextField,
  Select,
  MenuItem,
  Autocomplete,
  Typography,
  IconButton,
  Box,
} from "@mui/material";

interface DynamicFieldProps {
  item: any;
  values: any;
  errors: any;
  handleChange: (value: any) => void;
  getSelections?: (fieldId: string) => { value: string; label: string }[];
}

const DynamicField: React.FC<DynamicFieldProps> = ({
  item,
  values,
  errors,
  handleChange,
  getSelections,
}) => {
  // console.log("error====", item);
  const handleValueChange = (value: any) => {
    handleChange(value);
  };

  switch (item.fieldType) {
    case 1: // Autocomplete
      return (
        <>
          <Box>
            <Typography
              variant="caption"
              align="left"
              gutterBottom
              style={{ fontSize: "0.60rem", color: "#6b6b6b" }}
            >
              {item.tagDescription}
            </Typography>{" "}
            <Autocomplete
              options={getSelections(item.order)}
              getOptionLabel={(option) => option.label}
              value={values[item.order]}
              onChange={(_, newValue) => {
                const value = newValue?.value || "";
                handleValueChange(value);
              }}
              disableClearable
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select User"
                  error={Boolean(errors)}
                  helperText={errors || ""}
                  fullWidth
                />
              )}
            />
          </Box>
        </>
      );
    case 2: // Custom-styled TextField
      return (
        <>
          <Box>
            <Typography
              variant="caption"
              align="left"
              gutterBottom
              style={{ fontSize: "0.60rem", color: "#6b6b6b" }}
            >
              {item.tagDescription}
            </Typography>
            <TextField
              variant="filled"
              label={"Enter value"}
              value={values[item.order]}
              onChange={(e) => {
                handleValueChange(e.target.value);
              }}
              error={Boolean(errors[item.order])}
              fullWidth
            />
          </Box>
        </>
      );
    case 3: // Numeric Box
      return (
        <>
          <Box>
            <Typography
              variant="caption"
              align="left"
              style={{
                fontSize: "0.60rem",
                color: "#6b6b6b",
                position: "relative",
                bottom: "5px",
              }}
            >
              {item.tagDescription}
            </Typography>
            <TextField
              type="number"
              label={"Enter value"}
              value={values[item.order]}
              onChange={(e) => handleValueChange(e.target.value)}
              error={Boolean(errors[item.order])}
              fullWidth
              inputProps={{ min: 0, step: "0.5" }}
            />
          </Box>
        </>
      );

    default:
      return null;
  }
};

export default DynamicField;
