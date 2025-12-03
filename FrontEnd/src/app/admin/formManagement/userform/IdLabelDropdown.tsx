import React, { useState, useRef, useEffect } from "react";
import {
  TextField,
  Paper,
  List,
  ListItem,
  Typography,
  Box,
  ClickAwayListener,
  InputAdornment,
  IconButton,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClearIcon from "@mui/icons-material/Close";

interface OptionType {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  options: OptionType[];
  label: string;
  value: OptionType | null;
  onChange: (value: OptionType | null) => void;
  placeholder?: string;
  fullWidth?: boolean;
}

const IdLabelDropdown: React.FC<CustomDropdownProps> = ({
  options,
  label,
  value,
  onChange,
  placeholder = "",
  fullWidth = true,
}) => {
  const [inputValue, setInputValue] = useState(value?.label || "");
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setInputValue(value?.label || "");
  }, [value]);

  const handleSelect = (option: OptionType) => {
    setInputValue(option.label);
    onChange(option);
    setOpen(false);
  };

  const handleClear = () => {
    setInputValue("");
    onChange(null);
    setOpen(false);
  };

  const filteredOptions = inputValue
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase())
      )
    : options;

  const hasInputOrSelection = inputValue.trim() !== "" || value !== null;
  const showClear = isHovered && hasInputOrSelection;

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box
        ref={anchorRef}
        sx={{ position: "relative", width: fullWidth ? "100%" : "auto" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <TextField
          inputRef={inputRef}
          fullWidth={fullWidth}
          label={label}
          placeholder={placeholder}
          size="small"
          value={inputValue}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            const val = e.target.value;
            setInputValue(val);
            setOpen(true);
            if (value) onChange(null);
          }}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                {showClear ? (
                  <IconButton
                    onClick={handleClear}
                    size="small"
                    sx={{
                      p: "2px",
                      "&:hover": { backgroundColor: "transparent" },
                    }}
                  >
                    <ClearIcon sx={{ fontSize: "1.2rem" }} />
                  </IconButton>
                ) : (
                  <IconButton
                    onClick={() => {
                      setOpen(true);
                      inputRef.current?.focus();
                    }}
                    size="small"
                    sx={{
                      p: "2px",
                      "&:hover": { backgroundColor: "transparent" },
                    }}
                  >
                    <ArrowDropDownIcon sx={{ fontSize: "1.5rem" }} />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />

        {open && filteredOptions.length > 0 && (
          <Paper
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 10,
              maxHeight: 250,
              overflowY: "auto",
              boxShadow: 3,
              mt: 0.5,
              borderRadius: 1,
            }}
          >
            <List disablePadding>
              {filteredOptions.map((option) => (
                <ListItem
                  key={option.value}
                  button
                  onClick={() => handleSelect(option)}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    px: 2,
                    py: 1,
                  }}
                >
                  <Typography>{option.label}</Typography>
                  <Typography color="text.secondary">{option.value}</Typography>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default IdLabelDropdown;
