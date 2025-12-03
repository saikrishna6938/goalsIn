import {
  Badge,
  Button,
  Card,
  Drawer,
  Icon,
  IconButton,
  ThemeProvider,
  Box,
  styled,
  useTheme,
} from "@mui/material";
import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import useNotification from "app/hooks/useNotification";
import useSettings from "app/hooks/useSettings";
import { sideNavWidth, topBarHeight } from "app/utils/constant";
import { getTimeDifference } from "app/utils/utils.js";
import { themeShadows } from "../MatxTheme/themeColors";
import { Paragraph, Small } from "../Typography";
import appStore from "../../mobxStore/AppStore";
import { Notes } from "@mui/icons-material";
import MarkUnreadChatAltTwoToneIcon from "@mui/icons-material/MarkUnreadChatAltTwoTone";
import { api } from "api/API";
import CloseIcon from "@mui/icons-material/Close";
import { Themecolors } from "api/Colors";

const Notification = styled("div")(() => ({
  padding: "16px",
  marginBottom: "16px",
  display: "flex",
  alignItems: "center",
  height: topBarHeight,
  boxShadow: themeShadows[6],
  "& h5": {
    marginLeft: "8px",
    marginTop: 0,
    marginBottom: 0,
    fontWeight: "500",
  },
}));

const CircularButton = styled(Button)({
  borderRadius: "50%",
  width: 40,
  height: 40,
  padding: 0,
  minWidth: 0,
  backgroundColor: "transparent",
});

const NotificationCard = styled(Box)(({ theme }) => ({
  position: "relative",
  "&:hover": {
    "& .messageTime": {
      display: "none",
    },
    "& .deleteButton": {
      opacity: "1",
    },
  },
  "& .messageTime": {
    color: theme.palette.text.secondary,
  },
  "& .icon": { fontSize: "1.25rem" },
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
  opacity: "0",
  position: "absolute",
  right: 5,
  marginTop: 9,
  marginRight: "24px",
  background: "rgba(0, 0, 0, 0.01)",
}));

const CardLeftContent = styled("div")(({ theme }) => ({
  padding: "12px 8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "rgba(0, 0, 0, 0.01)",
  "& small": {
    fontWeight: "500",
    marginLeft: "16px",
    color: theme.palette.text.secondary,
  },
}));

const Heading = styled("span")(({ theme }) => ({
  fontWeight: "500",
  marginLeft: "16px",
  color: theme.palette.text.secondary,
}));

const NotificationBar = ({ container }) => {
  const { settings } = useSettings();
  const theme = useTheme();
  const secondary = theme.palette.text.secondary;
  const [panelOpen, setPanelOpen] = useState(false);
  const handleDrawerToggle = () => {
    setPanelOpen(!panelOpen);
  };

  const { palette } = useTheme();
  const textColor = palette.text.primary;
  const userId = appStore.loginResponse.user[0].userId;
  const [notes, setNotes] = useState(appStore.loginResponse.notes);
  const deleteNotification = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const handleClickMarkAllAsRead = () => {
    // Include userId in the URL
    api
      .get(`markread/${userId}`)
      .then((res) => {
        console.log("Marked all as read successfully", res);
        setNotes([]);
      })
      .catch((error) => {
        // Handle error
        console.error("Error marking all as read:", error);
      });
  };

  // const handleClickMarkAllAsRead = () => {
  //   api
  //     .get(`/markread/${userId}`)
  //     .then((res) => {
  //       console.log("Marked all as read successfully", res);
  //       setNotes([]);
  //     })
  //     .catch((error) => {
  //       // Handle error
  //       console.error("Error marking all as read:", error);
  //     });
  // };

  const handleclick = () => {
    setPanelOpen(!panelOpen);
  };

  return (
    <Fragment>
      <IconButton
        onClick={handleDrawerToggle}
        sx={{
          "&:hover": {
            backgroundImage: Themecolors.Manu_hv1,
          },
        }}
      >
        <Badge color="secondary" badgeContent={notes.length}>
          <Icon sx={{ color: Themecolors.Icons_blue }}>notifications</Icon>
        </Badge>
      </IconButton>

      <ThemeProvider theme={settings.themes[settings.activeTheme]}>
        <Drawer
          width={"100px"}
          container={container}
          variant="temporary"
          anchor={"right"}
          open={panelOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
        >
          {notes.length > 0 ? (
            <>
              <Box sx={{ width: sideNavWidth }}>
                <Notification>
                  <Icon color="primary">notifications</Icon>
                  <h5>Notifications</h5>
                </Notification>

                {notes.map((note) => (
                  <NotificationCard key={note.id}>
                    <DeleteButton
                      size="small"
                      className="deleteButton"
                      onClick={() => deleteNotification(note.id)}
                    >
                      <Icon className="icon">clear</Icon>
                    </DeleteButton>
                    <Card sx={{ mx: 2, mb: 3 }} elevation={3}>
                      <CardLeftContent>
                        <Box display="flex">
                          <Icon className="icon">
                            {note.icon ? note.icon : "notifications"}
                          </Icon>
                          <Heading>{note.taskName}</Heading>
                        </Box>
                        <Small className="messageTime">
                          {getTimeDifference(new Date(note.noteCreated))}
                          ago
                        </Small>
                      </CardLeftContent>
                      <Box sx={{ px: 2, pt: 1, pb: 2 }}>
                        <Paragraph sx={{ m: 0 }}>{note.noteComment}</Paragraph>
                      </Box>
                    </Card>
                  </NotificationCard>
                ))}

                {!!notes.length && (
                  <Box sx={{ color: secondary }}>
                    <Button onClick={handleClickMarkAllAsRead}>
                      Mark all as read
                    </Button>
                  </Box>
                )}
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mt: 5,
                ml: 1,
                marginX: 3,
                mt: 10,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  ml: 24,
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                }}
              >
                <CircularButton onClick={handleclick}>
                  <CloseIcon sx={{ fontSize: 20, color: "#616161", ml: 0 }} />
                </CircularButton>
              </Box>
              <MarkUnreadChatAltTwoToneIcon
                sx={{ color: "#cfcfcf", fontSize: 28, mr: "5px" }}
              />
              <h5
                style={{
                  color: "#cfcfcf",
                  marginTop: 5,
                  marginBottom: 0,
                  fontSize: 18,
                  fontWeight: 450,
                }}
              >
                No Notifications Yet...!
              </h5>
            </Box>
          )}
        </Drawer>
      </ThemeProvider>
    </Fragment>
  );
};

export default NotificationBar;
