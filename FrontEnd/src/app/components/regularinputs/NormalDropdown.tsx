import React, { useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { sharedInputStyles } from "./InputStyles";
import { Themecolors } from "api/Colors";

interface NormalDropdownProps<T> {
  label?: string;
  options?: T[];
  value?: string | number | null;
  onChange: (value: string | number) => void;
  optionId?: keyof T;
  optionLabelKey?: keyof T;
  disabled?: boolean;
  fullWidth?: boolean;
}

function NormalDropdown<T extends Record<string, any>>({
  label,
  options,
  value,
  onChange,
  optionId,
  optionLabelKey,
  disabled = false,
  fullWidth = true,
}: NormalDropdownProps<T>) {
  const [open, setOpen] = useState(false);

  const handleChange = (event: SelectChangeEvent<any>) => {
    onChange(event.target.value);
  };

  return (
    <Box sx={{ py: 1 }}>
      <FormControl
        fullWidth={fullWidth}
        disabled={disabled}
        variant="outlined"
        sx={{
          ...sharedInputStyles.root,
          position: "relative",
          backgroundColor: "white",
        }}
      >
        <InputLabel
          shrink={open || !!value}
          sx={{
            ...sharedInputStyles.labelProps,
            top: "50%",
            transform: "translateY(-50%)",
            left: "14px",
            position: "absolute",
            pointerEvents: "none",
            transition: "all 0.2s ease",
            color: Themecolors.InputText_Color1,
            backgroundColor: "transparent",
            "&.MuiInputLabel-shrink": {
              top: "-8px",
              transform: "translateY(0) scale(0.65)",
              backgroundColor: "white",
              padding: "0 4px",
            },
          }}
        >
          {label}
        </InputLabel>

        <Select
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          value={value ?? ""}
          onChange={handleChange}
          displayEmpty
          sx={{
            "& .MuiSelect-select": {
              paddingTop: "10px",
              paddingBottom: "10px",
              color: Themecolors.InputText_Color1,
            },
          }}
          inputProps={{
            sx: {
              ...sharedInputStyles.inputProps,
              paddingTop: "10px",
              paddingBottom: "10px",
              color: Themecolors.InputText_Color1,
            },
          }}
        >
          {options.map((option, index) => (
            <MenuItem key={index} value={option[optionId]}>
              {option[optionLabelKey] as React.ReactNode}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export default NormalDropdown;
