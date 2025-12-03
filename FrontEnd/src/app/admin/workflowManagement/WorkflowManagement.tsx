import React, { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { HeaderBox, InfoBox } from "app/appComponents/HeaderBox";
import DataGrid from "app/formComponents/DataGrid";
import { Split } from "app/formComponents/styles/Split";
import TabBar from "app/formComponents/TabBar";
import { api } from "api/API";
import WorkFlowProperties from "./WorkFlowProperties";
import FilterButtonComponent from "app/formComponents/FilterButtonComponent";
import CustomButton from "app/components/CustomButton ";
import { formatDate } from "app/utils/dates";
import appStore from "app/mobxStore/AppStore";
import DocumentRoles from "./DocumentRoles";
import {
  UserHeaderBox,
  UserInfoBox,
} from "app/appComponents/UserHeaderComponent";
import States from "./States";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const workflowColumns: any = [
  { id: "id", label: "ID", type: "number" },
  { id: "WorkflowName", label: "Name", type: "string" },
  // { id: "CreatedAt", label: "Created Date", type: "string" },
];

const WorkflowManagement: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [workflowList, setWorkflowList] = useState<any[]>([]);
  const [currentObj, setCurrentObj] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [resetKey, setResetKey] = useState(false);

  useEffect(() => {
    fetchWorkflowData();
  }, []);

  const fetchWorkflowData = async () => {
    try {
      const response = await api.get("administrator/workflows");
      const mappedData = response.data.map(
        ({ WorkflowID, CreatedAt, ...rest }) => ({
          id: WorkflowID,
          CreatedAt: formatDate(CreatedAt),
          ...rest,
        })
      );
      setWorkflowList(mappedData);
      const currentSelectedId = currentObj?.id;

      if (currentSelectedId) {
        const matchedDoc = mappedData.find(
          (doc) => doc.id === currentSelectedId
        );
        if (matchedDoc) {
          setCurrentObj(matchedDoc);
          return;
        }
      }

      setCurrentObj(mappedData[0]);
    } catch (error) {
      console.error("Error fetching workflows:", error);
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
    const selected = workflowList.find((item) => item.id === id);
    if (selected) {
      setCurrentObj(selected);
    }
  };

  const renderTab = (tabIndex: number) => {
    switch (tabIndex) {
      case 0:
        return (
          <WorkFlowProperties
            data={currentObj}
            reloadData={fetchWorkflowData}
          />
        );
      case 1:
        return (
          <DocumentRoles
            currentObjId={currentObj?.id}
            userInfoComponent={
              <UserHeaderBox>
                <UserInfoBox>
                  <Typography sx={{ color: "black", fontSize: "1.3em" }}>
                    {currentObj?.WorkflowName}
                  </Typography>
                </UserInfoBox>
              </UserHeaderBox>
            }
          />
        );
      case 2:
        return <States data={currentObj} />;

      default:
        return null;
    }
  };

  const handleFilterAction = (value: string) => {
    switch (value) {
      case "Create":
        setCurrentObj({});
        setSelectedTab(0);
        setResetKey(true);
        break;
      case "Delete":
        if (currentObj) {
          setOpenDialog(true);
        }
        break;
      default:
        console.log("Invalid Option");
    }
  };

  const deleteDocumentType = async () => {
    if (currentObj?.id) {
      setOpenDialog(false);
      try {
        const payload = {
          WorkflowID: currentObj.id,
        };
        const response = await api.delete(`administrator/workflows`, {
          body: payload,
        });
        appStore.showToast(response.message, "success");
        if (response.message.length > 0) {
          await fetchWorkflowData();
        }
      } catch (error) {
        console.error("Error deleting document type:", error);
      }
    } else {
      console.error("No document selected for deletion.");
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
            initialSize={0.32}
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
                      {"WorkFlow Management"}
                    </Typography>
                  </InfoBox>
                </HeaderBox>{" "}
                <Box
                  sx={{
                    flex: 1,
                    overflow: "hidden",
                  }}
                >
                  <DataGrid
                    tasks={workflowList}
                    columns={workflowColumns}
                    resetSelectionRowId={resetKey}
                    onSelection={handleSelection}
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
                  tabs={["Properties", "Documents", "States"]}
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
            Are you sure you want to delete WorkFlow
            <strong style={{ marginLeft: "5px" }}>
              {currentObj?.WorkflowName || ""}
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
            onClick={deleteDocumentType}
          />
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default WorkflowManagement;
