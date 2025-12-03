import React, { useState } from "react";
import { Box } from "@mui/material";
import DocumentManagement from "./DocumentManagement";
import TabBar from "app/formComponents/TabBar";
import DocumentTag from "./DocumentTag";

const DocumentManagementMain: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return <DocumentManagement />;
      case 1:
        return <DocumentTag />;

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
          tabs={["Document", "Document Tag"]}
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

export default DocumentManagementMain;
