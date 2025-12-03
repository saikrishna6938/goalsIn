import { Box, Button, Card, Grid, styled, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../../api/API";
import SimpleDialog from "../../dialogs/SimpleDialog";
import InfoAlert from "../../formComponents/InfoAlert";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const FlexBox = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
}));

const JustifyBox = styled(FlexBox)(() => ({
  justifyContent: "center",
}));

const ContentBox = styled(Box)(({ theme }) => ({
  padding: 32,
  background: theme.palette.background.default,
}));

const ForgotPasswordRoot = styled(JustifyBox)(() => ({
  background: "#1A2038",
  minHeight: "100vh !important",
  "& .card": {
    maxWidth: 800,
    margin: "1rem",
    borderRadius: 12,
  },
}));

const ResetPassword = () => {
  const navigate = useNavigate();
  const [pass, setNewPass] = useState("");
  const [check, setNewCheck] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [message, setMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const params = currentPath.split("/");
  const urlText = params[params.length - 1] ?? null;
  console.log(urlText);
  useEffect(() => {
    if (pass.length > 5) {
      setInfoMessage("");
      if (check !== pass) {
        setInfoMessage("Passwords does not match");
      } else {
        setCanSubmit(true);
        setInfoMessage("");
      }
    } else {
      setInfoMessage("Password must contain min 5 characters");
    }
  }, [check, pass]);
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    await api
      .post("reset-password", {
        body: {
          urlText: urlText,
          newPassword: pass,
        },
      })
      .then((res) => {
        if (res.success) {
          setMessage("Password successfully updated");
          setShowPrompt(true);
        } else {
          setMessage("Request failed. Please try gain.");
          setShowPrompt(true);
        }
      });
  };

  return (
    <ForgotPasswordRoot
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundImage: `url(${"/assets/images/illustrations/transparant.PNG"})`,
        backgroundColor: "#263238",
        backgroundSize: "cover",
        height: "100vh",
        marginBottom: "50%",
      }}
    >
      <Card
        sx={{
          border: "3px solid",
          borderColor: "#cfd8dc",
          width: "29.3%",
          marginRight: "4.8%",
          height: "57%",
          backgroundColor: "white",
          marginBottom: "10%",
        }}
      >
        <Grid container>
          <Grid item xs={12}>
            <Avatar sx={{ mt: 2, bgcolor: "#aa00ff", marginLeft: "44.6%" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography
              alignItems={"center"}
              component="h1"
              variant="h5"
              sx={{ marginLeft: "30%", mb: 3, color: "#263238" }}
            >
              Reset password
            </Typography>
            {infoMessage && (
              <InfoAlert severity="error" message={infoMessage} />
            )}
            <ContentBox>
              <form onSubmit={handleFormSubmit}>
                <TextField
                  type="password"
                  name="newPassword"
                  size="small"
                  label="New Password"
                  value={pass}
                  variant="outlined"
                  onChange={(e) => setNewPass(e.target.value)}
                  sx={{ mb: 3, width: "100%" }}
                />
                <TextField
                  type="text"
                  name="newPassword2"
                  size="small"
                  label="Re-enter Password"
                  value={check}
                  variant="outlined"
                  onChange={(e) => setNewCheck(e.target.value)}
                  sx={{ mb: 3, width: "100%" }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={!canSubmit}
                >
                  Reset Password
                </Button>
              </form>
            </ContentBox>
          </Grid>
        </Grid>
      </Card>
      {showPrompt && (
        <SimpleDialog
          show={showPrompt}
          description={message}
          title="Reset Password"
          buttonText="Close"
          onClose={() => {
            navigate("/session/signin");
          }}
        />
      )}
    </ForgotPasswordRoot>
  );
};

export default ResetPassword;
