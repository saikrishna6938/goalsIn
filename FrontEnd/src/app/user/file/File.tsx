import {
  Box,
  Button,
  IconButton,
  Modal,
  styled,
  TextField,
  Typography,
  Card,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import FolderAddIcon from "@mui/icons-material/Folder";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Themecolors, fonts } from "api/Colors";
import Loading from "app/components/Loading";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  Description,
  FileCopy,
  FolderOff,
  ImageRounded,
  MovieCreationSharp,
} from "@mui/icons-material";
import FilePreviewDialog from "../FilePreview";
import appStore from "app/mobxStore/AppStore";
import { api } from "api/API";
import { FileDetail, getFilesAndFolders } from "./FileTray";
import UploadFileDialog from "./UploadFileDialog";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";
import NoData from "api/NoData";
import PlagiarismTwoToneIcon from "@mui/icons-material/PlagiarismTwoTone";
import NoFolderData from "./NoFolderData";
import TextInputField from "app/components/regularinputs/TextInpuField";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";

//Folder button
// Card style: keep original tile layout (icon on top, text below)
// but apply dashboard-like border, hover and transitions
const TileCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "isSelected",
})<{ isSelected?: boolean }>(({ theme, isSelected }) => ({
  margin: "16px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  height: 180,
  width: 140,
  padding: "0 20px 20px 20px",
  cursor: "pointer",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${
    isSelected ? theme.palette.primary.main : theme.palette.divider
  }`,
  boxShadow: isSelected ? theme.shadows[2] : "none",
  position: "relative",
  overflow: "hidden",
  transition: theme.transitions.create(
    ["transform", "box-shadow", "background-color", "border-color"],
    { duration: theme.transitions.duration.shortest }
  ),
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[3],
    backgroundColor: theme.palette.action.hover,
  },
}));

const TileText = styled("div")({
  whiteSpace: "normal",
  wordBreak: "break-all",
  textOverflow: "ellipsis",
  fontSize: "0.9em",
  maxWidth: "100%",
  lineHeight: "1.4",
  flex: "1 1 auto",
  textAlign: "left",
});

// Removed StyledText in favor of Typography for consistency with cards

interface foldersFilesType {
  files: FileDetail[];
  folders: string[];
}

const File: React.FC = () => {
  const navigate = useNavigate();
  const [fileUploadModalOpen, SetFileUploadModalOpen] = useState(false);
  const [addFoldersModalOpen, SetAddFoldersModalOpen] = useState(false);
  const [refresh, SetRefresh] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [openFile, setOpenFile] = useState(false);
  const [rightClick, SetRightClick] = useState(false);
  const [addnewFolder, setAddNewFolder] = useState("");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [foldersReName, SetFoldersReName] = useState("");
  const [currentFolderPath, setCurrentFolderPath] = useState<any[]>([]);
  const [futureFolderPath, setFutureFolderPath] = useState<any[]>([]);
  const [blobUrl, setBlobUrl] = useState("");
  const [anchorPosition, setAnchorPosition] = useState({ top: 0, left: 0 });
  const [pathName, SetPathName] = useState<string>("Home");
  const UserId = appStore.loginResponse.user[0].userId;
  const [pathDetails, setPathDetails] = useState<any>();
  const [selectedFile, setSelectedFile] = useState(null);
  const [foldersFiles, setFolderFiles] = useState<foldersFilesType>({
    files: [],
    folders: [],
  });

  useEffect(() => {
    const { files, folders } = getFilesAndFolders(pathDetails, pathName);
    setFolderFiles({ files, folders });
  }, [pathDetails, pathName, currentFolderPath]);

  const fetchFolders = async () => {
    try {
      const response = await api.get(`user/intray/${UserId}`);
      setPathDetails(response.pathDetails);
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
    }
  };

  const openDialogPrompt = async (file) => {
    try {
      const response = await api.post("get/filedata", {
        body: {
          uploadId: file.uploadId,
        },
      });
      if (response && response.data && response.data.fileData) {
        setBlobUrl(response.data.fileData);
        setOpenFile(true);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handlecloseDialog = () => {
    setBlobUrl("");
    setOpenFile(false);
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    const pathNames = ["Home", ...currentFolderPath].join("/");

    SetPathName(pathNames);
  }, [currentFolderPath]);

  const handleAddFolder = () => {
    const newFolderPath = [...currentFolderPath, addnewFolder];
    const folderPath = newFolderPath.join("/");

    const newFolder = {
      name: addnewFolder,
      files: [],
    };
    const updatedPathDetails = {
      ...pathDetails,
      [folderPath]: newFolder,
    };
    setPathDetails(updatedPathDetails);
    setCurrentFolderPath(newFolderPath);
    SetAddFoldersModalOpen(false);
    setAddNewFolder("");
  };

  const handleRefresh = () => {
    SetRefresh(true);
    setTimeout(() => {
      SetRefresh(false);
    }, 1000);
    setCurrentFolderPath([]);
    setSelectedItem(null);
  };

  const handleRenameFolder = async () => {
    try {
      const response = await api.post("update_name", {
        body: {
          fileName: foldersReName,
        },
      });
      console.log("res==", response);
    } catch (error) {
      console.log("error", error);
    }
    setRenameModalOpen(false);
    SetFoldersReName("");
  };

  const handleDeleteFiles = async () => {
    try {
      const response = await api.post("delete", {
        body: {
          fileName: foldersReName,
        },
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleIndexDocument = () => {
    if (selectedFile) {
      navigate(`/user/index/${selectedFile.uploadId}`);
    }
  };

  const handleUploadFiles = () => {
    // console.log("files uploaded", file);
  };

  const handleFolderOpen = async (folder: any) => {
    setCurrentFolderPath((prevPath) => [...prevPath, folder]);
  };

  const closeModal = () => {
    SetRightClick(false);
  };

  const HandleSelectedFileOpen = (file) => {
    openDialogPrompt(file);
  };

  const handleGoBack = () => {
    if (currentFolderPath.length > 0) {
      const newCurrentFolderPath = [...currentFolderPath];
      const lastFolder = newCurrentFolderPath.pop();

      setCurrentFolderPath(newCurrentFolderPath);
      setFutureFolderPath((prev) => [lastFolder, ...prev]);
    }
  };

  const handleNext = () => {
    if (futureFolderPath.length > 0) {
      const newFutureFolderPath = [...futureFolderPath];
      const nextFolder = newFutureFolderPath.shift();

      setFutureFolderPath(newFutureFolderPath);
      setCurrentFolderPath((prev) => [...prev, nextFolder]);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentFolderPath(currentFolderPath.slice(0, index + 1));
    console.log("path", currentFolderPath.slice(0, index + 1));
  };

  const handleItemClick = (item: string) => {
    setSelectedItem(item);
  };

  const handleRightCLick = (event, file) => {
    event.preventDefault();
    const { clientX, clientY } = event;
    setAnchorPosition({
      top: clientY,
      left: clientX,
    });
    SetRightClick(true);
    setSelectedFile(file);
    setSelectedItem(file);
  };

  const getFileIcon = (file: any, compact: boolean = false) => {
    const icon = file.fileType.trim().toLowerCase();
    switch (icon) {
      case "image/jpeg":
      case "image/png":
      case "image/gif":
      case "image/bmp":
        return compact ? (
          <ImageRounded sx={{ fontSize: 40 }} />
        ) : (
          <ImageRounded
            style={{
              fontSize: "6.2rem",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        );
      case "application/pdf":
        return compact ? (
          <PictureAsPdfIcon sx={{ fontSize: 40 }} />
        ) : (
          <PictureAsPdfIcon
            style={{
              fontSize: "6.2rem",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        );
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      case "application/msword":
        return compact ? (
          <Description sx={{ fontSize: 40 }} />
        ) : (
          <Description
            style={{
              fontSize: "6.2rem",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        );
      case "video/mp4":
      case "video/avi":
      case "video/mkv":
      case "video/quicktime":
      case "video/webm":
        return compact ? (
          <MovieCreationSharp sx={{ fontSize: 40 }} />
        ) : (
          <MovieCreationSharp
            style={{
              fontSize: "6.2rem",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        );
      default:
        return compact ? (
          <FileCopy sx={{ fontSize: 40 }} />
        ) : (
          <FileCopy
            style={{
              fontSize: "6.2rem",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        );
    }
  };

  // Utility: strip file extension from a filename
  const getBaseName = (name: string) => {
    if (!name) return "";
    const idx = name.lastIndexOf(".");
    return idx > 0 ? name.substring(0, idx) : name;
  };

  return (
    <>
      <Box
        sx={{
          backgroundColor: "#ffffff",
          height: "calc(96vh - 30px)",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: `1px solid ${Themecolors.Button_bg3}`,
          borderRadius: 0,
        }}
      >
        <Box
          sx={{
            backgroundColor: (t) => t.palette.background.paper,
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
            px: 2,
            py: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <PrimaryButton
            startIcon={<UploadIcon />}
            label="Upload"
            onClick={() => SetFileUploadModalOpen(true)}
            height={"1.8rem"}
            border="none"
          />
          <PrimaryButton
            startIcon={<FolderAddIcon />}
            label="Add Folder"
            onClick={() => SetAddFoldersModalOpen(true)}
            height={"1.8rem"}
            border="none"
          />
          <Box sx={{ ml: 2, display: "flex", gap: 1 }}>
            <PrimaryButton
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              label=""
              height={"1.8rem"}
              border="none"
            />
            <PrimaryButton
              startIcon={<MoveToInboxIcon />}
              label="Move"
              height={"1.8rem"}
              border="none"
            />
            <PrimaryButton
              startIcon={<EditIcon />}
              label="Rename"
              onClick={() => setRenameModalOpen(true)}
              height={"1.8rem"}
              border="none"
            />
            <PrimaryButton
              startIcon={<DeleteIcon />}
              label="Delete"
              onClick={handleDeleteFiles}
              height={"1.8rem"}
              border="none"
            />
          </Box>
        </Box>
        <Box
          sx={{
            width: "100%",
            backgroundColor: (t) => t.palette.background.default,
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <Box
            sx={{
              padding: "0.45em",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ArrowBackIcon
              onClick={currentFolderPath.length > 0 ? handleGoBack : null}
              sx={{
                fontSize: "1.1em",
                cursor: currentFolderPath.length > 0 ? "pointer" : "default",
                mr: 2,
                color: (t) =>
                  currentFolderPath.length > 0
                    ? t.palette.text.primary
                    : t.palette.text.disabled,
              }}
            />

            <ArrowForwardIcon
              onClick={futureFolderPath.length > 0 ? handleNext : null}
              sx={{
                fontSize: "1.1em",
                cursor: futureFolderPath.length > 0 ? "pointer" : "default",
                mr: 3,
                color: (t) =>
                  futureFolderPath.length > 0
                    ? t.palette.text.primary
                    : t.palette.text.disabled,
              }}
            />
            <Typography variant="body1">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  color: Themecolors.InputText_Color2,
                  fontWeight: "bold",
                  fontSize: "0.8em",
                  fontFamily: fonts.inter,
                }}
              >
                <Typography
                  sx={{
                    textTransform: "none",
                    fontSize: "1.1em",
                    cursor: "pointer",
                    fontFamily: fonts.inter,
                    "&:hover": {
                      color: Themecolors.Button1,
                    },
                  }}
                  onClick={() => setCurrentFolderPath([])}
                >
                  Home
                </Typography>

                {currentFolderPath.length > 0 && (
                  <span style={{ margin: "3px 5px 0 5px" }}> / </span>
                )}

                {currentFolderPath.map((folder: any, index) => (
                  <React.Fragment key={index}>
                    <Typography
                      sx={{
                        textTransform: "none",
                        cursor: "pointer",
                        fontSize: "1.1em",
                        fontWeight: "1em",
                        fontFamily: fonts.inter,
                        "&:hover": {
                          color: Themecolors.Button1,
                        },
                      }}
                      onClick={() => handleBreadcrumbClick(index)}
                    >
                      {folder}
                    </Typography>

                    {index < currentFolderPath.length - 1 && (
                      <span style={{ margin: "3px 5px 0 5px" }}> / </span>
                    )}
                  </React.Fragment>
                ))}
              </Box>
            </Typography>
          </Box>
        </Box>

        {refresh && (
          <Box sx={{ margin: "2em", mr: "10em" }}>{refresh && <Loading />}</Box>
        )}
        <Box
          sx={{
            display: "flex",
            flex: 1,
            overflowY: "auto",
            height: "100%",
          }}
        >
          {foldersFiles.folders.length === 0 &&
          foldersFiles.files.length === 0 ? (
            <Box
              sx={{
                height: "100%",
                width: "100%",
                alignItems: "center",
              }}
            >
              <NoData
                icon={FolderAddIcon}
                title="Nothing Here"
                subtitle="Add some files or folders to get started"
                iconSize={46}
                titleSize={24}
                subtitleSize={16}
              />
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gridAutoRows: "180px",
                  gap: "1rem",
                  width: "100%",
                  justifyItems: "start",
                  alignContent: "start",
                  flex: "1 0 auto",
                  overflowY: "auto",
                  boxSizing: "border-box",
                  mb: 2,
                  px: 1,
                }}
              >
                <>
                  {foldersFiles.folders.map((folder: any, index: number) => (
                    <TileCard
                      key={index}
                      onClick={() => handleItemClick(folder)}
                      onDoubleClick={() => handleFolderOpen(folder)}
                      isSelected={selectedItem === folder}
                    >
                      {/* Background icon watermark (centered) */}
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          pointerEvents: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FolderAddIcon
                          sx={{
                            fontSize: 110,
                            opacity: 0.08,
                            color: (t) => t.palette.primary.main,
                          }}
                        />
                      </Box>
                      {/* Bottom-centered title */}
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          bottom: 8,
                          display: "flex",
                          justifyContent: "center",
                          px: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          noWrap
                          sx={{ textAlign: "center", maxWidth: "100%" }}
                          title={folder}
                        >
                          {folder}
                        </Typography>
                      </Box>
                    </TileCard>
                  ))}

                  {foldersFiles.files.map((file: any, index: number) => (
                    <TileCard
                      key={index}
                      onContextMenu={(event) => {
                        handleRightCLick(event, file);
                      }}
                      onClick={() => handleItemClick(file)}
                      onDoubleClick={() => HandleSelectedFileOpen(file)}
                      isSelected={selectedItem === file}
                    >
                      {/* Background icon watermark based on file type (centered) */}
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          pointerEvents: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: (t) => t.palette.primary.main,
                          opacity: 0.08,
                          "& svg": { fontSize: 110 },
                        }}
                      >
                        {getFileIcon(file, true)}
                      </Box>
                      {/* Bottom-centered title without extension */}
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          bottom: 8,
                          display: "flex",
                          justifyContent: "center",
                          px: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          noWrap
                          sx={{ textAlign: "center", maxWidth: "100%" }}
                          title={getBaseName(file.fileName)}
                        >
                          {getBaseName(file.fileName)}
                        </Typography>
                      </Box>
                    </TileCard>
                  ))}
                </>
              </Box>
            </>
          )}
        </Box>

        <Modal
          open={addFoldersModalOpen}
          onClose={() => SetAddFoldersModalOpen(false)}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 1,
              width: 300,
            }}
          >
            <IconButton
              onClick={() => SetAddFoldersModalOpen(false)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Add New Folder
            </Typography>
            <TextInputField
              label="Folder Name"
              variant="outlined"
              value={addnewFolder}
              onChange={(e) => setAddNewFolder(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleAddFolder}
            >
              Create Folder
            </Button>
          </Box>
        </Modal>
        <UploadFileDialog
          onClose={() => SetFileUploadModalOpen(false)}
          show={fileUploadModalOpen}
          onUpload={handleUploadFiles}
          path={pathName}
          fetchFolders={fetchFolders}
        />
        <Modal open={renameModalOpen} onClose={() => setRenameModalOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 1,
              width: 350,
            }}
          >
            <IconButton
              onClick={() => setRenameModalOpen(false)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Rename File
            </Typography>
            <TextInputField
              label="Enter new name here.."
              variant="outlined"
              value={foldersReName}
              onChange={(e) => SetFoldersReName(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleRenameFolder}
            >
              Rename File
            </Button>
          </Box>
        </Modal>

        <FilePreviewDialog
          open={openFile}
          blobUrl={blobUrl}
          handleClose={() => handlecloseDialog()}
          key={"File-Preview-Dialog"}
        />

        <Modal
          open={rightClick}
          onClose={closeModal}
          BackdropProps={{
            style: {
              backdropFilter: "none",
              backgroundColor: "transparent",
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: anchorPosition.top + 10,
              left: anchorPosition.left + 10,
              bgcolor: "background.paper",
              boxShadow: 3,
              py: 1,
              borderRadius: 1,
              width: 250,
              display: "flex",
              flexDirection: "column",
              border: `1px solid ${Themecolors.Button_bg3}`,
              zIndex: 1300,
            }}
          >
            <Typography
              sx={{
                padding: "8px 16px",
                cursor: "pointer",
                fontFamily: fonts.inter,
                "&:hover": {
                  backgroundImage: Themecolors.B_hv3,
                },
              }}
              onClick={() => {
                handleIndexDocument();
                closeModal();
              }}
            >
              Index Document
            </Typography>
            <Typography
              sx={{
                padding: "8px 16px",
                cursor: "pointer",
                fontFamily: fonts.inter,
                "&:hover": {
                  backgroundImage: Themecolors.B_hv3,
                },
              }}
              onClick={() => {
                closeModal();
                if (selectedFile) {
                  openDialogPrompt(selectedFile);
                }
              }}
            >
              View
            </Typography>
            <Typography
              sx={{
                padding: "8px 16px",
                cursor: "pointer",
                fontFamily: fonts.inter,
                "&:hover": {
                  backgroundImage: Themecolors.B_hv3,
                },
              }}
              onClick={() => {
                handleRefresh();
                closeModal();
              }}
            >
              Refresh
            </Typography>
            <Typography
              sx={{
                padding: "8px 16px",
                cursor: "pointer",
                fontFamily: fonts.inter,
                "&:hover": {
                  backgroundImage: Themecolors.B_hv3,
                },
              }}
              onClick={() => {
                setRenameModalOpen(true);
                closeModal();
              }}
            >
              Rename
            </Typography>
            <Typography
              sx={{
                padding: "8px 16px",
                cursor: "pointer",
                fontFamily: fonts.inter,
                "&:hover": {
                  backgroundImage: Themecolors.B_hv3,
                },
              }}
              onClick={() => {
                handleDeleteFiles();
                closeModal();
              }}
            >
              Delete
            </Typography>
          </Box>
        </Modal>
      </Box>
    </>
  );
};

export default File;
