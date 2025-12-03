import React from "react";
import { Box, Typography } from "@mui/material";

type PanelProps = {
  children: React.ReactNode;
  padding?: string;
};

const Panel: React.FC<PanelProps> = ({ children, padding = "16px" }) => {
  return (
    <Box
      sx={{
        padding: padding,
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      {children}
    </Box>
  );
};

export default Panel;
