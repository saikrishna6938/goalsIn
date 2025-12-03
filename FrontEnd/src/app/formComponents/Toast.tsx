import React from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import Slide from "@mui/material/Slide";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

export interface ToastProps {
  open: boolean;
  onClose: () => void;
  message?: string;
  severity?: "error" | "success" | "info" | "warning";
  autoHideDurationDefault?: number;
}

// Define the Slide transition
function TransitionRight(props: any) {
  return <Slide {...props} direction="left" />;
}

const Toast: React.FC<ToastProps> = ({
  open,
  onClose,
  message,
  severity = "success",
  autoHideDurationDefault = 6000,
}) => {
  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: "top", horizontal: "right" }} // Position at the top right
      autoHideDuration={autoHideDurationDefault}
      onClose={onClose}
      TransitionComponent={TransitionRight} // Use the Slide transition
    >
      <Alert onClose={onClose} severity={severity}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
