import React, { useEffect, useState } from "react";
import { Provider } from "mobx-react";
import GenericForm from "app/formComponents/GenericForm";
import * as Yup from "yup";
import { api } from "api/API";
import Toast, { ToastProps } from "app/formComponents/Toast";
import { Box } from "@mui/material";
import appStore from "app/mobxStore/AppStore";
import { User } from "app/types/User";

interface UserFormProps {
  user: User;
  reloadUsers: Function;
}
function UserForm(props: UserFormProps) {
  const usertype = appStore.loginResponse.user[0].userType;
  const { user, reloadUsers } = props;
  const initialValues: User = user;
  const userId = user?.userId;
  const [avatar, setAvatar] = useState<string>("");

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
          userId: userId,
        },
      });

      setAvatar(res.data[0].avatar);
    } catch (error) {
      throw error;
    }
  };

  const fields = [
    { name: "userName", label: "Username", type: "string" },
    {
      name: "profileImage",
      label: "Profile Image",
      type: "profileImage",
      userId: user.userId,
      avatar: avatar,
    },
    { name: "userEmail", label: "Email", type: "email" },
    { name: "userFirstName", label: "First Name", type: "string" },
    { name: "userLastName", label: "Last Name", type: "string" },
    {
      name: "userPassword",
      label: "Password",
      type: "password",
      autoComplete: "off",
    },
    { name: "userAddress", label: "Address", type: "string" },
    { name: "userPhoneOne", label: "Phone Number", type: "numeric" },
    // { name: "userServerEmail", label: "Server Email", type: "email" },
    // { name: "userPhoneTwo", label: "Phone 2", type: "numeric" },
    {
      name: "userEnabled",
      label: "Enabled",
      type: "dropdown",
      selections: [
        { id: 0, name: "Yes" },
        { id: 1, name: "No" },
      ],
    },
    {
      name: "userLocked",
      label: "Locked",
      type: "dropdown",
      selections: [
        { id: 0, name: "No" },
        { id: 1, name: "Yes" },
      ],
    },
    {
      name: "userType",
      label: "User Type",
      type: "dropdown",
      selections:
        usertype <= 1
          ? [
              { id: 1, name: "Admin" },
              { id: 2, name: "Default" },
              { id: 3, name: "Job" },
              { id: 4, name: "Entity Admin" },
              { id: 5, name: "Super Admin" },
            ]
          : [{ id: 2, name: "Default" }],
    },
  ];

  const validationSchema = Yup.object({
    userName: Yup.string()
      .required("Username is required")
      .matches(
        /^[a-zA-Z0-9]+$/,
        "Username cannot contain spaces or special characters"
      ),
    userEmail: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    userFirstName: Yup.string().required("First Name is required"),
    userLastName: Yup.string().required("Last Name is required"),
    userAddress: Yup.string().required("Address is required"),
    // userServerEmail: Yup.string()
    //   .email("Invalid server email format")
    //   .required("Server Email is required"),
    userPhoneOne: Yup.string()
      .required("Phone 1 is required")
      .matches(/^[0-9]+$/, "Phone 1 must be only digits"),
    // userPhoneTwo: Yup.string()
    //   .required("Phone 2 is required")
    //   .matches(/^[0-9]+$/, "Phone 2 must be only digits"),
    userEnabled: Yup.mixed()
      .oneOf([1, 0, "Yes", "No"])
      .transform((value) => (value === "Yes" ? 1 : value === "No" ? 0 : value))
      .required("User enabled is required"),

    userLocked: Yup.mixed()
      .oneOf([0, 1, "Yes", "No"], "Invalid value for Locked")
      .transform((value) => (value === "Yes" ? 1 : value === "No" ? 0 : value))
      .required("User locked is required"),
  });

  const handleOnSubmit = (values) => {
    let url = "update-user";
    let body = {};
    let entity = appStore.selectedEntity > 0 ? appStore.selectedEntity : 1;
    if (values.userId < 0) {
      url = `create-user/${entity}`;
      body = { ...values, entities: appStore.userEntities[0].entityId };
    } else {
      body = { ...values };
    }

    api
      .post(`${url}`, {
        body: body,
      })
      .then((res) => {
        reloadUsers();
        appStore.showToast(res.message, res.success ? "success" : "error");
      })
      .catch((error) => {
        appStore.showToast(
          "The  details entered already exist. Please enter different details.",
          "error"
        );
      });
  };

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      sx={{
        height: "100%",
        backgroundColor: "white",
        mt: "5px",
      }}
    >
      <GenericForm
        fields={fields.map((field) => {
          if (field.name === "userPassword") {
            return { ...field, attributes: { "data-lpignore": "true" } };
          }
          return field;
        })}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleOnSubmit}
        columns={2}
        readOnly={false}
        avatar={avatar}
        onLoad={() => {
          fetchUserAvatar();
        }}
      />
    </Box>
  );
}

export default UserForm;

export const currentUser: User = {
  userId: -1,
  userName: "",
  userEmail: "",
  userFirstName: "",
  userLastName: "",
  userPassword: "",
  userAddress: "",
  // userServerEmail: "",
  userPhoneOne: "",
  // userPhoneTwo: "",
  userEnabled: 0,
  userLocked: 0,
  userType: 2,
};
