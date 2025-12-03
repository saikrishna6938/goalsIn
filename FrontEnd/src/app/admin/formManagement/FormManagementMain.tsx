import React, { useState } from "react";
import { Box } from "@mui/material";
import TabBar from "app/formComponents/TabBar";

import appStore from "app/mobxStore/AppStore";
import FormManagement from "./FormManagement";

const FormManagementMain: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const usertype = appStore.loginResponse.user[0].userType;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return <FormManagement />;
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
          tabs={["Form"]}
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

export default FormManagementMain;
