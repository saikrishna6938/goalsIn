import React from "react";
import { Box } from "@mui/material";
import { Themecolors } from "api/Colors";

const CustomDatePicker = ({ field, form, ...props }) => {
  return (
    <Box
      sx={{
        display: "inline-flex",
        flexDirection: "column",
        width: "100%",
        minWidth: "220px",
        maxWidth: "220px",
        border:
          form?.touched?.[field.name] && form?.errors?.[field.name]
            ? "2px solid #f44336"
            : "1px solid #bdbdbd",
        borderRadius: "4px",
        overflow: "hidden",
        "&:hover": {
          borderColor:
            form?.touched?.[field.name] && form?.errors?.[field.name]
              ? "#f44336"
              : Themecolors.InputBorder2,
        },
        "&:focus-within": {
          borderColor:
            form?.touched?.[field.name] && form?.errors?.[field.name]
              ? "#f44336"
              : Themecolors.InputBorder2,
        },
      }}
    >
      <input
        type="date"
        {...field}
        {...props}
        onChange={(e) => {
          const value = e.target.value;
          form.setFieldValue(field.name, value);
        }}
        style={{
          width: "100%",
          padding: "10px 12px",
          fontFamily: "Inter, sans-serif",
          border: "none",
          outline: "none",
          color: "black",
          backgroundColor: "transparent",
          boxSizing: "border-box",
        }}
      />
    </Box>
  );
};

export default CustomDatePicker;
