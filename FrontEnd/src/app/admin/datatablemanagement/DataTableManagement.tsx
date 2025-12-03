import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Modal,
  TextField,
} from "@mui/material";
import { api } from "api/API";
import { HeaderBox, InfoBox } from "app/appComponents/HeaderBox";
import DataGrid from "app/formComponents/DataGrid";
import { Split } from "app/formComponents/styles/Split";
import TabBar from "app/formComponents/TabBar";
import FilterButtonComponent from "app/formComponents/FilterButtonComponent";
import CustomButton from "app/components/CustomButton ";
import DataTableDetails from "../documentManagement/DataTableDetails";
import CloseIcon from "@mui/icons-material/Close";
import appStore from "app/mobxStore/AppStore";
import TextInputField from "app/components/regularinputs/TextInpuField";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { CloudUpload } from "@mui/icons-material";

const dataTableColumns: any = [
  { id: "id", label: "ID", type: "number" },
  { id: "tableName", label: "Table Name", type: "string" },
];

const DataTableManagement: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [dataTables, setDataTables] = useState<any[]>([]);
  const [currentObj, setCurrentObj] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [resetKey, setResetKey] = useState(false);
  const [openimportModal, setOpenimportModal] = useState(false);
  const [tableName, setTableName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("administrator/data-tables");
      const mappedData = res.data.map(({ tableId, ...rest }) => ({
        id: tableId,
        ...rest,
      }));
      setDataTables(mappedData);
      setCurrentObj(mappedData[0] || null);
    } catch (error) {
      console.error("Error fetching data tables:", error);
    }
  };

  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleSelection = (id: number) => {
    if (id === null) {
      setResetKey(false);

      return;
    }
    const selected = dataTables.find((table) => table.id === id);
    setCurrentObj(selected || null);
  };

  const handleFilterAction = (value: string) => {
    switch (value) {
      case "Create":
        setResetKey(true);
        setCurrentObj({});
        setSelectedTab(0);
        break;
      case "Delete":
        if (currentObj) {
          setOpenDialog(true);
        }
        break;
      case "Import":
        setOpenimportModal(true);
        break;
      default:
        console.log("Invalid option selected");
    }
  };

  const deleteDataTable = async () => {
    setOpenDialog(false);
    if (currentObj) {
      try {
        const response = await api.delete("administrator/data-tables", {
          body: {
            tableId: currentObj.id,
            tableName: currentObj.tableName,
          },
        });
        if (response.message && response.message.length > 0) {
          await fetchData();
        }
      } catch (error) {
        console.error("Error deleting data table:", error);
      }
    }
  };

  const renderTabContent = (tabIndex: number) => {
    switch (tabIndex) {
      case 0:
        return (
          <DataTableDetails
            currentObject={currentObj}
            reloaddData={fetchData}
          />
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const accessToken = appStore.loginResponse.accessToken;
    const formData = new FormData();
    formData.append("tableName", tableName);
    formData.append("file", file);
    try {
      const response = await fetch(
        "https://api.gradwalk.us/api/administrator/data-tables/import",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.message) {
          appStore.showToast(result.message, "success");
        }
        setOpenimportModal(false);
        setTableName("");
        setFile(null);
      } else {
        const errorResponse = await response.json();
        appStore.showToast(
          errorResponse.message || "An error occurred",
          "error"
        );
      }
    } catch (error) {
      console.error("Error:", error);
    }
    fetchData();
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
      <Box sx={{ width: "100%", borderRadius: "4px", height: "100%" }}>
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
                      {"Data Table Management"}
                    </Typography>
                  </InfoBox>
                </HeaderBox>
                <Box sx={{ flex: 1, overflow: "hidden" }}>
                  <DataGrid
                    tasks={dataTables}
                    columns={dataTableColumns}
                    onSelection={handleSelection}
                    resetSelectionRowId={resetKey}
                    defaultHeight="100%"
                    filterComponent={
                      <FilterButtonComponent
                        categories={["Create", "Import", "Delete"]}
                        onButtonClick={handleFilterAction}
                        getIcon={(category) => {
                          switch (category) {
                            case "Create":
                              return <AddCircleIcon />;
                            case "Import":
                              return <CloudUpload />;
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
                  tabs={["Data Table Details"]}
                />
                <Box sx={{ height: "100%", overflow: "hidden", mt: "5px" }}>
                  {renderTabContent(selectedTab)}
                </Box>
              </div>
            }
          />
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
            Are you sure you want to delete table{" "}
            <strong>{currentObj?.tableName || ""}</strong>?
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
            onClick={deleteDataTable}
          />
        </DialogActions>
      </Dialog>

      {/* Import Data from File */}
      <Modal open={openimportModal} onClose={() => setOpenimportModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            width: 500,
            p: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Create Table</Typography>
            <CloseIcon
              onClick={() => setOpenimportModal(false)}
              sx={{
                cursor: "pointer",
                fontSize: "1.5rem",
              }}
            />
          </Box>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextInputField
                label="Enter Table Name"
                variant="standard"
                name="tableName"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                required
              />
              <Typography variant="subtitle1">Import Excel File</Typography>
              <input
                type="file"
                accept=".xls,.xlsx,.csv"
                name="file"
                onChange={(e) => {
                  const selectedFile = e.target.files
                    ? e.target.files[0]
                    : null;
                  setFile(selectedFile);
                }}
                required
                style={{ cursor: "pointer" }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 3,
              }}
            >
              <PrimaryButton
                label="Cancel"
                startIcon={<CancelIcon />}
                type="button"
                onClick={() => setOpenimportModal(false)}
              />
              <PrimaryButton
                label="Submit"
                startIcon={<SaveIcon />}
                type="submit"
                onClick={() => setOpenDialog(false)}
              />
            </Box>
          </form>
        </Box>
      </Modal>
    </div>
  );
};

export default DataTableManagement;
