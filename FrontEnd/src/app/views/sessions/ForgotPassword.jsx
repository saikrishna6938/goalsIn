import {
  alpha,
  Box,
  Button,
  Card,
  Grid,
  InputAdornment,
  styled,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CssBaseline from "@mui/material/CssBaseline";
import appStore from "app/mobxStore/AppStore";

import { api } from "../../../api/API";
import SimpleDialog from "../../dialogs/SimpleDialog";
const FlexBox = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
}));

const LogoImage = styled("img")(() => ({
  height: 60,
  width: 150,
  objectFit: "contain",
  display: "block",
}));

const JustifyBox = styled(FlexBox)(() => ({
  justifyContent: "center",
}));

const ContentBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

const AuthRoot = styled(JustifyBox)(({ theme }) => ({
  minHeight: "100vh",
  padding: theme.spacing(4),
  backgroundImage: `url(/assets/images/illustrations/theme-waves.svg)`,
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  backgroundPosition: "center",
}));

const AuthCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: 560,
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: theme.shadows[8],
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: "saturate(160%) blur(8px)",
  border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
}));

const LogoBadge = styled(Box)(({ theme }) => ({
  display: "flex",
  width: "100%",
  padding: theme.spacing(1),
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 0,
  color: theme.palette.getContrastText(theme.palette.primary.contrastText),
}));
// No illustration inside the container to keep it clean

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [message, setMessage] = useState("");

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      appStore.showToast("Please enter your email address.", "error");

      return;
    }

    await api
      .post("forgot-password-email", {
        body: {
          userEmail: email,
        },
      })
      .then((res) => {
        if (res.success) {
          setMessage("Reset password sent to your email id successfully");
          setShowPrompt(true);
        } else {
          setMessage("User not found. Please sign up.");
          setShowPrompt(true);
        }
      });
  };

  const goalzinLogoSrc = `${
    process.env.PUBLIC_URL || ""
  }/assets/logo/logo-new.png`;

  return (
    <AuthRoot>
      <CssBaseline />
      <AuthCard>
        <Grid container>
          <Grid item xs={12}>
            <Box p={{ xs: 3, sm: 6 }}>
              <Box display="flex" justifyContent="center" mb={2}>
                <LogoBadge>
                  <Box display="flex" justifyContent="center">
                    <LogoImage src={goalzinLogoSrc} alt="Goalzin logo" />
                  </Box>
                </LogoBadge>
              </Box>

              <Typography variant="h5" fontWeight={700} gutterBottom>
                Forgot password
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={4}>
                We’ll send a password reset link to your email.
              </Typography>

              <ContentBox>
                <form onSubmit={handleFormSubmit} method="post">
                  <TextField
                    type="email"
                    name="email"
                    size="medium"
                    label="Email address"
                    value={email}
                    variant="outlined"
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{
                      mb: 3,
                      width: "100%",
                      "& input": { backgroundColor: "transparent" },
                      "& input:-webkit-autofill, & input:-webkit-autofill:focus, & input:-webkit-autofill:hover":
                        {
                          WebkitBoxShadow: (theme) =>
                            `0 0 0 1000px ${theme.palette.background.paper} inset`,
                          WebkitTextFillColor: (theme) =>
                            theme.palette.text.primary,
                          caretColor: (theme) => theme.palette.text.primary,
                        },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    type="submit"
                    size="large"
                  >
                    Reset Password
                  </Button>

                  <Button
                    fullWidth
                    color="primary"
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    sx={{ mt: 2 }}
                  >
                    Go Back
                  </Button>
                </form>
              </ContentBox>
            </Box>
          </Grid>
        </Grid>
      </AuthCard>
      {showPrompt && (
        <SimpleDialog
          show={showPrompt}
          description={message}
          title="Reset Password"
          buttonText="Close"
          onClose={() => {
            setShowPrompt(false);
          }}
        />
      )}
    </AuthRoot>
  );
};

export default ForgotPassword;
