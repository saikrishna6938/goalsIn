import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import {
  alpha,
  Box,
  Card,
  Checkbox,
  Grid,
  InputAdornment,
  TextField,
  styled,
  useTheme,
} from "@mui/material";
import useAuth from "app/hooks/useAuth";
import { Formik } from "formik";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Alert from "@mui/material/Alert";
import { APP_NAME } from "../../../api/Keys";

const LogoImage = styled("img")(() => ({
  height: 60,
  width: 150,
  objectFit: "contain",
  display: "block",
}));

const FlexBox = styled(Box)(() => ({ display: "flex", alignItems: "center" }));

const JustifyBox = styled(FlexBox)(() => ({ justifyContent: "center" }));

export const InfoAlert = ({ severity, message }) => {
  return <Alert severity={severity}>{message}</Alert>;
};

export const ContentBox = styled(Box)(({ theme }) => ({
  height: "100%",
  padding: theme.spacing(4),
  position: "relative",
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

// No illustration inside the container to keep it clean

const LogoBadge = styled(Box)(({ theme }) => ({
  display: "flex",
  width: "100%",
  padding: theme.spacing(1),
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 0,
  color: theme.palette.getContrastText(theme.palette.primary.contrastText),
}));

// inital login credentials
const initialValues = {
  email: "",
  password: "",
  remember: true,
};

// form field validation schema
const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password must be 6 character length")
    .required("Password is required!"),
  email: Yup.string()
    .email("Invalid Email address")
    .required("Email is required!"),
});

const JwtLogin = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alertmessage, setAlertmessage] = useState("");
  const [alertSeverity, setAlertseverity] = useState("");

  const { login } = useAuth();

  const goalzinLogoSrc = `${
    process.env.PUBLIC_URL || ""
  }/assets/logo/logo-new.png`;

  const handleFormSubmit = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      setTimeout(() => {
        setAlertmessage("");
      }, 3000);
      navigate("/");
    } catch (e) {
      if (e.massage === "user_not_found") {
        setAlertmessage("Account not found. Please sign up.");
        setAlertseverity("error");
      } else {
        setAlertmessage("Incorrect email or password. Please try again.");
        setAlertseverity("error");
      }
      setTimeout(() => {
        setAlertmessage("");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthRoot>
      <CssBaseline />
      <AuthCard>
        <Grid container>
          <Grid item xs={12}>
            <Box p={{ xs: 3, sm: 6 }}>
              {alertmessage && (
                <Box mb={2}>
                  <InfoAlert
                    severity={alertSeverity === "success" ? "success" : "error"}
                    message={alertmessage}
                  />
                </Box>
              )}
              <Box display="flex" justifyContent="center" mb={2}>
                <LogoBadge>
                  <Box display="flex" justifyContent="center">
                    <LogoImage src={goalzinLogoSrc} alt="Goalzin logo" />
                  </Box>
                </LogoBadge>
              </Box>

              <Typography gutterBottom variant="h5" sx={{ fontWeight: 700 }}>
                Sign in
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={4}>
                Use your email and password to access your account.
              </Typography>

              <ContentBox>
                <Formik
                  sx={{ mt: 1 }}
                  onSubmit={handleFormSubmit}
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                  }) => (
                    <form onSubmit={handleSubmit}>
                      <TextField
                        fullWidth
                        size="medium"
                        type="email"
                        name="email"
                        label="Email address"
                        variant="outlined"
                        onBlur={handleBlur}
                        value={values.email}
                        onChange={handleChange}
                        helperText={touched.email && errors.email}
                        error={Boolean(errors.email && touched.email)}
                        sx={{
                          mb: 2.5,
                          "& input": { backgroundColor: "transparent" },
                          "& input:-webkit-autofill, & input:-webkit-autofill:focus, & input:-webkit-autofill:hover":
                            {
                              WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
                              WebkitTextFillColor: theme.palette.text.primary,
                              caretColor: theme.palette.text.primary,
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

                      <TextField
                        fullWidth
                        size="medium"
                        name="password"
                        type="password"
                        label="Password"
                        variant="outlined"
                        onBlur={handleBlur}
                        value={values.password}
                        onChange={handleChange}
                        helperText={touched.password && errors.password}
                        error={Boolean(errors.password && touched.password)}
                        sx={{
                          mb: 1.5,
                          "& input": { backgroundColor: "transparent" },
                          "& input:-webkit-autofill, & input:-webkit-autofill:focus, & input:-webkit-autofill:hover":
                            {
                              WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
                              WebkitTextFillColor: theme.palette.text.primary,
                              caretColor: theme.palette.text.primary,
                            },
                        }}
                      />

                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        mb={2}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox value="remember" color="primary" />
                          }
                          label="Remember me"
                        />
                        <NavLink
                          to="/session/forgot-password"
                          style={{
                            color: theme.palette.primary.main,
                            textDecoration: "none",
                            fontWeight: 600,
                          }}
                        >
                          Forgot password?
                        </NavLink>
                      </Box>

                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{ mt: 1.5 }}
                      >
                        Sign In
                      </Button>
                    </form>
                  )}
                </Formik>
              </ContentBox>
            </Box>
          </Grid>
        </Grid>
      </AuthCard>
    </AuthRoot>
  );
};

export default JwtLogin;
