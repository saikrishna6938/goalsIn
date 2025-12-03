import { memo } from "react";
import { Hidden, Switch, Box, styled, useTheme, alpha } from "@mui/material";
import { Themecolors } from "api/Colors";
import useSettings from "app/hooks/useSettings";
import { sidenavCompactWidth, sideNavWidth } from "app/utils/constant";
import Brand from "../../Brand";
import Sidenav from "../../Sidenav";

const SidebarNavRoot = styled(Box)(({ theme, width, image, mode }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  height: "100vh",
  width,
  zIndex: 111,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  backgroundColor: Themecolors.S_bg1,
  color: Themecolors.S_text1,
  boxShadow: theme.shadows[4],
  borderRight: `1px solid ${Themecolors.S_border}`,
  backgroundImage: image
    ? `linear-gradient(180deg, ${alpha(Themecolors.S_bg1, 0.95)} 0%, ${alpha(Themecolors.S_bg1, 0.9)} 100%), url(${image})`
    : "none",
  backgroundRepeat: image ? "no-repeat" : undefined,
  backgroundPosition: image ? "top" : undefined,
  backgroundSize: image ? "cover" : undefined,
  transition: "width 250ms ease-in-out, background-color 200ms ease-in-out, box-shadow 200ms ease-in-out",
  fontFamily: theme.typography.fontFamily,
}));

const NavListBox = styled(Box)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "transparent",
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  overflowY: "auto",
  // subtle scrollbar for long menus
  scrollbarWidth: "thin",
  scrollbarColor: `${alpha(Themecolors.S_border, 0.6)} ${alpha(Themecolors.S_bg1, 0.3)}`,
  "&::-webkit-scrollbar": { width: 8 },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: alpha(Themecolors.S_border, 0.8),
    borderRadius: 8,
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: alpha(Themecolors.S_bg1, 0.9),
  },
}));

const Layout1Sidenav = () => {
  const theme = useTheme();
  const { settings, updateSettings } = useSettings();
  const leftSidebar = settings.layout1Settings.leftSidebar;
  const { mode, bgImgURL } = leftSidebar;

  const getSidenavWidth = () => {
    switch (mode) {
      case "compact":
        return sidenavCompactWidth;

      default:
        return sideNavWidth;
    }
  };

  const updateSidebarMode = (sidebarSettings) => {
    updateSettings({
      layout1Settings: { leftSidebar: { ...sidebarSettings } },
    });
  };

  const handleSidenavToggle = () => {
    updateSidebarMode({ mode: mode === "compact" ? "full" : "compact" });
  };

  return (
    <SidebarNavRoot
      image={bgImgURL}
      width={getSidenavWidth()}
    >
      <NavListBox>
        <Brand>
          <Hidden smDown>
            <Switch
              onChange={handleSidenavToggle}
              checked={leftSidebar.mode !== "full"}
              color="secondary"
              size="small"
            />
          </Hidden>
        </Brand>
        <Sidenav />
      </NavListBox>
    </SidebarNavRoot>
  );
};

export default memo(Layout1Sidenav);
