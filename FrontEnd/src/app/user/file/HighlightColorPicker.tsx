import React from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";

const DEFAULT_COLORS = [
  "#FFFF00", // Yellow
  "#FF0000", // Red
  "#00FF00", // Green
  "#00BFFF", // Blue
  "#FFA500", // Orange
  "#800080", // Purple
  "#000000", // Black
];

interface HighlightColorPickerProps {
  colors?: string[];
  selectedColor?: string;
  onSelectColor: (color: string | null) => void;
  size?: number;
}

const HighlightColorPicker: React.FC<HighlightColorPickerProps> = ({
  colors = DEFAULT_COLORS,
  selectedColor,
  onSelectColor,
  size = 16,
}) => {
  const checkIconSize = size * 0.75;

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <Typography>Colors : </Typography>
      {colors.map((color) => (
        <IconButton
          key={color}
          onClick={() => onSelectColor(color)}
          sx={{
            width: size,
            height: size,
            minWidth: size,
            minHeight: size,
            padding: 0,
            backgroundColor: color,
            "&:hover": {
              backgroundColor: color,
            },
          }}
          aria-label={`Select color ${color}`}
        >
          {selectedColor === color && (
            <CheckIcon
              sx={{
                fontSize: checkIconSize,
                color: "white",
                filter: "drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.5))",
                stroke: "currentColor",
                strokeWidth: 1.5,
              }}
            />
          )}
        </IconButton>
      ))}
    </Box>
  );
};

export default HighlightColorPicker;
