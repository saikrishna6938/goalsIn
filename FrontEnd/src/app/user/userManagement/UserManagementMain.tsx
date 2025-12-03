import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import TabBar from "app/formComponents/TabBar";
import Users from "./Users";
import CreateUserRoles from "./CreateUserRoles";
import appStore from "app/mobxStore/AppStore";
import RolesType from "./RolesType";
import UserProfileType from "./UserProfileType";

const UserManagementMain: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const usertype = appStore.loginResponse.user[0].userType;

  const navigate = useNavigate();
  const location = useLocation();

  const tabPaths =
    usertype === -1
      ? [
          "/user/users",
          "/user/user-roles",
          "/user/roles-type",
          "/user/user-profile",
        ]
      : ["/user/users"];

  useEffect(() => {
    const index = tabPaths.findIndex((p) => location.pathname.startsWith(p));
    if (index !== -1) {
      setSelectedTab(index);
    }
  }, [location.pathname]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    navigate(tabPaths[newValue]);
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return <Users />;
      case 1:
        return <CreateUserRoles />;
      case 2:
        return <RolesType />;
      case 3:
        return <UserProfileType />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        height: "calc(100vh - 95px)",
        maxHeight: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ width: "100%" }}>
        <TabBar
          value={selectedTab}
          onChange={handleTabChange}
          tabs={
            usertype === -1
              ? ["Users", "User Roles", "Roles Type", "User Profile"]
              : ["Users"]
          }
        />
      </Box>
      <Box
        sx={{
          flex: 1,
          width: "100%",
          overflow: "hidden",
          mt: "2px",
        }}
      >
        {renderTabContent()}
      </Box>
    </div>
  );
};

export default UserManagementMain;
