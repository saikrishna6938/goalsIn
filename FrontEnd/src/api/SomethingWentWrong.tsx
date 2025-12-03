import React from "react";
import ErrorIcon from "@mui/icons-material/Error";
import { Box } from "@mui/material";

function SomthingWentWrong() {
  const Reload = () => {
    window.location.reload();
  };
  return (
    <div style={{ backgroundColor: "white", height: "100%", width: "100%" }}>
      <Box
        paddingTop={19}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            maxWidth: "100vw",
            color: "#757575",
          }}
        >
          <ErrorIcon style={{ fontSize: "6vw", color: "#616161" }} />
          <h1 style={{ marginLeft: "8px", fontSize: "4vw" }}>
            Somthing went wrong
          </h1>
        </div>
      </Box>
      <Box
        position={"relative"}
        bottom={"4vh"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto",
        }}
      >
        <div style={{ color: "#757575" }}>
          <h3>We coudn't completed the request-please reload the page</h3>
          <h3 style={{ color: "blue", textDecoration: "underline" }}>
            <a href="/" onClick={Reload}>
              Reload
            </a>
          </h3>
          <h3 style={{ color: "blue", textDecoration: "underline" }}>
            <a href="/dashboard/default">Go to home page</a>
          </h3>
        </div>
      </Box>
    </div>
  );
}

export default SomthingWentWrong;
