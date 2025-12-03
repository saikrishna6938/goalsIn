import { Fragment, useState } from "react";

import Scrollbar from "react-perfect-scrollbar";

import { styled, Typography, Box, Icon, Button } from "@mui/material";

import { MatxVerticalNav } from "app/components";

import useSettings from "app/hooks/useSettings";

import appStore from "../mobxStore/AppStore";

import { Themecolors, fonts } from "api/Colors";

import { toJS } from "mobx";

import BarChartIcon from "@mui/icons-material/BarChart";
import ListAltIcon from "@mui/icons-material/ListAlt";

import StructureIcon from "@mui/icons-material/Apartment";
import { CreateRounded } from "@mui/icons-material";

const StyledScrollBar = styled(Scrollbar)(() => ({
  background: Themecolors.S_bg1,
  color: Themecolors.S_text1,
  fontFamily: fonts.poppins,
  paddingLeft: "1rem",
  paddingRight: "1rem",
  height: "100vh",
  position: "relative",
  fontSize: "1rem",
  "& *": {
    transition: "all 0.3s ease",
  },
  "& a": {
    textDecoration: "none",
    color: Themecolors.S_text1,
    padding: "0.5rem 1rem",
    display: "block",
    borderRadius: "8px",
    border: "1px solid transparent",
    "&:hover": {
      background: Themecolors.S_hover,
      color: Themecolors.S_text1,
      borderColor: Themecolors.S_border,
    },
  },
}));

const SideNavMobile = styled("div")(({ theme }) => ({
  position: "fixed",

  top: 0,

  left: 0,

  bottom: 0,

  right: 0,

  width: "100vw",

  background: "rgba(0, 0, 0, 0.7)",

  zIndex: -1,

  [theme.breakpoints.up("lg")]: { display: "none" },
}));

const Sidenav = ({ children }) => {
  const { settings, updateSettings } = useSettings();

  const [toggle, setToggle] = useState(false);

  const usertype = appStore.loginResponse.user[0].userType;

  const hostName = window.location.hostname;

  const isDevelopingMode = hostName === "localhost";

  const updateSidebarMode = (sidebarSettings) => {
    let activeLayoutSettingsName = settings.activeLayout + "Settings";

    let activeLayoutSettings = settings[activeLayoutSettingsName];

    updateSettings({
      ...settings,

      [activeLayoutSettingsName]: {
        ...activeLayoutSettings,

        leftSidebar: {
          ...activeLayoutSettings.leftSidebar,

          ...sidebarSettings,
        },
      },
    });
  };

  const Data = [
    {
      name: "Create",

      path: "/admin/create_forms",

      icon: <CreateRounded fontSize="small" />,
    },
    {
      name: "My FIles",

      path: "/user/files",

      icon: "folder",
    },

    {
      name: "Select Entity",

      icon: "location_on",
    },

    {
      name: "Dashboard Center",

      path: "/user/control_central",

      icon: <BarChartIcon />,
    },
  ];

  const adminNavigtions = [
    {
      name: "Structures",

      path: "/admin/structures",

      icon: <StructureIcon />,
    },
    {
      name: "Document Flow",

      path: "/admin/document",

      icon: "people",
    },
    {
      name: "Data Table",

      path: "/admin/data",

      icon: <ListAltIcon />,
    },
    {
      name: "Form Management",

      path: "/admin/form",

      icon: "assignment",
    },

    {
      name: "Work Flow",

      path: "/admin/workflow",

      icon: "track_changes",
    },
    {
      name: "News Letters",

      path: "/admin/newsletters",

      icon: "mail",
    },
  ];

  const search = [
    {
      name: "Search",
      icon: "track_changes",
      children: [
        {
          name: "Tag Search",
          path: "/user/search",
          icon: "sell",
        },
        {
          name: "Application Search",
          path: "/user/application-search",
          icon: "assignment",
        },
        {
          name: "Tasks Search",
          path: "/user/tasks-search",
          icon: "task",
        },
      ],
    },
  ];

  const data = appStore.loginResponse.navigations;

  const navigationsArray = toJS(data);

  const combinedArray = [...search, ...navigationsArray, ...Data];

  // const userNavigations = isDevelopingMode

  //   ? [...combinedArray, ...Data]

  //   : combinedArray;

  const toggleData = toggle
    ? [...combinedArray, ...adminNavigtions]
    : combinedArray;

  const mode = settings.layout1Settings.leftSidebar.mode;

  const navigationsData = usertype === 2 ? navigationsArray : toggleData;

  return (
    <Fragment>
      <StyledScrollBar options={{ suppressScrollX: true }}>
        {children}

        <MatxVerticalNav
          items={navigationsData}
          toggle={toggle}
          setToggle={setToggle}
        />
      </StyledScrollBar>
      {usertype === -1 && (
        <Box
          sx={{
            borderTop: `1px solid ${Themecolors.S_border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 15px",
            backgroundColor: Themecolors.S_active,
          }}
        >
          <Box
            sx={{
              ml: 1,
              color: Themecolors.S_text1,
              display: "flex",
              alignItems: "center",
            }}
            onClick={() => {
              if (mode === "compact") {
                setToggle((prev) => !prev);
              }
            }}
          >
            <Icon
              sx={{
                cursor: mode === "compact" ? "pointer" : "default",
                marginRight: mode === "compact" ? "1.3em" : 2,
                ...(mode === "compact" && {
                  "&:hover": {
                    color: Themecolors.S_border,
                  },
                }),
              }}
            >
              admin_panel_settings
            </Icon>

            {mode !== "compact" && "Admin Mode"}
          </Box>

          <Button
            sx={{
              ml: mode === "compact" ? "1em" : 0,
              border: `1px solid ${Themecolors.S_border}`,
              color: Themecolors.S_text1,
              borderRadius: "20px",
              backgroundColor: toggle ? Themecolors.S_hover : "transparent",
              textTransform: "none",
            }}
            onClick={() => setToggle((prev) => !prev)}
          >
            {toggle ? "Yes" : "No"}
          </Button>
        </Box>
      )}
      <SideNavMobile onClick={() => updateSidebarMode({ mode: "close" })} />
    </Fragment>
  );
};

export default Sidenav;
