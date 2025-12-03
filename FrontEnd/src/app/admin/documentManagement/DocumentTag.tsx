import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { HeaderBox, InfoBox } from "app/appComponents/HeaderBox";
import DataGrid from "app/formComponents/DataGrid";
import { Split } from "app/formComponents/styles/Split";
import TabBar from "app/formComponents/TabBar";
import FilterButtonComponent from "app/formComponents/FilterButtonComponent";
import appStore from "app/mobxStore/AppStore";
import { api } from "api/API";
import CustomButton from "app/components/CustomButton ";
import UserForms from "./UserForms";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const columns: any = [
  { id: "id", label: "ID", type: "number" },
  { id: "name", label: "Name", type: "string" },
  { id: "description", label: "Description", type: "string" },
];

const DocumentTag: React.FC = () => {
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [resetKey, setResetKey] = useState(false);
  const [currentTag, setCurrentTag] = useState<any>({});

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await api.get("administrator/document-tags");
      const data = res.data.map(({ documentTagObjectId, ...rest }) => ({
        id: String(documentTagObjectId),
        ...rest,
      }));
      setTags(data);

      const currentId = currentTag?.id;
      if (currentId) {
        const matched = data.find((t) => t.id === currentId);
        if (matched) {
          setCurrentTag(matched);
          return;
        }
      }

      setCurrentTag(data[0] || {});
    } catch (err) {
      console.error("Failed to fetch document tags:", err);
    }
  };

  const handleSelection = (id: string) => {
    const selected = tags.find((tag) => tag.id === id);
    setCurrentTag(selected || {});
  };

  const handleDelete = async () => {
    setOpenDialog(false);
    try {
      await api.delete(`administrator/document-tags/${currentTag.id}`);
      appStore.showToast("Document tag deleted successfully", "success");
      fetchTags();
    } catch (err) {
      console.error("Error deleting tag:", err);
    }
  };

  const handleFilterAction = (action: string) => {
    switch (action) {
      case "Create":
        setCurrentTag({});
        setResetKey(true);
        break;
      case "Delete":
        if (currentTag) setOpenDialog(true);
        break;
    }
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

  const renderTab = (tabIndex: number) => {
    switch (tabIndex) {
      case 0:
        return (
          <UserForms currentObj={currentTag} onReload={fetchTags} data={tags} />
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        height: "calc(100vh - 95px)",
        maxHeight: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Box
        sx={{
          width: "100%",
          borderRadius: "4px",
          height: "100%",
        }}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderBottom: "1px solid #ccc",
          }}
        >
          <Split
            initialSize={0.45}
            minSize={150}
            maxSize={900}
            left={
              <div
                style={{
                  paddingRight: "5px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <HeaderBox style={{ height: "60px" }}>
                  <InfoBox>
                    <Typography
                      variant="overline"
                      sx={{ fontSize: 15, ml: "16px" }}
                    >
                      Document Tags
                    </Typography>
                  </InfoBox>
                </HeaderBox>
                <Box sx={{ flex: 1, overflow: "hidden" }}>
                  <DataGrid
                    tasks={tags}
                    columns={columns}
                    onSelection={handleSelection}
                    resetSelectionRowId={resetKey}
                    defaultHeight="100%"
                    filterComponent={
                      <FilterButtonComponent
                        categories={["Create", "Delete"]}
                        onButtonClick={handleFilterAction}
                        getIcon={(category) => {
                          switch (category) {
                            case "Create":
                              return <AddCircleIcon />;
                            case "Delete":
                              return <DeleteIcon />;
                            default:
                              return null;
                          }
                        }}
                      />
                    }
                  />
                </Box>
              </div>
            }
            right={
              <div
                style={{
                  marginRight: "5px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  marginLeft: "4px",
                }}
              >
                <TabBar
                  value={selectedTab}
                  onChange={handleTabChange}
                  tabs={["Details"]}
                />
                <Box
                  sx={{
                    height: "100%",
                    overflow: "hidden",
                    mt: "5px",
                  }}
                >
                  {renderTab(selectedTab)}
                </Box>
              </div>
            }
          />
        </Box>
      </Box>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the tag{" "}
          <strong>{currentTag?.name}</strong>?
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
    </div>
  );
};

export default DocumentTag;
