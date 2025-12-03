import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import appStore from "app/mobxStore/AppStore";
import TextInputField from "app/components/regularinputs/TextInpuField"; // Assuming this is your reusable TextField component

interface UpdatePasswordProps {
  setUserProfileData: (payload: {
    userId: string;
    userPassword: string;
  }) => void;
  setPasswordValid: (isValid: boolean) => void;
}

const UpdatePassword: React.FC<UpdatePasswordProps> = ({
  setUserProfileData,
  setPasswordValid,
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const userId = appStore.loginResponse.user[0].userId;

  const isValidPass = newPassword === confirmPassword;
  setPasswordValid(isValidPass);

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);
    if (password === "") {
      setNewPasswordError("New password can't be blank");
    } else if (password.length < 6) {
      setNewPasswordError("Password must be at least 6 characters");
    } else {
      setNewPasswordError("");
    }
    setConfirmPassword("");
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const confirmPassword = e.target.value;
    setConfirmPassword(confirmPassword);
    if (confirmPassword !== newPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  useEffect(() => {
    let isValid = true;

    if (confirmPassword !== newPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }

    if (!isValid) return;

    const payload = {
      userId: String(userId),
      userPassword: newPassword,
    };

    setUserProfileData(payload);
  }, [newPassword, confirmPassword, userId, setUserProfileData]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: 400,
          padding: "2em",
          borderRadius: 2,
          marginX: "1em",
        }}
      >
        <form id="update_password_form" className="form">
          <Box>
            <Typography
              variant="caption"
              align="left"
              sx={{
                fontSize: "0.75rem",
                color: "#6b6b6b",
                paddingBottom: "8px",
              }}
            >
              New Password
            </Typography>
            <TextInputField
              id="new_password"
              label="New Password"
              value={newPassword}
              onChange={handleNewPasswordChange}
              type="password"
              error={!!newPasswordError}
              helperText={newPasswordError}
            />
          </Box>
          <Box sx={{ mt: "1.5em" }}>
            <Typography
              variant="caption"
              align="left"
              sx={{
                fontSize: "0.75rem",
                color: "#6b6b6b",
                paddingBottom: "8px",
              }}
            >
              Confirm Password
            </Typography>
            <TextInputField
              id="confirm_password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              // type="password"
              error={!!confirmPasswordError}
              helperText={confirmPasswordError}
            />
          </Box>
        </form>
      </Box>
    </>
  );
};

export default UpdatePassword;
