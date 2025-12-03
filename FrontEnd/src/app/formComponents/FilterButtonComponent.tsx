import React from "react";
import { Button } from "@mui/material";
import { Themecolors } from "api/Colors";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";

interface FilterButtonComponentProps {
  categories: string[];
  onButtonClick: (selectedCategory: string) => void;
  getIcon?: (category: string) => React.ReactNode;
}

const FilterButtonComponentProps: React.FC<FilterButtonComponentProps> = ({
  categories,
  onButtonClick,
  getIcon,
}) => {
  const handleCategoryClick = (category: string) => {
    onButtonClick(category);
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "flex-end",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          gap: "5px",
          marginRight: "5px",
        }}
      >
        {categories.map((category) => (
          <PrimaryButton
            startIcon={getIcon ? getIcon(category) : ""}
            key={category}
            label={category}
            height="1.6rem"
            onClick={() => handleCategoryClick(category)}
          />
        ))}
      </div>
    </div>
  );
};

export default FilterButtonComponentProps;
