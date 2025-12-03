import React, { useState } from "react";
import { Box } from "@mui/material";
import TabBar from "app/formComponents/TabBar";
import DataTableManagement from "../datatablemanagement/DataTableManagement";
import OptionsTable from "./OptionsTable";
import StructureOptions from "./structureoptoins/StructureOptions";

const DataTableMain: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return <DataTableManagement />;
      case 1:
        return <OptionsTable />;
      case 2:
        return <StructureOptions />;
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
          tabs={["Data Tables", "Options Table", "Structure Options"]}
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

export default DataTableMain;
