import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  Chip,
  Icon,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import UserAvatar from "app/admin/formManagement/userform/UserAvatar";
import React from "react";

interface ListComponent {
  items?: any[];
  onButtonClick?: (item: any) => void;
  buttonLabel?: string;
  heading?: string;
}

const DashBoardListComponent: React.FC<ListComponent> = ({
  items = [],
  onButtonClick,
  heading,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 0.5,
        overflow: "auto",
        borderRadius: 1,
        width: "100%",
      }}
    >
      {heading && (
        <Typography
          sx={{
            px: 1,
            pb: 0.5,
            fontWeight: 600,
            fontSize: { xs: "0.9rem", sm: "1rem" },
          }}
        >
          {heading}
        </Typography>
      )}

      <List sx={{ p: 0, m: 0 }}>
        {items.map((item, index) => {
          const name = item.userName || item.title || "Item";
          const state = item.documentStateName || item.status;
          const type = item.documentTypeName || item.subtitle;

          return (
            <ListItem
              key={index}
              sx={{
                p: 0,
                mb: 1,
                borderRadius: 1,
                bgcolor: (t) => t.palette.background.paper,
                border: (t) => `1px solid ${t.palette.divider}`,
                transition: (t) =>
                  t.transitions.create(
                    ["transform", "box-shadow", "background-color"],
                    {
                      duration: t.transitions.duration.shortest,
                    }
                  ),
                "&:hover": {
                  transform: "translateY(-1px)",
                  bgcolor: (t) => t.palette.action.disabledOpacity,
                },
              }}
            >
              <Button
                onClick={() => onButtonClick && onButtonClick(item)}
                sx={{
                  cursor: "pointer",
                  width: "100%",
                  p: 0.75,
                  textTransform: "none",
                  color: "inherit",
                  justifyContent: "flex-start",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  minHeight: "40px",
                }}
              >
                <Box mr={0.75}>
                  <UserAvatar
                    fullName={name}
                    size={29}
                    fontSize={12}
                    bgColor={theme.palette.primary.main}
                    textColor={theme.palette.primary.contrastText}
                  />
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                  }}
                >
                  {state && (
                    <Chip
                      label={state}
                      size="small"
                      color="default"
                      sx={{
                        alignSelf: "flex-start",
                        mb: 0.5,
                        fontSize: "0.65rem",
                        height: 21,
                      }}
                    />
                  )}
                  <Typography
                    fontWeight={600}
                    noWrap
                    sx={{ fontSize: "0.8rem", lineHeight: 1.2, mb: 0.5 }}
                  >
                    {name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={{ fontSize: "0.75rem", lineHeight: 1.2 }}
                  >
                    {type}
                  </Typography>
                </Box>

                <Icon
                  fontSize="small"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  arrow_forward
                </Icon>
              </Button>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default DashBoardListComponent;
