import { useTheme } from "@emotion/react";
import { LoadingButton } from "@mui/lab";
import { Card, Checkbox, Grid, TextField } from "@mui/material";
import { Box, styled } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import { Paragraph } from "app/components/Typography";
import useAuth from "app/hooks/useAuth";
import { Formik } from "formik";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Typography from "@mui/material/Typography";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { color } from "echarts";
import SimpleDialog from "../../dialogs/SimpleDialog";

const FlexBox = styled(Box)(() => ({ display: "flex", alignItems: "center" }));

const JustifyBox = styled(FlexBox)(() => ({ justifyContent: "center" }));

const ContentBox = styled(JustifyBox)(() => ({
  height: "100%",
  padding: "32px",
  background: "rgba(0, 0, 0, 0.01)",
}));

const JWTRegister = styled(JustifyBox)(() => ({
  background: "#1A2038",
  minHeight: "100vh !important",
  "& .card": {
    maxWidth: 800,
    minHeight: 400,
    margin: "1rem",
    display: "flex",
    borderRadius: 12,
    alignItems: "center",
  },
}));

// inital login credentials
const initialValues = {
  email: "",
  fistname: "",
  lastname: "",
  password: "",
  username: "",
  remember: false,
};

// form field validation schema
const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password must be 6 character length")
    .required("Password is required!"),
  email: Yup.string()
    .email("Invalid Email address")
    .required("Email is required!"),
  firstname: Yup.string().required("Required"),
  lastname: Yup.string().required("Required"),
});

const JwtRegister = () => {
  const theme = useTheme();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [alertSeverity, setAlertseverity] = useState("sucess");

  const handleFormSubmit = async (values) => {
    setLoading(true);

    try {
      await register(
        values.email,
        values.username,
        values.password,
        values.firstname,
        values.lastname
      );
      setShowPrompt(true);
      setShowAlert("Registration successful! You can now log in.");
      setAlertseverity("success");
    } catch (e) {
      if (e == "Error: ER_DUP_ENTRY") {
        setShowPrompt(true);
        setShowAlert("This email is already in use. Please try signing in.");
        setAlertseverity("error");
      } else {
        setShowPrompt(true);
        setShowAlert("Something went wrong. Please try again.");
        setAlertseverity("error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <JWTRegister>
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundImage: `url(${"/assets/images/illustrations/transparant.PNG"})`,
          backgroundColor: "#263238",
          backgroundSize: "cover",
          height: "100vh",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <Card
          backgroundColor="white"
          sx={{
            border: "3px solid",
            color: "#cfd8dc",
            my: 7,
            marginRight: "5%",
            maxWidth: "500px",
            marginBottom: "7%",
          }}
        >
          {showPrompt && (
            <SimpleDialog
              show={showPrompt}
              description={showAlert}
              title="Sign up"
              buttonText="Close"
              onClose={() => {
                if (
                  showAlert === "Registration successful! You can now log in."
                )
                  navigate("/session/signin");
                else {
                  setShowAlert("");
                  setShowPrompt(false);
                }
              }}
            />
          )}
          <CssBaseline />
          <Container component="main" maxWidth="xs" sx={{ mb: 2 }}>
            <Avatar sx={{ m: 1, bgcolor: "secondary.main", marginLeft: "43%" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography
              alignItems={"center"}
              component="h1"
              variant="h5"
              sx={{ marginLeft: "38%", mb: 2, color: "#263238" }}
            >
              Sign up
            </Typography>
            <Box>
              <Formik
                sx={{ mt: 2 }}
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
                      size="small"
                      type="text"
                      name="username"
                      label="Username"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.username}
                      onChange={handleChange}
                      autoComplete="false"
                      helperText={touched.username && errors.username}
                      error={Boolean(errors.username && touched.username)}
                      sx={{ mb: 3 }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      type="text"
                      name="firstname"
                      label="First Name"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.firstname}
                      onChange={handleChange}
                      helperText={touched.firstname && errors.firstname}
                      error={Boolean(errors.firstname && touched.firstname)}
                      sx={{ mb: 3 }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      type="text"
                      name="lastname"
                      label="Last Name"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.lastname}
                      onChange={handleChange}
                      helperText={touched.lastname && errors.lastname}
                      error={Boolean(errors.lastname && touched.lastname)}
                      sx={{ mb: 3 }}
                    />

                    <TextField
                      fullWidth
                      size="small"
                      type="email"
                      name="email"
                      label="Email"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.email}
                      onChange={handleChange}
                      helperText={touched.email && errors.email}
                      error={Boolean(errors.email && touched.email)}
                      sx={{ mb: 3 }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      name="password"
                      type="password"
                      label="Password"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.password}
                      onChange={handleChange}
                      helperText={touched.password && errors.password}
                      error={Boolean(errors.password && touched.password)}
                      sx={{ mb: 2 }}
                    />

                    <FlexBox gap={1} alignItems="center">
                      <Checkbox
                        size="small"
                        name="remember"
                        onChange={handleChange}
                        checked={values.remember}
                        sx={{ padding: 0 }}
                      />

                      <Paragraph fontSize={13}>
                        I have read and agree to the terms of service.
                      </Paragraph>
                    </FlexBox>

                    <LoadingButton
                      fullWidth
                      type="submit"
                      color="primary"
                      loading={loading}
                      variant="contained"
                      sx={{ mb: 2, mt: 3 }}
                    >
                      Regiser
                    </LoadingButton>

                    <Paragraph sx={{ ml: 10, mt: 1 }}>
                      Already have an account?
                      <NavLink
                        to="/session/signin"
                        style={{
                          color: theme.palette.primary.main,
                          marginLeft: 5,
                        }}
                      >
                        Login
                      </NavLink>
                    </Paragraph>
                  </form>
                )}
              </Formik>
            </Box>
          </Container>
        </Card>
      </Card>
    </JWTRegister>
  );
};

export default JwtRegister;
