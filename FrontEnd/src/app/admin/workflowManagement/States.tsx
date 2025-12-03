import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { api } from "api/API";
import HeaderTypography from "app/formComponents/HeaderTypography";
import TabBar from "app/formComponents/TabBar";
import React, { useEffect, useState, ChangeEvent } from "react";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import appStore from "app/mobxStore/AppStore";
import Stats1 from "./Details";
import { Delete } from "@mui/icons-material";
import CustomButton from "app/components/CustomButton ";
import AddIcon from "@mui/icons-material/Add";
import Approvers from "./Approvers";
import Details from "./Details";
import Action from "./Action";
import TextInputField from "app/components/regularinputs/TextInpuField";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";

interface DocumentState {
  documentStateId: number;
  documentStateName: string;
  documentStateDescription: string;
  documentStateCreatedDate: string;
  documentStateUpdatedDate: string;
  WorkflowID: number;
  steps: number;
}

interface DataType {
  id: string;
}

interface Props {
  data?: DataType;
}

const States: React.FC<Props> = ({ data }) => {
  const [status, setStatus] = useState<DocumentState[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [currentObject, setCurrentObject] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (data?.id) fetchData();
  }, [data?.id]);
  const fetchData = async () => {
    try {
      const response = await api.get(
        `administrator/workflows/document-states/${data?.id}`
      );
      const workflowData = response.data;
      const statusOrdered = [...workflowData].sort((a, b) => a.steps - b.steps);
      setStatus(statusOrdered);

      const currentSelectedId = currentObject?.documentStateId;
      const matchedDoc = statusOrdered.find(
        (doc) => doc.documentStateId === currentSelectedId
      );

      if (matchedDoc) {
        setCurrentObject(matchedDoc);
      } else {
        setCurrentObject(statusOrdered[0]);
      }
    } catch (err) {
      console.error("Error fetching workflow data:", err);
    }
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value.toLowerCase());
  };

  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleDelete = async () => {
    if (currentObject?.documentStateId) {
      setOpenDialog(false);
      try {
        const payload = {
          documentStateId: currentObject?.documentStateId,
        };
        const response = await api.delete(
          `administrator/workflows/document-states`,
          {
            body: payload,
          }
        );
        appStore.showToast(response.message, "success");
        if (response.status) {
          await fetchData();
        }
      } catch (error) {
        console.error("Error deleting document type:", error);
      }
    } else {
      console.error("No document selected for deletion.");
    }
  };

  const renderTab = (tabIndex: number) => {
    switch (tabIndex) {
      case 0:
        return (
          <Details
            curentObj={currentObject}
            reload={fetchData}
            laststep={status[status.length - 1]}
          />
        );
      case 1:
        return <Approvers currentObj={currentObject} />;
      case 2:
        return <Action currentObj={currentObject} status={status} />;
      default:
        return null;
    }
  };

  const handleCreateNewStats = () => {
    setCurrentObject({
      documentStateId: 0,
      documentStateName: "",
      documentStateDescription: "",
      documentStateCreatedDate: "",
      documentStateUpdatedDate: "",
      WorkflowID: data?.id,
      steps: 1,
    });
  };

  // Handle Drag Start Event
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: number) => {
    const target = e.target as HTMLDivElement;
    e.dataTransfer.setData("text/plain", id.toString());
    target.style.opacity = "0.4";
  };

  // Handle Drag End Event
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    target.style.opacity = "1";
  };

  // Handle Drop Event (Reorder)
  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    targetIndex: number
  ) => {
    e.preventDefault();

    const draggedId = e.dataTransfer.getData("text/plain");
    const draggedItem = status.find(
      (item) => item.documentStateId.toString() === draggedId
    );

    if (!draggedItem) return;

    const newStatus = [...status];
    newStatus.sort((a, b) => a.steps - b.steps);

    const fromIndex = newStatus.findIndex(
      (item) => item.documentStateId === draggedItem.documentStateId
    );
    const toIndex = targetIndex;

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

    newStatus.splice(fromIndex, 1);
    newStatus.splice(toIndex, 0, draggedItem);

    const updatedStatus = newStatus.map((item, index) => ({
      ...item,
      steps: index + 1,
    }));

    try {
      const payload = {
        workflowID: data?.id,
        reorderedStates: updatedStatus.map((state) => ({
          documentStateId: state.documentStateId,
        })),
      };

      const response = await api.put(
        "administrator/workflows/document-states/reorder",
        { body: payload }
      );

      if (response.status) {
        await fetchData();
      }
    } catch (error) {
      console.error("Error reordering document states:", error);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        height: "100%",
        width: "100%",
        flexWrap: "wrap",
      }}
    >
      {/* Left Side */}
      <Box
        sx={{
          width: "20%",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          minWidth: "250px",
          height: "100%",
        }}
      >
        <HeaderTypography
          title=""
          searchEnabled={true}
          onSearch={handleSearch}
          searchValue={search}
          TextFieldWidth="170px"
        />

        <Box
          sx={{
            overflowY: "auto",
            flex: 1,
            paddingX: 2,
            mt: "5px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {status.map((state, index) => {
            const isSelected =
              currentObject?.documentStateId === state.documentStateId;

            return (
              <Box
                key={state.documentStateId}
                className="item"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingY: 1,
                  paddingX: 1,
                  borderBottom: "1px solid #e0e0e0",
                  alignItems: "center",
                  cursor: "pointer",
                  backgroundColor: isSelected ? "#dedede" : "",
                  "&:hover": {
                    backgroundColor: isSelected ? "#f5f5f5" : "#f5f5f5",
                  },
                }}
                onClick={() => {
                  setCurrentObject(state);
                }}
                draggable
                onDragStart={(e) => handleDragStart(e, state.documentStateId)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <Box sx={{ display: "flex" }}>
                  <Box
                    sx={{
                      opacity: 0,
                      transition: "opacity 0.2s",
                      ".item:hover &": {
                        opacity: 1,
                      },
                    }}
                  >
                    <DragIndicatorIcon sx={{ fontSize: "1.4em" }} />
                  </Box>
                  <span>{state.documentStateName}</span>
                </Box>

                {isSelected && (
                  <Box onClick={() => setOpenDialog(true)}>
                    <Delete />
                  </Box>
                )}
              </Box>
            );
          })}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingY: 1,
            }}
          >
            <TextInputField
              placeholder="Add new state"
              variant="standard"
              name="tableName"
              required
            />
            <Box
              sx={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "1px solid #e0e0e0",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                backgroundColor: "#fff",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
              onClick={handleCreateNewStats}
            >
              <AddIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider
        orientation="vertical"
        flexItem
        sx={{
          mx: "5px",
          backgroundColor: "#ccc",
          width: "1.5px",
        }}
      />

      {/* Right Side */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: "300px",
          height: "100%",
        }}
      >
        <TabBar
          value={selectedTab}
          onChange={handleTabChange}
          tabs={["Details", "Approvers", "Actions"]}
        />
        <Box
          sx={{
            height: "100%",
            overflow: "hidden",
            marginTop: "5px",
          }}
        >
          {renderTab(selectedTab)}
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete WorkFlow State
            <strong style={{ marginLeft: "5px" }}>
              {currentObject?.documentStateName || ""}
            </strong>
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <PrimaryButton
            label="Cancel"
            startIcon={<CancelIcon />}
            type="button"
            onClick={() => setOpenDialog(false)}
          />
          <PrimaryButton
            label="Delete"
            startIcon={<DeleteIcon />}
            type="button"
            onClick={handleDelete}
          />
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default States;
