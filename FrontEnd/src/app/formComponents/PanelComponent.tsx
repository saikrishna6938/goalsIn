import React from "react";
import { Box, FormControl } from "@mui/material";
import HeaderTypography from "./HeaderTypography";

interface PanelComponentProps {
  title: string;
  children: React.ReactNode;
}
const PanelComponent: React.FC<PanelComponentProps> = ({ title, children }) => {
  return (
    <FormControl component="fieldset" fullWidth>
      {/* <HeaderTypography title={title} borderRadius={"0px"} margin={"0px"} /> */}
      <Box width={"100%"}>{children}</Box>
    </FormControl>
  );
};

export default PanelComponent;
