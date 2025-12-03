import React from "react";
import { Card, Box, Icon, Typography, styled } from "@mui/material";

// Updated tile to match Files/Create/Entity tile design
const StyledCard = styled(Card)(({ theme }) => ({
  position: "relative",
  width: 220,
  minHeight: 160,
  height: "auto",
  maxHeight: 200,
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(1.5),
  alignSelf: "flex-start",
  cursor: "pointer",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 0,
  transition: theme.transitions.create(
    ["transform", "box-shadow", "background-color"],
    { duration: theme.transitions.duration.shortest }
  ),
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[3],
    backgroundColor: theme.palette.action.hover,
  },
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  whiteSpace: "normal",
  overflow: "visible",
  textOverflow: "unset",
  wordBreak: "break-word",
  lineHeight: 1.2,
  textAlign: "center",
}));

interface StyledCardComponentProps {
  icon?: React.ReactNode; // usually a string name for <Icon>
  title: string;
  onClick: () => void;
}

const StyledCardComponent: React.FC<StyledCardComponentProps> = ({
  icon,
  title,
  onClick,
}) => {
  return (
    <StyledCard onClick={onClick}>
      {/* Centered watermark icon */}
      {icon && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: (t) => t.palette.primary.main,
            opacity: 0.08,
            "& .MuiSvgIcon-root, & svg, & span": { fontSize: 100 },
          }}
        >
          <Icon>{icon}</Icon>
        </Box>
      )}
      {/* Flexible spacer to push title row to the bottom while allowing growth */}
      <Box sx={{ flexGrow: 1 }} />
      {/* Bottom row with wrapping title only (no leading icon) */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "center", width: "100%" }}>
        <Title variant="body2" title={title} sx={{ width: "100%" }}>
          {title}
        </Title>
      </Box>
    </StyledCard>
  );
};

export default StyledCardComponent;
