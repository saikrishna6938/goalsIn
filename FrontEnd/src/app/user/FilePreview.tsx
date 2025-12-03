import React, { useEffect, useState } from "react";
import { dataURLToObjectUrl } from "../utils/fileUtils";
import {
  Dialog,
  DialogContent,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface FilePreviewDialogProps {
  open: boolean;
  handleClose: () => void;
  blobUrl: string;
  loading?: boolean;
}

function FilePreviewDialog({
  open,
  handleClose,
  blobUrl,
  loading,
}: FilePreviewDialogProps) {
  const [resizedBlobUrl, setResizedBlobUrl] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string>("");

  useEffect(() => {
    if (blobUrl) {
      const url = dataURLToObjectUrl(blobUrl);
      setObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setObjectUrl("");
    }
  }, [blobUrl]);

  useEffect(() => {
    const resizeAndSetBlobUrl = async () => {
      if (objectUrl) {
        try {
          const resizedUrl = await resizeImage(objectUrl, 1100, 570);
          setResizedBlobUrl(resizedUrl);
        } catch (error) {
          console.error("Error resizing file:", error);
          setResizedBlobUrl(null);
        }
      }
    };

    resizeAndSetBlobUrl();
  }, [objectUrl]);

  const resizeImage = async (
    url: string,
    maxWidth: number,
    maxHeight: number
  ) => {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let newWidth = img.width;
        let newHeight = img.height;

        // Resize logic
        if (img.width > maxWidth) {
          newWidth = maxWidth;
          newHeight = (img.height * maxWidth) / img.width;
        }

        if (newHeight > maxHeight) {
          newWidth = (newWidth * maxHeight) / newHeight;
          newHeight = maxHeight;
        }

        canvas.width = maxWidth;
        canvas.height = maxHeight;

        // Calculate center position
        const x = (maxWidth - newWidth) / 2;
        const y = (maxHeight - newHeight) / 2;

        ctx.drawImage(img, x, y, newWidth, newHeight);

        // Convert the canvas content to a data URL
        const resizedBlobUrl = canvas.toDataURL();
        resolve(resizedBlobUrl);
      };

      img.onerror = (error) => {
        console.error("Error loading image:", error);
        reject(error);
      };
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={"lg"}
      sx={{ padding: "3px" }}
    >
      <DialogContent
        style={{
          position: "relative",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconButton
          style={{
            position: "absolute",
            left: "97%",
            bottom: "94.5%",
          }}
          onClick={handleClose}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <IconButton
          style={{ position: "absolute", right: 50, top: 0 }}
        ></IconButton>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
            }}
          >
            <CircularProgress />
          </div>
        ) : resizedBlobUrl ? (
          <img
            src={resizedBlobUrl}
            alt="File Preview"
            style={{ maxWidth: "100%", height: "585px" }}
          />
        ) : (
          <iframe
            src={objectUrl}
            width="100%"
            height="585px"
            title="File Preview"
            style={{ border: "none", marginLeft: 18, marginRight: 20 }}
          ></iframe>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default FilePreviewDialog;
