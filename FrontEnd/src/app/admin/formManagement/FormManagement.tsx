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
import CustomButton from "app/components/CustomButton ";
import FilterButtonComponent from "app/formComponents/FilterButtonComponent";
import UserForm from "./userform/UserForm";
import { api } from "api/API";
import jsonData from "../formManagement/data.json";
import appStore from "app/mobxStore/AppStore";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const dummyColumns: any = [
  { id: "id", label: "ID", type: "number" as const },
  { id: "name", label: "Task Name", type: "string" as const },
  { id: "description", label: "Description", type: "string" },
];

const FormManagement: React.FC = () => {
  const [formData, setFormData] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [resetKey, setResetKey] = useState(false);
  const [currentObj, setCurrentObj] = useState<any>([]);

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      const res = await api.get("administrator/forms");
      const mapData = res.data.map(({ documentTypeObjectId, ...rest }) => ({
        id: String(documentTypeObjectId),
        ...rest,
      }));
      const combinedData = [...mapData];
      setFormData(combinedData);

      const currentSelectedId = currentObj?.id;

      if (currentSelectedId) {
        const matchedDoc = combinedData.find(
          (doc) => doc.id === currentSelectedId
        );
        if (matchedDoc) {
          setCurrentObj(matchedDoc);
          return;
        }
      }

      setCurrentObj(combinedData[0]);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const renderTab = (tabIndex: number) => {
    switch (tabIndex) {
      case 0:
        return (
          <UserForm
            currentObj={currentObj}
            onReload={fetchFormData}
            data={formData}
          />
        );
      default:
        return null;
    }
  };

  const handleFilterAction = (value: string) => {
    switch (value) {
      case "Create":
        setCurrentObj({});
        setResetKey(true);
        break;
      case "Delete":
        if (currentObj) {
          setOpenDialog(true);
        }
        break;
    }
  };
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleSelection = (id: number) => {
    if (id === null) {
      setResetKey(false);
      return;
    }
    const selected = formData.find((role) => role?.id === id);
    setCurrentObj(selected);
  };

  const handleDelete = async () => {
    setOpenDialog(false);
    try {
      const response = await api.delete(
        `administrator/forms/${currentObj.id}`,
        {
          body: { documentTypeObjectId: currentObj.id },
        }
      );
      appStore.showToast("Form deleted successfully", "success");
      fetchFormData();
    } catch (err) {
      throw err;
    }
  };

  return (
    <Box
      sx={{
        height: "calc(100vh - 95px)",
        backgroundColor: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        maxHeight: "100%",
      }}
    >
      <Box sx={{ width: "100%", height: "100%" }}>
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
                flex: 1,
              }}
            >
              <HeaderBox style={{ height: "60px" }}>
                <InfoBox>
                  <Typography
                    variant="overline"
                    sx={{ fontSize: 15, ml: "16px" }}
                  >
                    {"Form Management"}
                  </Typography>
                </InfoBox>
              </HeaderBox>
              <Box sx={{ flex: 1, overflow: "hidden" }}>
                <DataGrid
                  tasks={formData}
                  columns={dummyColumns}
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

      {/* Delete Modal */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete role{" "}
          <strong>{currentObj?.name}</strong>?
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

export default FormManagement;
