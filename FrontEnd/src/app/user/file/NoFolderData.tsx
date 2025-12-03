import React from "react";
import { Box, Typography } from "@mui/material";
import { InsertDriveFile, FolderOpen } from "@mui/icons-material";

interface EmptyStateProps {
  type?: "files" | "folders" | "both";
  title?: string;
  subtitle?: string;
  height?: string;
}

const NoFolderData: React.FC<EmptyStateProps> = ({
  type = "files",
  title,
  subtitle,
  height = "80%",
}) => {
  const iconsMap = {
    files: InsertDriveFile,
    folders: FolderOpen,
    both: FolderOpen,
  };

  const defaultTitleMap = {
    files: "No Files Added",
    folders: "No Folders Found",
    both: "No Files or Folders Found",
  };

  const defaultSubtitleMap = {
    files: "Start by uploading a new file",
    folders: "Create your first folder",
    both: "Add some files or folders to get started",
  };
  const IconComponent = iconsMap[type];

  return (
    <Box
      sx={{
        height: height,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: (t) => t.palette.text.secondary,
        textAlign: "center",
        gap: 2,
        p: 2,
        boxSizing: "border-box",
      }}
    >
      {IconComponent && <IconComponent sx={{ fontSize: 64, opacity: 0.6 }} />}
      <Typography variant="h5" fontWeight={700} sx={{ mt: 2 }}>
        {title || defaultTitleMap[type]}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
        {subtitle || defaultSubtitleMap[type]}
      </Typography>
    </Box>
  );
};

export default NoFolderData;
