import React, { ReactNode } from "react";
import Button, { ButtonProps } from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { fonts, Themecolors } from "api/Colors";

interface StyledActionButtonProps extends ButtonProps {
  label?: string;
  startIcon?: ReactNode;
  type?: "button" | "submit" | "reset";
  height?: string | number;
  border?: string;
  backgroundColor?: string | any;
  iconPosition?: "start" | "end";
}

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "height",
})<StyledActionButtonProps>(({ theme, height, border, backgroundColor }) => ({
  border: border || `1px solid #cfd8dc`,
  height: height || "1.7rem",
  marginRight: "2px",
  backgroundColor: backgroundColor || Themecolors.Button_bg3,
  color: Themecolors.Button2,
  padding: "4px 8px",
  fontSize: "0.8rem",
  lineHeight: "0px",
  fontFamily: fonts.inter,
  borderRadius: 2,
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

interface StyledActionButtonProps extends ButtonProps {
  label?: string;
  startIcon?: ReactNode;
  type?: "button" | "submit" | "reset";
}

const PrimaryButton: React.FC<StyledActionButtonProps> = ({
  label,
  startIcon,
  type = "button",
  iconPosition = "start",
  ...props
}) => {
  return (
    <StyledButton
      variant="outlined"
      startIcon={iconPosition === "start" ? startIcon : undefined}
      endIcon={iconPosition === "end" ? startIcon : undefined}
      type={type}
      {...props}
    >
      {label}
    </StyledButton>
  );
};

export default PrimaryButton;
