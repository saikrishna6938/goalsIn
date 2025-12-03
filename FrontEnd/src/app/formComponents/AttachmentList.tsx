import React, { useEffect, useState } from "react";
import {
  Button as MuiButton,
  Menu,
  MenuItem,
  IconButton,
  ListItem as MuiListItem,
  List,
  styled,
  Box,
  Typography,
  Icon,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import HeaderTypography from "./HeaderTypography";
import { api } from "api/API";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { Themecolors } from "api/Colors";
import { observer } from "mobx-react";

const ListItem = styled(MuiListItem)(({ theme }) => ({
  border: "1px solid #ccc",
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1),
  justifyContent: "space-between",
}));

const Button = styled(MuiButton)({
  height: "50px",
  width: "100%",
  variant: "text",
  textAlign: "left",
  justifyContent: "flex-start",
});

interface Attachment {
  id: number;
  name: string;
}

interface Props {
  attachments: string[];
  onOpenAttachment: (file: any) => void;
  showHeader?: boolean;
}

const AttachmentList: React.FC<Props> = observer(
  ({ attachments, onOpenAttachment, showHeader = true }) => {
    const [files, setFiles] = useState<any[]>([]);

    useEffect(() => {
      const fetchFiles = async () => {
        let tempFiles = [];
        for (let uploadName of attachments) {
          try {
            const res = await api.post(`get/file`, {
              body: {
                uploadName: uploadName,
              },
            });
            if (res.status) tempFiles.push(res.data);
          } catch (error) {
            console.error("Error fetching file:", error);
          }
        }
        setFiles(tempFiles);
      };
      fetchFiles();
    }, [attachments]);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [currentAttachment, setCurrentAttachment] = useState<null | any>(
      null
    );

    const handleClick = (
      event: React.MouseEvent<HTMLButtonElement>,
      attachment: any
    ) => {
      setAnchorEl(event.currentTarget);
      setCurrentAttachment(attachment);
    };

    const handleClose = () => {
      setAnchorEl(null);
      setCurrentAttachment(null);
    };
    const getIcon = (fileName: string) => {
      const fileExtension = fileName.split(".").pop()?.toLowerCase();

      switch (fileExtension) {
        case "pdf":
          return <PictureAsPdfIcon />;
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
          return <ImageIcon />;
        default:
          return <Icon>attach_file</Icon>; // Default icon for unknown file types
      }
    };

    const handleDownload = async (file: any) => {
      try {
        // Assuming that your API returns a JSON with a `fileData` attribute that contains the Blob data
        const response = await api.post("get/filedata", {
          body: {
            uploadId: file.uploadId,
          },
        });
        const link = document.createElement("a");
        link.href = response.data.fileData;
        link.setAttribute("download", file.fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error("Error downloading file:", error);
      }
    };

    const handleAction = (action: string) => {
      if (action === "Open" && currentAttachment) {
        onOpenAttachment(currentAttachment);
      } else if (action === "Download" && currentAttachment) {
        handleDownload(currentAttachment);
      }
      handleClose();
    };

    return (
      <>
        <Box
          sx={{
            overflowX: "hidden",
          }}
        >
          {showHeader && (
            <Box sx={{ width: "100%" }}>
              <HeaderTypography key={"attachment-header"} title="Attachments" />
            </Box>
          )}
          <div
            style={{
              maxHeight: "calc(100vh - 143px)",
              overflowY: "auto",
              overflowX: "hidden",
              width: "100%",
              padding: "8px",
              paddingRight: "30px",
            }}
          >
            <List
              key={"attachment-list"}
              sx={{ paddingTop: 0.5, paddingBottom: 0 }}
            >
              {files.length === 0 ? (
                <Typography
                  sx={{ fontSize: 14, fontWeight: 400, padding: 1.5 }}
                >
                  No attachments uploaded
                </Typography>
              ) : (
                <>
                  {files.map((file, i) => (
                    <ListItem
                      key={i}
                      sx={{
                        padding: 0,
                      }}
                    >
                      <Box sx={{ ml: "5px", mt: "7px" }}>
                        {getIcon(file.fileName)}
                      </Box>{" "}
                      <Button
                        sx={{
                          padding: 0,
                          paddingLeft: 1,
                          color: Themecolors.main_bg1,
                        }}
                      >
                        {file.fileName.length > 25
                          ? `${file.fileName.substring(0, 20)}...`
                          : file.fileName}
                      </Button>
                      <IconButton
                        aria-label="more"
                        aria-controls="long-menu"
                        aria-haspopup="true"
                        onClick={(event) => handleClick(event, file)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    key={`menu-options`}
                  >
                    <MenuItem onClick={() => handleAction("Open")}>
                      Open
                    </MenuItem>
                    <MenuItem onClick={() => handleAction("Download")}>
                      Download
                    </MenuItem>
                  </Menu>
                </>
              )}
            </List>
          </div>
        </Box>
      </>
    );
  }
);

export default AttachmentList;
