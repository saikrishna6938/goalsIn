import React from "react";
import WarningIcon from "@mui/icons-material/Warning";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";

const StyledButton = styled(Button)({
  height: "2.2em",
  border: "1px solid #616161",
  color: "#424242",
  padding: "0 10px",
  "&:hover": {
    color: "black",
    border: "1px solid black",
  },
});

interface TaskData {
  taskId: string | number;
}

const GetTaskNoData: React.FC<TaskData> = ({ taskId }) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: (t) => t.palette.text.secondary,
        textAlign: "center",
        gap: 2,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 1.5 }}>
        <WarningIcon sx={{ fontSize: 55, opacity: 0.6, color: "#616161" }} />

        <Typography fontWeight={600} sx={{ fontSize: 20, color: "#616161" }}>
          Cannot access document
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ fontSize: 13, p: 1, fontWeight: 500 }}
        >
          Document {taskId} does not exist or you do not have access to it.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: "1em" }}>
        <StyledButton onClick={() => navigate(-1)}>Go Back</StyledButton>
        <StyledButton onClick={() => navigate("/dashboard/default")}>
          Go Home
        </StyledButton>
      </Box>
    </Box>
  );
};

export default GetTaskNoData;
