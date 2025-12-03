import { memo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  Hidden,
  Icon,
  IconButton,
  MenuItem,
  useMediaQuery,
  Box,
  styled,
  useTheme,
  Modal,
  Paper,
  Typography,
  TextField,
  Button,
} from "@mui/material";

import { MatxMenu, MatxSearchBox } from "app/components";
import { themeShadows } from "app/components/MatxTheme/themeColors";
import { NotificationProvider } from "app/contexts/NotificationContext";
import useAuth from "app/hooks/useAuth";
import useSettings from "app/hooks/useSettings";
import { topBarHeight } from "app/utils/constant";
import TabBar from "app/formComponents/TabBar";
import { Span } from "../../Typography";
import NotificationBar from "../../NotificationBar/NotificationBar";
import ShoppingCart from "../../ShoppingCart";
import appStore from "../../../mobxStore/AppStore";
import { Themecolors } from "api/Colors";
import UpdatePassword from "../Layout1/UpdatePassword.tsx";
import UserProfile from "../Layout1/UserProfile.tsx";
import { api } from "api/API";
import Toast from "app/formComponents/Toast";
import CustomButton from "app/components/CustomButton ";
import UserAvatar from "app/admin/formManagement/userform/UserAvatar";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";

// Enhanced UI color configuration
const colors = {
  light: {
    background: "#FFFFFF", // Light mode background
    text: "#333333", // Light mode text
  },
  dark: {
    background: "#121212", // Dark mode backg
    //
    //
    // round
    text: "#FFFFFF", // Dark mode text
  },
};

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: Themecolors.Icons_blue,
  "&:hover": {
    backgroundImage: Themecolors.Manu_hv1,
  },
}));

function convertHexToRGB(hex) {
  if (hex.length === 4) {
    hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

const TopbarRoot = styled("div")(({ theme }) => ({
  top: 0,
  zIndex: 96,
  height: topBarHeight,
  boxShadow: themeShadows[8],
  transition: "all 0.3s ease",
  background:
    theme.palette.mode === "dark"
      ? convertHexToRGB(colors.dark.background)
      : convertHexToRGB(colors.light.background),
}));

const TopbarContainer = styled(Box)(({ theme }) => ({
  padding: "8px",
  paddingLeft: 18,
  paddingRight: 20,
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: Themecolors.Menu_bg,
  [theme.breakpoints.down("sm")]: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  [theme.breakpoints.down("xs")]: {
    paddingLeft: 14,
    paddingRight: 16,
  },
}));

const UserMenu = styled(Box)({
  "&:hover": {
    backgroundImage: Themecolors.Manu_hv1,
  },
  color: Themecolors.User_Text,
  padding: 4,
  display: "flex",
  borderRadius: 24,
  cursor: "pointer",
  alignItems: "center",
  "& span": { margin: "0 8px" },
});

const StyledItem = styled(MenuItem)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  minWidth: 185,
  "& a": {
    width: "100%",
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
  },
  "& span": { marginRight: "10px", color: theme.palette.text.primary },
}));

