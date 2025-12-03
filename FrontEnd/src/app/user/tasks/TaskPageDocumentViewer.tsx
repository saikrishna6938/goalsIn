import React, { useEffect, useState } from "react";
import { api } from "api/API";
import PdfViewer from "../file/PdfViewer";
import Loading from "app/components/Loading";
import { Box } from "@mui/material";
import ImageViewer from "../file/ImageViewer";

interface TaskPageDocumentViewerProps {
  taskId?: string | number;
}

const TaskPageDocumentViewer: React.FC<TaskPageDocumentViewerProps> = ({
  taskId,
}) => {
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImage, setIsImage] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      try {
        const response = await api.post(`document/object-by-task`, {
          body: { taskId },
        });

        if (response.status && response.data) {
          const data = response.data;
          setPdfDataUrl(data);

          // ✅ Check if file is image or pdf
          if (
            typeof data === "string" &&
            (data.startsWith("data:image") ||
              data.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i))
          ) {
            setIsImage(true);
          } else {
            setIsImage(false);
          }
        } else {
          setPdfDataUrl(null);
          setIsImage(false);
        }
      } catch (err) {
        console.error("Failed to load document:", err);
        setPdfDataUrl(null);
        setIsImage(false);
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchDocument();
    } else {
      setLoading(false);
    }
  }, [taskId]);

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      {loading ? (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Loading />
        </Box>
      ) : pdfDataUrl ? (
        isImage ? (
          <ImageViewer file={pdfDataUrl} />
        ) : (
          <PdfViewer file={pdfDataUrl} />
        )
      ) : null}
    </Box>
  );
};

export default TaskPageDocumentViewer;
