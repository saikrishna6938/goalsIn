import React, { useEffect, useState } from "react";
import { Box, Button, MenuItem, Select, Typography } from "@mui/material";
import { pdfjs } from "react-pdf";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "app/components/Loading";
import PdfViewer from "./PdfViewer";
import { api } from "api/API";
import appStore from "app/mobxStore/AppStore";
import { IndexType } from "app/types/User";
import VerticalFormManagementForm from "./VerticalFormManagementForm";
import ImageViewer from "./ImageViewer";

// Use a locally served PDF.js worker to avoid CORS issues with external CDNs
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

const IndexPage: React.FC = () => {
  const { uploadId } = useParams<{ uploadId: string }>();
  const [blobUrl, setBlobUrl] = useState<string>("");
  console.log("blob url=", blobUrl);
  const [loading, setLoading] = useState<boolean>(true);
  const [documentTypes, setDocumentTypes] = useState<any>([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState("None");
  const [tagsData, setTagsData] = useState<any>(null);
  const [fieldsError, setFieldsError] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<any>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const response = await api.post("get/filedata", {
          body: { uploadId: Number(uploadId) },
        });
        if (response?.data?.fileData) {
          setBlobUrl(response.data.fileData);
        }
      } catch (err) {
        console.error("Error loading file", err);
      } finally {
        setLoading(false);
        api
          .get(
            `user/document-types/${appStore.loginResponse.user[0].userId}/${IndexType.INDEX}`
          )
          .then((res) => {
            if (res.success) {
              setDocumentTypes(res.data);
            }
          });
      }
    };

    if (uploadId) {
      fetchFile();
    }
  }, [uploadId]);

  const handleSubmit = (value) => {
    console.log("values==", value);
  };

  type ApiSuccess<T = any> = {
    success: true;
    data?: T;
    message?: string;
    // some endpoints in your stack seem to return fields at the top level:
    taskId?: number;
    insertId?: number;
  };

  type ApiFailure = {
    success: false;
    message?: string;
  };

  type ApiResponse<T = any> = ApiSuccess<T> | ApiFailure;

  interface DocumentType {
    documentTypeId: number;
    documentTypeName: string;
  }

  // Adjust these names/types as per your app’s store & form model

  const handleIndexClick = async (): Promise<void> => {
    try {
      // ---- Guardrails / preconditions
      if (!uploadId) throw new Error("uploadId is required.");
      if (!selectedDocumentType)
        throw new Error("selectedDocumentType is required.");
      if (!appStore?.selectedEntity)
        throw new Error("selectedEntity is required.");
      const userId = appStore?.loginResponse?.user?.[0]?.userId;
      if (!userId) throw new Error("Logged-in userId is not available.");

      const docType = documentTypes.find(
        (d) => d.documentTypeName === selectedDocumentType
      );
      if (!docType) {
        throw new Error(`Unknown document type: ${selectedDocumentType}`);
      }

      const filePath = `${appStore.selectedEntity}/${selectedDocumentType}/${uploadId}.json`;

      // ---- 1) Persist the index file (gate for the rest of the flow)
      const indexResp = await api.post("indexDocument/file", {
        body: { uploadId, filePath },
      });
      if (!indexResp?.success) {
        throw new Error(indexResp?.message ?? "Failed to persist index file.");
      }

      // ---- 2) Create the indexing task
      const taskPayload = {
        taskName: `${selectedDocumentType}-${uploadId}`,
        answerObjectId: -1,
        documentTypeId: docType.documentTypeId,
        userId,
        entityId: appStore.selectedEntity,
      };

      const taskResp = await api.post("task/index-document", {
        body: taskPayload,
      });

      if (taskResp?.success) {
        appStore.showToast(taskResp?.message, "success");
        navigate("/user/files");
      } else {
        appStore.showToast(
          taskResp?.message || "Failed to create index task.",
          "error"
        );
      }

      // Some APIs return `taskId` top-level, others under `data`
      const taskId: number | undefined =
        taskResp.taskId ?? taskResp.data?.taskId;
      if (!taskId) {
        throw new Error("Task ID missing from task/index-document response.");
      }

      // ---- 3) Attach user answers to the task
      const answersResp = await api.post("user/index-document", {
        body: {
          taskId,
          uploadId,
          answersObject: values,
        },
      });
      if (!answersResp?.success) {
        throw new Error(answersResp?.message ?? "Failed to save user answers.");
      }

      // Similar dual-path extraction for insertId
      const answerId: number | undefined =
        answersResp.insertId ?? answersResp.data?.insertId;
      if (!answerId) {
        throw new Error("Answer ID missing from user/index-document response.");
      }

      // ---- 4) Update the task with the created answers ID
      const updateResp = await api.put(`task/update/${taskId}`, {
        body: { documentTypeAnswersId: answerId },
      });
      if (!updateResp?.success) {
        throw new Error(updateResp?.message ?? "Failed to update the task.");
      }
      // ---- 5) (Optional) emit success telemetry / UI signal
      // toast.success("Document indexed and task updated successfully.");
      // return; // explicit no-op
    } catch (error: any) {
      // Centralized failure handling with actionable context
      const msg =
        typeof error?.message === "string"
          ? error.message
          : "Unexpected error during indexing flow.";
      console.error("handleIndexClick failed:", msg, { error });
      // toast.error(msg);
    }
  };

  const onFieldError = React.useCallback(
    (fieldName: string, hasError: boolean) => {
      setFieldsError((prev) => {
        if (prev[fieldName] !== hasError) {
          return { ...prev, [fieldName]: hasError };
        }
        return prev;
      });
    },
    []
  );
  const hasAnyError = Object.values(fieldsError).some((val) => val === true);
  // Returns true if blobUrl is an image
  const isImageFile = (fileData: string) => {
    return fileData?.startsWith("data:image/");
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", md: "75%" },
          height: "calc(99vh - 100px)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <Loading />
        ) : isImageFile(blobUrl) ? (
          <ImageViewer file={blobUrl} />
        ) : (
          <PdfViewer file={blobUrl} />
        )}
      </Box>
      <Box
        sx={{
          width: { xs: "100%", md: "25%" },
          height: "calc(99vh - 100px)",
          ml: { xs: 0, md: 2 },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: 1,
            p: 2,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backgroundColor: "background.paper",
            position: "relative",
          }}
        >
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>
            Select DocumentType
          </Typography>
          <Select
            size="medium"
            value={selectedDocumentType}
            onChange={async (event) => {
              const selectedValue = event.target.value;

              setSelectedDocumentType(selectedValue);
              if (selectedValue !== "None") {
                const documentTagObjectId = documentTypes.find(
                  (d) => d.documentTypeName == selectedValue
                ).documentTagObjectId;
                const result = await api.get(
                  `user/document-tags/${documentTagObjectId}`
                );
                if (result.success)
                  setTagsData(JSON.parse(result.data.documentTagObject));
              } else {
                setTagsData(null);
              }
            }}
            sx={{ mr: 1 }}
            fullWidth
          >
            <MenuItem value="None">
              <em>None</em>
            </MenuItem>
            {documentTypes.map((item, index) => (
              <MenuItem key={index} value={item.documentTypeName}>
                {item.documentTypeName}
              </MenuItem>
            ))}
          </Select>
          <Box sx={{ flexGrow: 1, overflowY: "auto", mt: 1 }}>
            <VerticalFormManagementForm
              Data={tagsData}
              onSubmit={handleSubmit}
              key={selectedDocumentType}
              onFieldError={onFieldError}
              onFormRef={(values) => {
                setValues(values);
              }}
            />
          </Box>
          <Box
            sx={{
              position: "sticky",
              bottom: 0,
              mt: 2,
              pb: 2,
              backgroundColor: "background.paper",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              sx={{ width: "90%" }}
              onClick={handleIndexClick}
              disabled={hasAnyError}
            >
              Index Document
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default IndexPage;
