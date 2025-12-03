import { styled } from "@mui/material";
import { Box, useTheme } from "@mui/material";
import { Themecolors } from "api/Colors";

const convertHexToRGB = (hex) => {
  if (hex.length === 4) {
    hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
};

export const HeaderBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "0px, 16px",
  // backgroundColor:
  //   theme.palette.mode === "dark" ? convertHexToRGB("#121212") : "#f5f5f5",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  color: Themecolors.Dg_bg2,
  backgroundColor: "#fafafa",
  "&:hover": {
    backgroundImage: Themecolors.H_hv,
  },
  height: "60px",
}));

export const HeaderStyled = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "6px",
  backgroundColor: theme.palette.background.default, // using primary color from the theme
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1.5)",
}));

export const ProfileHeaderStyle = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "5px",
  backgroundColor:
    theme.palette.mode === "dark" ? convertHexToRGB("#1E1E1E") : "#efefef",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
}));

export const InfoBox = styled(Box)({
  marginLeft: "1px",
});

export const accent = "rgb(17, 82, 147)";
