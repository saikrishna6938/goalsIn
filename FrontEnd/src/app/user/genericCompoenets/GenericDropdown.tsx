import React, { useEffect, useState } from "react";
import { Menu, MenuItem, Box, styled, Button, Typography } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import {
  ApprovalTwoTone,
  Business,
  Group,
  LocationCity,
  LocationOn,
  PercentTwoTone,
  Person,
  Person2,
  Public,
  Settings,
  Work,
  WorkHistory,
  WrongLocation,
} from "@mui/icons-material";
import { Themecolors, fonts } from "api/Colors";

interface StyledActionButtonProps {
  height?: string;
  border?: string;
  backgroundColor?: string;
}

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "height",
})<StyledActionButtonProps>(({ theme, height, border, backgroundColor }) => ({
  border: `1px solid #cfd8dc`,
  height: height || "1.5rem",
  marginRight: "2px",
  backgroundColor: backgroundColor || Themecolors.Button_bg3,
  color: Themecolors.Button2,
  padding: "1px 8px",
  fontSize: "0.7rem",
  lineHeight: "0px",
  fontFamily: fonts?.inter || "Inter, sans-serif",
  borderRadius: 3,
  textTransform: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
  "& .MuiButton-startIcon": {
    marginRight: "4px",
  },
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
}));

interface DropDownProps<T> {
  label?: string;
  options: T[];
  onChange?: (value: string) => void;
  renderOption?: (option: T) => React.ReactNode;
  padding?: string;
  selectedFontSize?: any;
  backgroundColor?: string | any;
  headerLabel?: string;
}

const GenericDropDown = <T extends {}>({
  label,
  options = [],
  onChange = (newValue: any) => {},
  renderOption = (option: T) => <>{JSON.stringify(option)}</>,
  padding = "0.3em",
  backgroundColor = Themecolors.Button_bg3,
  headerLabel,
}: DropDownProps<T>) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOption, setSelectedOption] = useState<T | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (event: React.MouseEvent<HTMLElement>, option: T) => {
    if ("value" in option) {
      const value = (option as any).value?.toString();
      if (value) {
        setSelectedOption(option);
        onChange(value);
      } else {
        console.error("Role option has no valid value");
      }
    } else if ("entityId" in option) {
      const entityId = (option as any).entityId?.toString();
      if (entityId) {
        setSelectedOption(option);
        onChange(entityId);
      } else {
        console.error("Entity option has no valid entityId");
      }
    } else {
      console.error("Option does not have expected properties");
    }

    handleClose();
  };

  const renderSelectedOption = () => {
    if (label) {
      return label;
    } else if (selectedOption) {
      return renderOption(selectedOption);
    } else {
      return "Select an Option";
    }
  };

  const getIconForOption = (options: T) => {
    const optionKeys = Object.keys(options as any);
    let icon = <Settings />;

    optionKeys.forEach((keys) => {
      const value = (options as any)[keys];
      if (typeof value === "string") {
        if (value.toLowerCase().includes("admin")) {
          icon = <AdminPanelSettingsIcon />;
        } else if (value.toLocaleLowerCase().includes("stud")) {
          icon = <Group />;
        } else if (value.toLowerCase().includes("job")) {
          icon = <WorkHistory />;
        } else if (value.toLowerCase().includes("location")) {
          icon = <LocationOnIcon />;
        } else if (value.toLocaleLowerCase().includes("agent")) {
          icon = <LocationOnIcon />;
        }
      }
    });

    return icon;
  };

  return (
    <Box sx={{ padding: padding }}>
      {headerLabel && (
        <Typography
          sx={{ fontSize: "0.7rem", ml: 0.2, mb: 0.1, color: "black" }}
        >
          {headerLabel}
        </Typography>
      )}
      <StyledButton
        onClick={handleClick}
        endIcon={<ArrowDropDownIcon />}
        backgroundColor={backgroundColor || Themecolors.Button2}
      >
        {renderSelectedOption()}
      </StyledButton>

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
        {options.map((option, index) => (
          <MenuItem
            sx={{
              backgroundColor: "transparent !important",
              "&:hover": {
                backgroundColor: "#f5f5f5 !important",
              },
              "&.Mui-selected": {
                backgroundColor: "transparent !important",
              },
              display: "flex",
              alignItems: "center",
            }}
            key={index}
            onClick={(event) => handleChange(event, option)}
          >
            <Box sx={{ marginRight: "8px" }}>
              <>{getIconForOption(option)}</>
            </Box>
            {renderOption(option)}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default GenericDropDown;
