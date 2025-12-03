import React, { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import appStore from "app/mobxStore/AppStore";
import { api } from "api/API";
import TextInputField from "app/components/regularinputs/TextInpuField";
import ProfileImageField from "app/formComponents/ProfileImageField";

interface UserProfileData {
  setUserProfileData: (data: any) => void;
  avatar?: string;
  onLoad?: Function;
}

const UserProfile: React.FC<UserProfileData> = ({
  setUserProfileData,
  avatar,
  onLoad,
}) => {
  const userid = appStore.loginResponse.user[0].userId;

  const [formValues, setFormValues] = useState({
    userPhoneOne: "",
    userEmail: "",
    userFirstName: "",
    userLastName: "",
    userId: userid,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.post("user-details", {
          body: { userId: userid },
        });
        if (response.success) {
          const userData = response.data[0];
          setFormValues({
            userId: userData.userId,
            userPhoneOne: userData.userPhoneOne,
            userEmail: userData.userEmail,
            userFirstName: userData.userFirstName,
            userLastName: userData.userLastName,
          });
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormValues((prev) => {
      const updatedFormValues = { ...prev, [id]: value };
      setUserProfileData(updatedFormValues);
      return updatedFormValues;
    });
  };

  const userFields = [
    {
      id: "profileImage",
      label: "Profile Image",
      type: "profileImage",
      userId: userid,
      avatar: avatar,
    },
    { id: "userFirstName", label: "First Name" },
    { id: "userLastName", label: "Last Name" },
    { id: "userEmail", label: "Email" },
    { id: "userPhoneOne", label: "Phone Number" },
  ];

  return (
    <Box sx={{ padding: 2, width: "100%", height: "100%" }}>
      <Grid container spacing={3}>
        {userFields.map((field) => (
          <Grid item xs={field.type === "profileImage" ? 12 : 6} key={field.id}>
            <Box>
              <Typography
                variant="caption"
                align="left"
                gutterBottom
                sx={{ fontSize: "0.60rem", color: "#6b6b6b" }}
              >
                {field.label}
              </Typography>

              {field.type === "profileImage" ? (
                <ProfileImageField
                  userId={field.userId}
                  avatar={field.avatar}
                  onLoad={onLoad}
                  userFirstName={formValues.userFirstName}
                  userLastName={formValues.userLastName}
                  avatarSize={100}
                />
              ) : (
                <TextInputField
                  id={field.id}
                  label={field.label}
                  value={formValues[field.id]}
                  onChange={handleChange}
                />
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default UserProfile;
