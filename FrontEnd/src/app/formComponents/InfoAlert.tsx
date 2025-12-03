// InfoAlert.tsx
import React from "react";
import Alert, { AlertColor } from "@mui/material/Alert";
import InfoIcon from "@mui/icons-material/Info";

interface InfoAlertProps {
  message: string;
  severity: AlertColor;
}

const InfoAlert: React.FC<InfoAlertProps> = ({ message, severity }) => {
  return (
    <Alert
      sx={{ margin: 2 }}
      severity={severity}
      icon={<InfoIcon fontSize="inherit" />}
    >
      {message}
    </Alert>
  );
};

export default InfoAlert;
