import React from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  ListItemText,
  Box,
  Typography,
} from "@mui/material";
import { Themecolors } from "api/Colors";
import { sharedInputStyles } from "./InputStyles";

interface SelectionDropdownProps {
  label: string;
  options: any[];
  value: any;
  onChange: (value: any) => void;
  optionValueKey: string;
  optionLabelKey: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  rightSideIds?: boolean;
}

const SelectionDropdown: React.FC<SelectionDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  optionValueKey,
  optionLabelKey,
  disabled = false,
  required = false,
  fullWidth = true,
  loading = false,
  rightSideIds = false,
}) => {
  const selectedOption =
    options.find((option) => option[optionValueKey] === value) || null;

  return (
    <Box sx={{ py: 1 }}>
      <Autocomplete
        fullWidth={fullWidth}
        options={options}
        getOptionLabel={(option) => option[optionLabelKey] ?? ""}
        value={selectedOption}
        onChange={(_, newValue) => {
          const selected = newValue ? newValue[optionValueKey] : null;
          onChange(selected);
        }}
        isOptionEqualToValue={(option, val) =>
          option[optionValueKey] === val?.[optionValueKey]
        }
        disabled={disabled}
        loading={loading}
        onInputChange={(_, inputValue, reason) => {
          if (inputValue === "" && reason === "input") {
            onChange(null);
          }
        }}
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 2,
              py: 1,
            }}
          >
            <ListItemText primary={option[optionLabelKey]} />
            {rightSideIds && (
              <Typography variant="body2" color="text.secondary">
                {option[optionValueKey]}
              </Typography>
            )}
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            variant="outlined"
            required={required}
            sx={{
              ...sharedInputStyles.root,
              "& .MuiOutlinedInput-root .MuiInputBase-input": {
                paddingTop: 0,
                paddingBottom: "2px",
              },
            }}
            InputProps={{
              ...params.InputProps,
              sx: sharedInputStyles.inputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={16} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            InputLabelProps={{
              sx: {
                ...sharedInputStyles.labelProps,
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
              },
            }}
          />
        )}
      />
    </Box>
  );
};

export default SelectionDropdown;
