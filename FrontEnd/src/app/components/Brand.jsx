import { Box, styled, Icon, Button, useMediaQuery } from "@mui/material";
import { MatxLogo } from "app/components";
import useSettings from "app/hooks/useSettings";
import { Span } from "./Typography";
import appStore from "../mobxStore/AppStore";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const BrandRoot = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "left",
  justifyContent: "space-between",
  paddingTop: "20px",
  paddingBottom: "5px",
}));

const StyledSpan = styled(Span)(({ mode }) => ({
  fontSize: 26,
  fontWeight: 800,
  letterSpacing: "0.06em",
  display: mode === "compact" ? "none" : "block",
  color: "black",
  marginTop: "6px",
}));

const goalzinLogoSrc = `${
  process.env.PUBLIC_URL || ""
}/assets/logo/logo-new.png`;

const LogoWrapper = styled("span", {
  shouldForwardProp: (prop) => prop !== "mode",
})(({ mode }) => ({
  display: mode === "compact" ? "none" : "flex",
  maxWidth: "200px",
  alignItems: "center",
  justifyContent: "center",
  paddingBottom: "12px",
}));

const LogoImage = styled("img")(() => ({
  width: "100%",
  height: "auto",
  display: "block",
}));

const GoalzinLogo = ({ mode, className }) => (
  <LogoWrapper mode={mode} className={className}>
    <LogoImage src={goalzinLogoSrc} alt="Goalzin logo" />
  </LogoWrapper>
);

const Brand = observer(({ children }) => {
  const { settings, updateSettings } = useSettings();
  const leftSidebar = settings.layout1Settings.leftSidebar;
  const { mode } = leftSidebar;
  const [userEntity, setUserEntity] = useState("");

  const updateSidebarMode = (sidebarSettings) => {
    updateSettings({
      layout1Settings: { leftSidebar: { ...sidebarSettings } },
    });
  };

  useEffect(() => {
    const name =
      appStore.userEntities.find(
        (entity) => entity.entityId === appStore.selectedEntity
      )?.entityName ?? " ";
    setUserEntity(name);
  }, [appStore.selectedEntity, appStore.userEntities]);

  return (
    <BrandRoot>
      <Box
        display="flex"
        alignItems="center"
        sx={{ position: "relative", bottom: "18px" }}
      >
        <GoalzinLogo mode={mode} className="sidenavHoverShow" />
      </Box>
      <Box
        display="flex"
        alignItems="center"
        sx={{
          position: "relative",
          ml: "1em",
          bottom: "2em",
          display: mode === "compact" ? "none" : "flex",
        }}
      >
        {userEntity && (
          <>
            <LocationOnIcon
              sx={{
                color: "black",
                fontSize: "15px",
                marginRight: "8px",
              }}
            />
            <StyledSpan
              sx={{
                fontSize: "1.1em",
                position: "relative",
                bottom: "0.15em",
              }}
            >
              {`${userEntity}`}
            </StyledSpan>
          </>
        )}
      </Box>
    </BrandRoot>
  );
});

export default Brand;
