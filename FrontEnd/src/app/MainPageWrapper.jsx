import React from "react";
import { observer } from "mobx-react";
import EntityDialog from "../app/dialogs/EntityDialog";
import { Box } from "@mui/material";

const MainPageWrapper = observer(({ children }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <EntityDialog />
      <Box
        sx={{
          height: "96%",
          width: "98%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          overflowY: "auto",
          borderRadius: "4px",
          overflowX: "hidden",
          pb: 2,
        }}
      >
        {children}
      </Box>
    </div>
  );
});

export default MainPageWrapper;
