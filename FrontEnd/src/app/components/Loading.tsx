import { Box } from "@mui/material";
import React from "react";

function Loading() {
  const loaderStyle = {
    border: "8px solid #e3f2fd",
    borderTop: "8px solid #007bff",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    margin: "auto",
    animation: "spin 0.5s linear infinite",
  };

  return (
    <Box
      sx={{
        height: "95%",
        width: "95%",
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        <style>
          {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
        </style>
        <div style={loaderStyle}></div>
      </div>{" "}
    </Box>
  );
}

export default Loading;
