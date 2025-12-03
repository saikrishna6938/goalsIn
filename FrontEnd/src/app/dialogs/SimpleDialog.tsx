import React, { FC, ReactElement, forwardRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { styled } from "@mui/system";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { Navigate, useNavigate } from "react-router-dom";

interface DialogProps {
  title: string;
  description: string;
  buttonText?: string;
  show: boolean;
  onClose?: Function;
}

export const Transition = forwardRef(function Transition(
  props: TransitionProps & { children?: ReactElement },
  ref: React.Ref<unknown>
) {
  //@ts-ignore
  return <Slide direction="down" ref={ref} {...props} timeout={1000} />;
});
const StyledDialogTitle = styled(DialogTitle)({
  backgroundColor: "#3f51b5",
  color: "#fff",
});

const StyledDialogContent = styled(DialogContent)({
  margin: 20,
});

const StyledDialogContentText = styled(DialogContentText)({
  margin: 20,
  fontSize: "18px",
});
const StyledDialogActions = styled(DialogActions)({
  backgroundColor: "#dedede",
});

const StyledButton = styled(Button)({
  color: "#000",
});

const SimpleDialog: FC<DialogProps> = ({
  title,
  description,
  buttonText = "Close",
  show = false,
  onClose = () => {},
}) => {
  const [open, setOpen] = useState(show);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        TransitionComponent={Transition}
        disableEscapeKeyDown
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <StyledDialogTitle id="form-dialog-title">{title}</StyledDialogTitle>
        <StyledDialogContent>
          <StyledDialogContentText>{description}</StyledDialogContentText>
        </StyledDialogContent>
        <StyledDialogActions>
          <StyledButton onClick={handleClose} color="primary">
            {buttonText}
          </StyledButton>
        </StyledDialogActions>
      </Dialog>
    </div>
  );
};

export default SimpleDialog;
