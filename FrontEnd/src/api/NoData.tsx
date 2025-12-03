import React from "react";
import { Box, Typography } from "@mui/material";

interface EmptyStateProps {
  icon?: any;
  title: string;
  subtitle?: string;
  iconSize?: number;
  titleSize?: number;
  subtitleSize?: number;
}

const NoData: React.FC<EmptyStateProps> = ({
  icon: IconComponent,
  title,
  subtitle,
  iconSize,
  titleSize,
  subtitleSize,
}) => {
  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: (t) => t.palette.text.secondary,
        textAlign: "center",
        gap: 1,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 1.5 }}>
        {IconComponent && (
          <IconComponent
            sx={{
              fontSize: iconSize || 30,
              opacity: 0.6,
            }}
          />
        )}

        <Typography
          fontWeight={600}
          sx={{
            fontSize: titleSize || 20,
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            color="text.secondary"
            sx={{
              fontSize: subtitleSize || 15,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default NoData;
