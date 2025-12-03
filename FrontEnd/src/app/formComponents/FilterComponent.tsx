import React from "react";
import { Button, Menu, MenuItem, IconButton } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Themecolors } from "api/Colors";

interface FilterComponentProps {
  categories: string[];
  onFilterChange: (selectedCategory: string) => void;
  onButtonClick: () => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  categories,
  onFilterChange,
  onButtonClick,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("");

  const handleButtonClick = () => {
    onButtonClick();
  };

  const handleIconClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    event.stopPropagation();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (value: string) => {
    setSelectedCategory(value);
    onFilterChange(value); // Inform parent about the filter change
    handleClose();
  };

  return (
    <div>
      <Button
        endIcon={
          <IconButton
            size="small"
            onClick={handleIconClick}
            sx={{
              color: Themecolors.Button2,
              "&:hover": {
                backgroundImage: Themecolors.Button_bg4,
                borderColor: Themecolors.Button2,
              },
            }}
          >
            <ArrowDropDownIcon />
          </IconButton>
        }
        sx={{
          mr: "5px",
          color: Themecolors.Button2,
          backgroundColor: Themecolors.Button_bg3,
          "&:hover": {
            backgroundImage: Themecolors.B_hv3,
            borderColor: Themecolors.Button2,
            backgroundColor: Themecolors.Button_bg3,
          },
          height: "37px",
        }}
        variant="outlined"
        onClick={handleButtonClick}
      >
        {selectedCategory || "Select Category"}
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem value="" onClick={() => handleMenuItemClick("")}>
          <em>None</em>
        </MenuItem>
        {categories.map((category) => (
          <MenuItem
            key={category}
            onClick={() => handleMenuItemClick(category)}
          >
            {category}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default FilterComponent;
