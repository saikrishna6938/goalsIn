import React, { useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import Slide from "@mui/material/Slide";
import { observer } from "mobx-react-lite";
import appStore from "app/mobxStore/AppStore";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

const Toast: React.FC = observer(() => {
  const { toastOpen, toastMessage, toastSeverity } = appStore;

  const handleClose = () => {
    appStore.setToastOpen(false);
    appStore.clearToast();
  };

  useEffect(() => {
    if (toastOpen) {
      setTimeout(() => {
        appStore.setToastOpen(false);
        appStore.clearToast();
      }, 2000);
    }
  }, [toastOpen]);

  return (
    <Snackbar
      open={toastOpen}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      TransitionComponent={(props: any) => (
        <Slide {...props} direction="left" />
      )}
    >
      <Alert onClose={handleClose} severity={toastSeverity}>
        {toastMessage}
      </Alert>
    </Snackbar>
  );
});

export default Toast;
