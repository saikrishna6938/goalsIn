import React, { useState } from "react";
import { Menu, MenuItem, Box, styled } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Themecolors, fonts } from "api/Colors";

interface DropDownProps<T> {
  label?: string;
  options: T[];
  onChange?: (value: T | number) => void;
  renderOption?: (option: T) => React.ReactNode;
  padding?: string;
  value?: T | number | null;
  height?: string | number;
  bgcolor?: string;
}

const StyledDropDownButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== "height" && prop !== "bgcolor",
})<{ height?: string | number; bgcolor?: string }>(({ height, bgcolor }) => ({
  cursor: "pointer",
  border: `1px solid #cfd8dc`,
  backgroundColor: bgcolor || Themecolors.Button_bg3,
  color: Themecolors.Button2,
  borderRadius: 2,
  fontSize: "0.8rem",
  fontFamily: fonts.inter,
  height: height || "1.5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "4px 8px",
  lineHeight: 1,
  gap: "4px",
  textTransform: "none",
  "&:hover": {
    backgroundImage: Themecolors.B_hv3,
    backgroundColor: Themecolors.Button_bg3,
    borderColor: Themecolors.Button2,
    color: Themecolors.Button2,
    opacity: 0.9,
  },
  "&:active": {
    backgroundColor: Themecolors.Button_bg3,
    border: `1px solid ${Themecolors.Button_bg3}`,
    color: Themecolors.Button2,
  },
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}));

const CustomDropDown = <T extends {}>({
  label,
  options = [],
  onChange = (newValue: T) => {},
  renderOption = (option: T) => <>{JSON.stringify(option)}</>,
  padding = "0.3em",
  value = null,
  height,
  bgcolor = Themecolors.Button_bg3,
}: DropDownProps<T>) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOption, setSelectedOption] = useState<T | any>(value);

  React.useEffect(() => {
    setSelectedOption(value);
  }, [value]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (event: React.MouseEvent<HTMLElement>, option: T) => {
    setSelectedOption(option);
    onChange(option);
    handleClose();
  };

  const handleAllOptionClick = (event: React.MouseEvent<HTMLElement>) => {
    setSelectedOption(-1);
    onChange(-1);
    handleClose();
  };

  const renderSelectedOption = () => {
    if (selectedOption === -1) {
      return "All";
    }
    if (!selectedOption) {
      return label || "Select an option";
    }
    return renderOption(selectedOption);
  };

  const optionsWithAll = [
    { label: "All", value: -1 },
    ...options.map((option) => ({
      label: renderOption(option),
      value: option,
    })),
  ];

  return (
    <Box sx={{ padding: padding }}>
      <StyledDropDownButton
        onClick={handleClick}
        height={height}
        bgcolor={bgcolor}
      >
        {renderSelectedOption()}
        <ArrowDropDownIcon fontSize="small" />
      </StyledDropDownButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            transform: "translateY(-12px)",
            minWidth: "200px",
            opacity: 1,
            transition:
              "opacity 286ms cubic-bezier(0.4, 0, 0.2, 1), transform 190ms cubic-bezier(0.4, 0, 0.2, 1)",
          },
        }}
      >
        {optionsWithAll.map((option: any, index) => (
          <MenuItem
            key={index}
            sx={{
              backgroundColor: "transparent !important",
              "&:hover": {
                backgroundColor: "#f5f5f5 !important",
              },
              "&.Mui-selected": {
                backgroundColor: "transparent !important",
              },
            }}
            onClick={
              option.value === -1
                ? handleAllOptionClick
                : (event) => handleChange(event, option.value)
            }
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default CustomDropDown;
