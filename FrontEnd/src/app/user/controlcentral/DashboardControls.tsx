import React, { useEffect, useState } from "react";
import Data from "./controlData.json";
import { Box, Button, Card, Icon, Paper, styled } from "@mui/material";
import { json, useNavigate } from "react-router-dom";
import { Themecolors } from "api/Colors";
import { Margin } from "@mui/icons-material";
import StyledCardComponent from "./StyledCardComponent";
import { api } from "api/API";
import { IndexType } from "app/types/User";
import FilteredSearch from "app/components/regularinputs/FilteredSearch";

const DashboardControls: React.FC = () => {
  const navigate = useNavigate();
  const [selctedId, SetSelectedId] = useState<number>(null);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadInit();
  }, []);

  const loadInit = async () => {
    const res = await api.get("user/controls");
    setData(res.data);
  };
  const handleCall = (id: number) => {
    SetSelectedId(id);
    navigate(`/user/dashboard_control/${id}`);
  };

  return (
    <Paper sx={{ height: "100%", width: "100%", p: 1.5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
          p: 1.5,
          borderRadius: 1,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          background: "linear-gradient(to bottom, #fafafa 0%, #ffffff 100%)",
        }}
      >
        <FilteredSearch
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth={false}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          p: 2,
          height: "calc(100% - 90px)",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {data
          .filter((doc) =>
            doc.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((doc) => (
            <StyledCardComponent
              key={doc.controlCenterId}
              icon={doc.indexType === IndexType.APPLY ? "group" : "taskalt"}
              title={doc.name}
              onClick={() => handleCall(doc.controlCenterId)}
            />
          ))}
      </Box>
    </Paper>
  );
};

export default DashboardControls;
