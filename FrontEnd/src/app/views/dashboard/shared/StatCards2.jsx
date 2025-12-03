import {
  Card,
  Fab,
  Grid,
  Icon,
  lighten,
  styled,
  useTheme,
} from "@mui/material";
import { Themecolors } from "api/Colors";

export const ContentBox = styled("div")(() => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
}));

export const FabIcon = styled(Fab)(({ theme }) => ({
  width: 30,
  height: 30,
  minHeight: 30,
  boxShadow: "none !important",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& .MuiSvgIcon-root, & .MuiIcon-root": {
    fontSize: "1.125rem",
  },
  transition: theme.transitions.create(
    ["transform", "box-shadow", "background-color"],
    {
      duration: theme.transitions.duration.shortest,
    }
  ),
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[2],
  },
  color: Themecolors.DB_Icon2,
}));

export const H3 = styled("h3")(({ textcolor }) => ({
  margin: 0,
  fontWeight: "600",
  marginLeft: "1rem",
  color: Themecolors.DB_text2,
  fontSize: "clamp(0.8125rem, 1.6vw, 0.9375rem)",
}));

export const H1 = styled("h1")(() => ({
  margin: 0,
  flexGrow: 1,
  color: Themecolors.DB_text4,
  fontSize: "1.5rem",
}));

const TextError = styled("h1")(() => ({
  margin: 0,
  flexGrow: 1,
  fontSize: "1.5rem",
  color: Themecolors.DB_text5,
}));

export const Span = styled("span")(() => ({
  fontSize: "1.25rem",
  marginLeft: "0.375rem",
}));

export const IconBox = styled("div")(() => ({
  width: "1.3125rem",
  height: "1.3125rem",
  color: Themecolors.DB_bg2,
  display: "flex",
  overflow: "hidden",
  borderRadius: "300px ",
  justifyContent: "center",
  "& .icon": {
    fontSize: "1.25rem",
  },
}));

const StatCards2 = ({ onTime, Critical, handleCardClick, stacked = false }) => {
  const { palette } = useTheme();
  const textError = palette.error.main;
  const bgError = lighten(palette.error.main, 0.85);

  const total = Number(onTime) + Number(Critical);
  const onTimePercentage = total > 0 ? Math.round((+onTime / total) * 100) : 0;
  const CriticalPercentage =
    total > 0 ? Math.round((+Critical / total) * 100) : 0;

  // const onTimePercentage =
  //   (+onTime / (Number(onTime) + Number(Critical))) * 100;
  // const CriticalPercentage =
  //   (+Critical / (Number(onTime) + Number(Critical))) * 100;

  return (
    <Grid container spacing={1} justifyContent={"center"}>
      <Grid item xs={12} md={stacked ? 12 : 6}>
        <Card
          elevation={3}
          sx={{
            p: { xs: 1, sm: 1.2 },
            cursor: "pointer",
            transition: (t) =>
              t.transitions.create(
                ["box-shadow", "transform", "background-color"],
                { duration: t.transitions.duration.shortest }
              ),
            "&:hover": {
              boxShadow: (t) => t.shadows[3],
              transform: "translateY(-2px)",
            },
          }}
          onClick={() => handleCardClick("OnTime")}
        >
          <ContentBox>
            <FabIcon
              size="small"
              sx={{
                backgroundColor: (t) => t.palette.action.hover,
              }}
            >
              <Icon>trending_up</Icon>
            </FabIcon>
            <H3>On Time</H3>
          </ContentBox>

          <ContentBox sx={{ pt: 2.2 }}>
            <H1 style={{ fontSize: "clamp(0.9375rem, 2vw, 1.1875rem)" }}>
              {onTime}
            </H1>
            <IconBox sx={{ background: "rgba(9, 182, 109, 0.15)" }}>
              <Icon
                className="icon"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                expand_less
              </Icon>
            </IconBox>
            <Span
              sx={{
                color: Themecolors.DB_text4,
                fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
              }}
            >
              ({onTimePercentage}%)
            </Span>
          </ContentBox>
        </Card>
      </Grid>

      <Grid item xs={12} md={stacked ? 12 : 6}>
        <Card
          elevation={3}
          sx={{
            p: { xs: 1, sm: 1.2 },
            cursor: "pointer",
            transition: (t) =>
              t.transitions.create(
                ["box-shadow", "transform", "background-color"],
                { duration: t.transitions.duration.shortest }
              ),
            "&:hover": {
              boxShadow: (t) => t.shadows[3],
              transform: "translateY(-2px)",
            },
          }}
          onClick={() => handleCardClick("Crtical")}
        >
          <ContentBox>
            <FabIcon
              size="small"
              sx={{
                backgroundColor: (t) => t.palette.action.hover,
              }}
            >
              <Icon>star_outline</Icon>
            </FabIcon>
            <H3 textcolor={textError}>Priority Applications</H3>
          </ContentBox>

          <ContentBox sx={{ pt: 2.2 }}>
            <TextError style={{ fontSize: "clamp(0.9375rem, 2vw, 1.1875rem)" }}>
              {Critical}
            </TextError>
            <IconBox sx={{ background: "rgba(9, 182, 109, 0.15)" }}>
              <Icon
                className="icon"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                expand_less
              </Icon>
            </IconBox>
            <Span
              sx={{
                color: Themecolors.DB_text5,
                fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
              }}
            >
              ({CriticalPercentage}%)
            </Span>
          </ContentBox>
        </Card>
      </Grid>
    </Grid>
  );
};

export default StatCards2;
