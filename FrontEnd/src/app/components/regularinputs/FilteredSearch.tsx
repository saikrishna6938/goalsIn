// app/components/FilteredSearch.tsx
import React from "react";
import { TextField, IconButton, useTheme, useMediaQuery } from "@mui/material";
import { Search } from "@mui/icons-material";
import { Themecolors } from "api/Colors";

interface FilteredSearchProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  fullWidth?: boolean;
}

const FilteredSearch: React.FC<FilteredSearchProps> = ({
  value,
  onChange,
  placeholder = "Search",
  fullWidth = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <TextField
      variant="filled"
      label={placeholder}
      value={value}
      onChange={onChange}
      fullWidth={fullWidth || isMobile}
      InputProps={{
        endAdornment: (
          <IconButton sx={{ color: Themecolors.Dg_Icon2 }}>
            <Search />
          </IconButton>
        ),
      }}
      InputLabelProps={{
        sx: {
          color: Themecolors.Button2,
          transform: "translate(6px, 10px)",
          transition:
            "transform 0.2s ease-in-out, background-color 0.3s ease-in-out",
          "&.Mui-focused": {
            color: Themecolors.Button2,
          },
          "&.MuiInputLabel-shrink": {
            transform: "translate(5px, 0)",
            fontSize: "0.8em",
          },
        },
      }}
      sx={{
        width: fullWidth || isMobile ? "100%" : 250,
        height: "100%",
        backgroundColor: Themecolors.Button_bg4,
        "& .MuiInputBase-input": {
          height: 5,
        },
        "& .MuiInputBase-root": {
          backgroundColor: Themecolors.Button_bg3,
          display: "flex",
          alignItems: "center",
          height: "100%",
        },
        "&:hover .MuiInputBase-root": {
          backgroundImage: Themecolors.B_hv3,
        },
      }}
    />
  );
};

export default FilteredSearch;
