import {
  Box,
  Card,
  Grid,
  Icon,
  IconButton,
  styled,
  Tooltip,
  Fab,
} from "@mui/material";
import { Themecolors } from "api/Colors";
export const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "24px !important",
  cursor: "pointer", // make it selectable
  background: Themecolors.DB_bg, // lighter background for contrast
  transition: "transform .2s", // smooth transition for hover effect
  "&:hover": {
    transform: "scale(1.02)",
    backgroundImage: Themecolors.DB_hv3,
  },
  [theme.breakpoints.down("sm")]: { padding: "16px !important" },
}));

export const FabIcon = styled(Fab)(({ theme }) => ({
  width: "40px !important",
  height: "40px !important",
  boxShadow: "none !important",
  transition: theme.transitions.create("transform"),
  "&:hover": {
    transform: "scale(1.1)",
    backgroundImage: Themecolors.DB_hv1,
  },

  color: Themecolors.DB_Icon2,
}));

const ContentBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  "& small": {
    fontSize: "16px", // increased font size
    color: Themecolors.DB_text2,
  },
  "& .icon": {
    opacity: 0.8,
    fontSize: "48px", // increased icon size
    color: Themecolors.DB_bg1, // slightly darker shade for icons
  },
}));

const Heading = styled("h6")(({ theme }) => ({
  margin: 0,
  marginTop: "4px",
  fontSize: "18px", // increased font size
  fontWeight: "600",
  color: Themecolors.DB_text2, // use secondary color for highlights
}));

const StatCards = ({ cardList, handleTasks }) => {
  // const cardList = [
  //   { name: "Total Tasks", amount: 3050, icon: "task_alt" },
  //   { name: "Actioned Notes", amount: "2", icon: "note" },
  //   { name: "Pending Tasks", amount: "350", icon: "pending" },
  //   { name: "Documents", amount: "305", icon: "description" },
  // ];

  return (
    <Grid container spacing={3} sx={{ mb: "24px" }}>
      {Object.entries(cardList).map(([documentTypeName, tasks], index) => (
        <Grid
          item
          xs={12}
          md={6}
          key={index}
          onClick={() => {
            handleTasks(tasks);
          }}
        >
          <StyledCard elevation={8}>
            {/* Increased elevation for more depth */}
            <ContentBox>
              <Icon className="icon">task_alt</Icon>
              <Box ml="16px">
                {/* increased margin for better spacing */}
                <small>{documentTypeName}</small>
                <Heading>Tasks: {tasks.length}</Heading>
              </Box>
            </ContentBox>
            <Tooltip title="View Details" placement="top">
              <FabIcon
                size="medium"
                sx={{ background: "rgba(9, 182, 109, 0.15)" }}
              >
                <Icon>arrow_right_alt</Icon>
              </FabIcon>
            </Tooltip>
          </StyledCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatCards;
