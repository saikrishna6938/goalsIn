// HeaderTypography.tsx

import React, { ReactNode, useState } from "react";
import Typography from "@mui/material/Typography";
import styled from "@emotion/styled";
import { Box, IconButton, TextField, useTheme } from "@mui/material";
import { Search } from "@mui/icons-material";
import { Themecolors } from "api/Colors";

const StyledHeader = styled.div<HeaderTypographyProps>`
  background: ${(props) => props.background};
  padding: ${(props) => props.padding};
  margin: ${(props) => props.margin};
  border-radius: ${(props) => props.borderRadius};
  color: ${(props) => props.color};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); // subtle shadow for depth
  transition: box-shadow 0.3s ease-in-out; // smooth shadow transition on hover
  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); // deeper shadow on hover for interactive effect
  }
`;

interface HeaderTypographyProps {
  title?: string;
  variant?: any;
  background?: string;
  padding?: string | number;
  margin?: string | number;
  borderRadius?: string | number;
  color?: string;
  children?: ReactNode;
  searchEnabled?: boolean;
  onSearch?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchValue?: string;
  TextFieldWidth?: string | number;
}

const HeaderTypography: React.FC<HeaderTypographyProps> = ({
  title,
  variant = "h6",
  background = "",
  padding = "10px 10px", // More padding for a better visual separation
  margin = "0px",
  borderRadius = "0px", // Soft rounded corners for a modern look
  color = "white",
  children = <></>,
  searchEnabled,
  onSearch,
  searchValue,
  TextFieldWidth = "",
}) => {
  const { palette } = useTheme();

  return (
    <StyledHeader
      background={palette.background.default}
      padding={padding}
      margin={margin}
      borderRadius={borderRadius}
      color={palette.action.active}
    >
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems="center"
      >
        <Typography variant={"h6"} fontSize={"14px"} fontWeight={"bold"}>
          {title}
        </Typography>
        {children}
        <Box>
          {searchEnabled && (
            <TextField
              style={{ height: "30px", width: TextFieldWidth }}
              variant="filled"
              label="Search"
              value={searchValue}
              onChange={onSearch}
              InputProps={{
                endAdornment: (
                  <IconButton
                    sx={{
                      color: Themecolors.Dg_Icon2,
                      height: "25px",
                      width: "25px",
                    }}
                  >
                    <Search />
                  </IconButton>
                ),
              }}
              InputLabelProps={{
                sx: {
                  color: Themecolors.Button2,
                  "&.Mui-focused": {
                    color: Themecolors.Button2,
                  },
                },
              }}
              sx={{
                backgroundColor: Themecolors.Button_bg4,
                "& .MuiInputBase-input": {
                  height: 5,
                },
                "& .MuiInputBase-root": {
                  backgroundColor: Themecolors.Button_bg3,
                },
                "&:hover .MuiInputBase-root": {
                  backgroundImage: Themecolors.B_hv3,
                },
              }}
            />
          )}
        </Box>
      </Box>
    </StyledHeader>
  );
};

export default HeaderTypography;
