import React from "react";
import { Button as MuiButton } from "@mui/material";
import { styled } from "@mui/system";
import { Themecolors } from "api/Colors";

interface CustomButtonProps {
  label: string;
  btnType?: "success" | "error" | "warning" | "info" | "default" | "customGray";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  height?: string;
}

const buttonColors = {
  success: { background: "#4CAF50", color: "white" },
  error: { background: "#F44336", color: "white" },
  warning: { background: "#ffa726", color: "black" },
  info: { background: "#ffa726", color: "white" },
  default: { background: "#2196F3", color: "white" },
  customGray: {
    background: "white",
    color: "black",
    border: "1px solid white",
    "&:hover": {
      backgroundImage: Themecolors.B_hv3,
    },
  },
};

const StyledButton = styled(MuiButton)<{ btnType?: string; height?: string }>(
  ({ btnType, height }) => {
    const style =
      buttonColors[btnType as keyof typeof buttonColors] ||
      buttonColors.default;

    return {
      backgroundColor:
        buttonColors[btnType as keyof typeof buttonColors]?.background ||
        buttonColors.default.background,
      color:
        buttonColors[btnType as keyof typeof buttonColors]?.color ||
        buttonColors.default.color,
      borderRadius: "6px",
      textTransform: "none",
      fontSize: "0.83rem",
      height: height || "2.2em",
      width: "auto",
      "&:hover": {
        opacity: 0.8,
        backgroundColor:
          buttonColors[btnType as keyof typeof buttonColors]?.background ||
          buttonColors.default.background,
        color:
          buttonColors[btnType as keyof typeof buttonColors]?.color ||
          buttonColors.default.color,
        ...(style["&:hover"] || {}),
      },
    };
  }
);

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  btnType = "default",
  onClick,
  type = "button",
  height,
  ...props
}) => {
  return (
    <StyledButton
      btnType={btnType}
      onClick={onClick}
      type={type}
      height={height}
      {...props}
    >
      {label}
    </StyledButton>
  );
};

export default CustomButton;
