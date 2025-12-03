import React from "react";
import { Avatar, Box, Button, Typography } from "@mui/material";
import styled from "@emotion/styled";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SaveIcon from "@mui/icons-material/Save";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import EditIcon from "@mui/icons-material/Edit";
export interface UserProps {
  ShowsaveButton?: Boolean;
  ButtonName?: string;
  onButtonClick?: () => void;
  userInfoComponent?: React.ReactNode;
  CopyPastButton?: boolean;
  onCopyButtonClick?: () => void;
  onPastButtonClick?: () => void;
  copied?: boolean;
  ShowEditButton?: boolean;
  onEditButtonClick?: () => void;
}
export const UserHeaderBox = styled(Box)`
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: palette.primary.dark;
`;

export const UserInfoBox = styled(Box)`
  margin-left: 16px;
`;

const ParentBox = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const UserHeaderComponent: React.FC<UserProps> = ({
  ShowsaveButton,
  ButtonName,
  onButtonClick,
  userInfoComponent,
  CopyPastButton = false,
  onCopyButtonClick,
  onPastButtonClick,
  copied,
  ShowEditButton = false,
  onEditButtonClick,
}) => {
  return (
    <ParentBox>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        {userInfoComponent}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            padding: "8px",
            marginLeft: "auto",
          }}
        >
          {CopyPastButton && !copied && (
            <Tooltip title="Copy">
              <IconButton onClick={onCopyButtonClick}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          )}

          {CopyPastButton && copied && (
            <Tooltip title="Past">
              <IconButton onClick={onPastButtonClick}>
                <ContentPasteIcon />
              </IconButton>
            </Tooltip>
          )}

          {ShowsaveButton && (
            <Tooltip title={ButtonName || "Save"}>
              <IconButton type="submit" onClick={onButtonClick}>
                <SaveIcon />
              </IconButton>
            </Tooltip>
          )}
          {ShowEditButton && (
            <Tooltip title="Edit">
              <IconButton onClick={onEditButtonClick}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </ParentBox>
  );
};

export default UserHeaderComponent;
