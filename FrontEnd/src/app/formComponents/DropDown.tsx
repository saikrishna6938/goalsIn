import React, { useState } from "react";
import { FieldProps } from "formik";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import { Themecolors } from "api/Colors";
import { sharedInputStyles } from "app/components/regularinputs/InputStyles";

type Option = {
  id: number;
  name: string;
};

type DropdownProps = FieldProps & {
  label: string;
  options: Option[];
  handleChange?: Function;
};

const Dropdown: React.FC<DropdownProps> = ({
  field,
  form: { touched, errors, setFieldValue },
  label,
  options,
  handleChange = () => {},
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isMenuOpenUpwards =
    anchorEl &&
    window.innerHeight - anchorEl.getBoundingClientRect().bottom < 200;

  const hasError = touched?.[field.name] && Boolean(errors?.[field.name]);

  return (
    <FormControl
      variant="outlined"
      fullWidth
      error={hasError}
      sx={{
        ...sharedInputStyles.root,
        "& .MuiOutlinedInput-root": {
          ...sharedInputStyles.root["& .MuiOutlinedInput-root"],
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
    >
      <Select
        {...field}
        value={(() => {
          const match = options.find(
            (f) =>
              f.id.toString() === field.value?.toString() ||
              f.name === field.value
          );
          return match ? match.id : "";
        })()}
        onChange={(event) => {
          const value = event.target.value;
          setFieldValue(field.name, value);
          const valueName = options.find((f) => f.id === value);
          handleChange({ name: field.name, value: valueName?.name });
        }}
        onOpen={handleOpen}
        onClose={handleClose}
        displayEmpty
        sx={sharedInputStyles.inputProps}
        MenuProps={{
          PaperProps: {
            style: {
              boxShadow: "none",
              opacity: 2,
              maxHeight: "250px",
              backgroundColor: "#fff",
              border: "1px solid #f5f5f5",
              marginTop: isMenuOpenUpwards ? "-5px" : "5px",
            },
          },
          anchorOrigin: {
            vertical: isMenuOpenUpwards ? "top" : "bottom",
            horizontal: "left",
          },
          transformOrigin: {
            vertical: isMenuOpenUpwards ? "bottom" : "top",
            horizontal: "left",
          },
        }}
      >
        {options.map((option) => {
          return (
            <MenuItem key={option.id} value={option.id}>
              {option.name}
            </MenuItem>
          );
        })}
      </Select>
      {/* {touched[field.name] && errors[field.name] && (
        <div style={{ color: "red" }}>{errors[field.name] as any}</div>
      )} */}{" "}
    </FormControl>
  );
};

export default Dropdown;
