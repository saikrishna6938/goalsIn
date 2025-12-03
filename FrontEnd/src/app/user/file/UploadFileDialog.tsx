import {
  Box,
  Button,
  Typography,
  Dialog,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, { useEffect, useState } from "react";
import DescriptionIcon from "@mui/icons-material/Description";
import { api } from "api/API";
import appStore from "app/mobxStore/AppStore";
import { v4 as uuidv4 } from "uuid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import Toast from "app/formComponents/Toast";

interface UploadFileProps {
  show: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
  path: string;
  fetchFolders?: () => void;
}

const UploadFileDialog: React.FC<UploadFileProps> = ({
  show = false,
  onClose = () => {},
  onUpload,
  path,
  fetchFolders,
}) => {
  const [open, setOpen] = useState(show);
  const [selectedFile, setSelectedFile] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isValidUploadFile, SetIsValidUploadFile] = useState(false);
  const userId = appStore.loginResponse.user[0].userId;

  useEffect(() => {
    setOpen(show);
  }, [show]);

  const handleClose = () => {
    setOpen(false);
    onClose();
    setSelectedFile(null);
  };
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files) {
      Array.from(files).forEach((file) => {
        const isAcceptType = acceptedFileTypes.includes(file.type);
        SetIsValidUploadFile(isAcceptType);
      });
    }
    setSelectedFile(files);
  };

  const handleSubmit = async () => {
    setUploading(true);

    if (!selectedFile) return;

    try {
      const validFilesToUpload: any[] = [];
      const invalidFiles: any[] = [];

      Array.from(selectedFile).forEach((file) => {
        const isValidFileType = acceptedFileTypes.includes(file.type);
        if (isValidFileType) {
          const uploadName = uuidv4();
          validFilesToUpload.push({
            uploadName,
            fileData: file,
            fileName: file.name,
            fileSize: file.size,
            type: file.type,
            userId: userId,
            path: path,
          });
        } else {
          invalidFiles.push(file);
        }
      });

      if (validFilesToUpload.length > 0) {
        const uploadPromises = validFilesToUpload.map((file) => {
          return new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = async () => {
              try {
                const response = await api.post("userupload/file", {
                  body: {
                    uploadName: file.uploadName,
                    fileData: reader.result,
                    fileName: file.fileName,
                    fileSize: file.fileSize,
                    type: file.type,
                    userId: userId,
                    documentType: -1,
                    path: path,
                  },
                });
                if (response) {
                  appStore.showToast(response.message, "success");
                }
                resolve();
              } catch (error) {
                console.error("Error uploading file:", error);
                reject(error);
              }
            };
            reader.readAsDataURL(file.fileData);
          });
        });

        await Promise.all(uploadPromises);
        if (fetchFolders) {
          fetchFolders();
        }

        onUpload(validFilesToUpload);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setUploading(false);
      setSelectedFile(null);
      handleClose();
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    setSelectedFile(files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const acceptedFileTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "video/mp4",
    "video/avi",
    "video/mkv",
    "video/quicktime",
    "video/webm",
  ];

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        disableEscapeKeyDown
        maxWidth="md"
        sx={{
          "& .MuiDialog-paper": {
            width: "100%",
            padding: "23px",
            height: "auto",
            overflow: "hidden",
          },
        }}
      >
        <>
          {uploading ? (
            <Box
              sx={{
                border: "2px dotted",
                textAlign: "center",
                borderColor: "grey.500",
                fontSize: "1em",
                color: "grey.500",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress sx={{ mt: "1.5em", size: "100px" }} />
              <Typography
                variant="h6"
                sx={{ fontSize: "1.5em", margin: "2em" }}
              >
                Please wait, your files are uploading...
              </Typography>
            </Box>
          ) : !selectedFile && !uploading ? (
            <Box
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              sx={{
                position: "relative",
                border: "2px dotted",
                textAlign: "center",
                borderColor: "grey.500",
                padding: "1.4em",
              }}
            >
              <IconButton
                onClick={handleClose}
                sx={{
                  position: "absolute",
                  top: "-1.2em",
                  right: "-1.2em",
                  color: "grey.700",
                  "&:hover": {
                    backgroundColor: "#e0e0e0",
                    borderRadius: "50%",
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: "0.8em" }} />
              </IconButton>
              <Typography
                sx={{
                  fontSize: "1.5em",
                  marginBottom: "0.5em",
                  marginTop: "2.5em",
                }}
              >
                Drop files to upload
              </Typography>
              <Typography sx={{ marginBottom: "1em" }}>or</Typography>
              <Box sx={{ padding: "10px", mb: "3em " }}>
                <Button variant="contained" color="primary" component="label">
                  Select files
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleFileSelect}
                  />
                </Button>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                border: "2px dotted",
                borderColor: "grey.500",
                padding: "20px",
                overflow: "auto",
              }}
            >
              <IconButton
                onClick={handleClose}
                sx={{
                  position: "absolute",
                  top: "-0.2em",
                  right: "-0.2em",
                  color: "grey.700",
                  "&:hover": {
                    backgroundColor: "#e0e0e0",
                    borderRadius: "50%",
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: "0.8em" }} />
              </IconButton>
              <>
                {isValidUploadFile ? (
                  <>
                    <Typography sx={{ fontWeight: "bold", mb: 2 }}>
                      Selected files list here:
                    </Typography>
                    {selectedFile &&
                      Array.from(selectedFile).map((file, index) => {
                        const isValidFileType = acceptedFileTypes.includes(
                          file.type
                        );
                        return (
                          <>
                            <Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-start",
                                }}
                              >
                                <DescriptionIcon sx={{ ml: "1em" }} />
                                <Typography
                                  key={index}
                                  sx={{ ml: "1em", mt: "3px" }}
                                >
                                  {file.name}
                                </Typography>
                                {isValidFileType ? (
                                  <CheckCircleIcon
                                    sx={{
                                      color: "green",
                                      ml: "0.5em",
                                      fontSize: "1.2em",
                                      alignContent: "center",
                                      alignItems: "center",
                                      mt: "5px",
                                    }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignContent: "center",
                                    }}
                                  >
                                    <CancelIcon
                                      sx={{
                                        color: "red",
                                        ml: "0.5em",
                                        fontSize: "1.2em",
                                        alignContent: "center",
                                        alignItems: "center",
                                        mt: "5px",
                                      }}
                                    />
                                    <Typography
                                      sx={{
                                        ml: "1em",
                                        fontSize: "0.87em",
                                        alignContent: "center",
                                        mt: "3px",
                                      }}
                                    >
                                      File type not supported. Please upload a
                                      valid file ( image, pdf, or document )
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </>
                        );
                      })}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        padding: "10px",
                        marginTop: "10px",
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        sx={{
                          marginTop: "1em",
                        }}
                      >
                        Upload
                      </Button>
                    </Box>{" "}
                  </>
                ) : (
                  <Box>
                    <Typography
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        my: "2em",
                      }}
                    >
                      File type not supported. Please upload a valid file (
                      image, pdf, or document )
                    </Typography>
                  </Box>
                )}
              </>
            </Box>
          )}
        </>
      </Dialog>
    </div>
  );
};

export default UploadFileDialog;