const Layout1Topbar = () => {
  const theme = useTheme();
  const { settings, updateSettings } = useSettings();
  const { logout } = useAuth();
  const user = appStore.loginResponse?.user[0];
  const [userProfileData, setUserProfileData] = useState({});
  const [passwordData, setPasswordData] = useState({});
  const [open, SetOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [consfirmpasswordpass, Setconsfirmpasswordpass] = useState();
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (user?.userId && user.userId > 0) {
      fetchUserAvatar();
    } else {
      setAvatar(null);
    }
  }, [user?.userId]);

  const fetchUserAvatar = async () => {
    try {
      const res = await api.post(`user-details`, {
        body: {
          userId: user?.userId,
        },
      });

      setAvatar(res.data[0].avatar);
    } catch (error) {
      throw error;
    }
  };

  const updateSidebarMode = (sidebarSettings) => {
    updateSettings({
      layout1Settings: { leftSidebar: { ...sidebarSettings } },
    });
  };

  const handleSidebarToggle = () => {
    let { layout1Settings } = settings;
    let mode;

    if (layout1Settings.leftSidebar.mode === "compact") {
      mode = "full"; // Toggle to full width
    } else {
      mode = "compact"; // Toggle to 80% width
    }

    updateSidebarMode({ mode });
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleClick = () => {
    SetOpen(true);
  };

  const handleSave = async () => {
    let payload;

    if (selectedTab === 0) {
      payload = userProfileData;
    } else if (selectedTab === 1) {
      payload = passwordData;
    }

    if (
      (selectedTab === 0 && Object.keys(userProfileData).length === 0) ||
      (selectedTab === 1 && passwordData?.userPassword === "")
    ) {
      appStore.showToast("No changes to save.", "success");
      return;
    }

    if (selectedTab === 1 && !consfirmpasswordpass) {
      return;
    }
    if (payload) {
      try {
        const response = await api.post("update-user", {
          body: payload,
        });
        if (response.success) {
          api
            .post("user-details", {
              body: {
                userId: user.userId,
              },
            })
            .then((res) => {
              appStore.loginResponse.user = res.data;
            });
          appStore.showToast(response.message, "success");
        } else {
          appStore.showToast(response.message, "error");
        }
      } catch (er) {
        throw er;
      }
    }
    SetOpen(false);

    setUserProfileData({});
    setSelectedTab(0);
  };

  const handleModalClose = () => {
    SetOpen(false);
    setSelectedTab(0);
  };

  const handleClose = () => {
    SetOpen(false);
  };

  const handlePasswordValidity = (pass) => {
    Setconsfirmpasswordpass(pass);
  };
  const renderTab = (tab) => {
    const centerStyle = {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      textAlign: "center",
    };

    switch (tab) {
      case 0:
        return (
          <UserProfile
            setUserProfileData={setUserProfileData}
            avatar={avatar}
            onLoad={fetchUserAvatar}
          />
        );
      case 1:
        return (
          <UpdatePassword
            setUserProfileData={setPasswordData}
            setPasswordValid={handlePasswordValidity}
          />
        );

      default:
        return null;
    }
  };

  const userFullName = `${user.userFirstName || ""} ${
    user.userLastName || ""
  }`.trim();

  return (
    <>
      <TopbarRoot>
        <TopbarContainer>
          <Box display="flex">
            <StyledIconButton onClick={handleSidebarToggle}>
              <Icon>menu</Icon>
            </StyledIconButton>
          </Box>

          <Box display="flex" alignItems="center">
            <MatxSearchBox />

            <NotificationProvider>
              <NotificationBar />
            </NotificationProvider>

            <MatxMenu
              menuButton={
                <UserMenu>
                  <Hidden xsDown>
                    <Span>
                      Hi
                      <strong>{` ${user.userFirstName} ${user.userLastName}`}</strong>
                    </Span>
                  </Hidden>
                  <UserAvatar
                    avatarUrl={avatar}
                    fullName={userFullName}
                    fontSize={14}
                    size={31}
                  />
                </UserMenu>
              }
            >
              <StyledItem>
                <Link to="/">
                  <Icon> home </Icon>
                  <Span> Dashboard </Span>
                </Link>
              </StyledItem>

              <StyledItem onClick={handleClick}>
                <Icon> settings </Icon>
                <Span> Settings </Span>
              </StyledItem>

              <StyledItem onClick={logout}>
                <Icon> power_settings_new </Icon>
                <Span> Logout </Span>
              </StyledItem>
            </MatxMenu>
          </Box>
        </TopbarContainer>
      </TopbarRoot>
      <Modal open={open} onClose={handleModalClose}>
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            display: "flex",
            flexDirection: "column",
            maxWidth: "650px",
            width: "90%",
            height: "450px",
            borderRadius: 0,
            overflow: "hidden",
          }}
        >
          <Box>
            <TabBar
              value={selectedTab}
              onChange={handleTabChange}
              tabs={["Profile", "Update Password"]}
            />
          </Box>
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "1em",
            }}
          >
            {renderTab(selectedTab)}
          </Box>
          <Box
            sx={{
              padding: "0 16px 16px 16px",
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mr: "1em",
              mt: 2,
            }}
          >
            <PrimaryButton
              label="Close"
              startIcon={<CancelIcon />}
              type="button"
              onClick={handleClose}
            />
            <PrimaryButton
              label="Save"
              startIcon={<SaveIcon />}
              type="submit"
              onClick={handleSave}
            />
          </Box>
        </Paper>
      </Modal>
    </>
  );
};

export default memo(Layout1Topbar);
