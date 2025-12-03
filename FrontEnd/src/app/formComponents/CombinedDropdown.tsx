import React, { useState, useEffect } from "react";
import { Autocomplete, TextField, IconButton } from "@mui/material";
import { FieldProps } from "formik";
import { Themecolors } from "api/Colors";
import ClearIcon from "@mui/icons-material/Clear";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
interface Option {
  id: number;
  name: string;
}

interface CombinedDropdownProps extends FieldProps {
  label: string;
  options: Option[];
}

const CombinedDropdown: React.FC<CombinedDropdownProps> = ({
  field,
  form,
  options,
}) => {
  const { setFieldValue, touched, errors } = form;
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const selectedOption = options.find((option) => option.id === field.value);
    setInputValue(selectedOption ? selectedOption.name : "");
  }, [field.value, options]);

  const handleClear = () => {
    setFieldValue(field.name, "");
    setInputValue("");
  };

  const handleOptionChange = (_: any, newValue: string | Option | null) => {
    if (typeof newValue === "string") {
      setFieldValue(field.name, newValue);
      setInputValue(newValue);
    } else if (newValue) {
      setFieldValue(field.name, newValue.id);
      setInputValue(newValue.name);
    } else {
      handleClear();
    }
  };

  return (
    <Autocomplete
      freeSolo
      options={options}
      disableClearable
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.name
      }
      value={inputValue || ""}
      onChange={handleOptionChange}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          fullWidth
          onBlur={() => {
            field.onBlur(field.name);
            setIsFocused(false);
          }}
          onFocus={() => setIsFocused(true)}
          error={touched[field.name] && Boolean(errors[field.name])}
          helperText={
            touched[field.name] && errors[field.name]
              ? String(errors[field.name])
              : ""
          }
          InputProps={{
            ...params.InputProps,
            endAdornment:
              inputValue && isFocused ? (
                <IconButton onClick={handleClear} size="small">
                  <ClearIcon sx={{ height: "0.8em", width: "0.8em" }} />
                </IconButton>
              ) : (
                <IconButton size="small">
                  <ArrowDropDownIcon />
                </IconButton>
              ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              padding: "2px",
              borderRadius: "4px",
              "& fieldset": { borderColor: "#bdbdbd" },
              "&:hover fieldset, &.Mui-focused fieldset": {
                borderColor: Themecolors.InputBorder2,
              },
            },
          }}
        />
      )}
      ListboxProps={{
        style: {
          maxHeight: "250px",
          overflowY: "auto",
          borderRadius: "5px",
        },
      }}
    />
  );
};

export default CombinedDropdown;
