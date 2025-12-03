import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled,
  Avatar,
} from "@mui/material";
import { api } from "api/API";
import { HeaderBox, InfoBox } from "app/appComponents/HeaderBox";
import DataGrid from "app/formComponents/DataGrid";
import { Split } from "app/formComponents/styles/Split";
import TabBar from "app/formComponents/TabBar";
import React, { useEffect, useState } from "react";
import Properties from "./Properties";
import FilterButtonComponent from "app/formComponents/FilterButtonComponent";
import CustomButton from "app/components/CustomButton ";
import RolesManagers from "app/user/userManagement/RolesManagers";
import { Themecolors } from "api/Colors";
import {
  UserHeaderBox,
  UserInfoBox,
} from "app/appComponents/UserHeaderComponent";
import appStore from "app/mobxStore/AppStore";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const documentColumns: any = [
  { id: "id", label: "Id", type: "number" },
  { id: "documentTypeName", label: "Name", type: "string" },
  { id: "documentGroupName", label: "Group Name", type: "string" },
  { id: "tableName", label: "Table Name", type: "string" },
  { id: "enabled", label: "Enabled", type: "number" },
];

const DocumentManagement: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [currentObj, setCurrentObj] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [resetKey, setResetKey] = useState(false);
  const [leftSideRoles, SetLeftSideRoles] = useState<any[]>([]);
  const [rightSideRoles, SetRightSideRoles] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchLeftData = async () => {
      try {
        const response = await api.get("administrator/roles/names/get");
        SetLeftSideRoles(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLeftData();
  }, []);

  useEffect(() => {
    if (currentObj?.id) {
      fetchRightData();
    }
  }, [currentObj?.id]);

  const fetchRightData = async () => {
    try {
      const response = await api.get(
        `administrator/document-type-roles/${currentObj.id}`
      );
      const roles = response?.rows;
      SetRightSideRoles(roles);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    try {
      const res = await api.get("administrator/document-types");
      const mappedData = res.map(({ documentTypeId, ...rest }) => ({
        id: documentTypeId,
        ...rest,
      }));
      setDocumentTypes(mappedData);

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
      console.error("Error fetching document types:", error);
    }
  };

  const handleSubmit = async (newlyAddedRoles: any[], deletedRoles: any[]) => {
    const userRolesData =
      newlyAddedRoles?.map((role) => ({
        documentTypeId: currentObj?.id,
        roleNameId: role.roleNameId,
        documentSecurity: 1,
      })) || [];

    const deletePayload = {
      roleIds: deletedRoles?.map((role) => role.roleNameId) || [],
      documentTypeId: currentObj?.id,
    };

    try {
      // Skip api call no changes
      if (userRolesData.length === 0 && deletePayload.roleIds.length === 0) {
        appStore.showToast("No changes to submit.", "error");
        return;
      }

      // update
      if (userRolesData.length > 0) {
        const response = await api.post("administrator/document-type-roles", {
          body: userRolesData,
        });
        appStore.showToast(response.message, "success");
      }

      // delete
      if (deletePayload.roleIds.length > 0) {
        const response = await api.delete("administrator/document-type-roles", {
          body: deletePayload,
        });
        appStore.showToast(response.message, "success");
      }
      await fetchRightData();
    } catch (error) {
      console.error("Error submitting role changes:", error);
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
    const selected = documentTypes.find((doc) => doc.id === id);
    setCurrentObj(selected);
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
    setOpenDialog(false);
    try {
      const response = await api.delete(
        `administrator/document-types/${currentObj.id}`
      );
      if (response.message.length > 0) {
        await fetchData();
      }
    } catch (error) {
      console.error("Error deleting document type:", error);
    }
  };

  const renderTab = (tabIndex: number) => {
    switch (tabIndex) {
      case 0:
        return <Properties entity={currentObj} reloadEntities={fetchData} />;
      case 1:
        return (
          <RolesManagers
            leftSideRoles={leftSideRoles}
            rightSideRoles={rightSideRoles}
            currentObjId={currentObj?.id}
            onSubmit={handleSubmit}
            userInfoComponent={
              <UserHeaderBox>
                <UserInfoBox>
                  <Typography variant="h6" sx={{ color: Themecolors.UH_text3 }}>
                    {currentObj?.documentTypeDescription}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: Themecolors.UH_text3 }}
                  >
                    {currentObj?.documentGroupName}
                  </Typography>
                </UserInfoBox>
              </UserHeaderBox>
            }
            filterType={1}
          />
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
                      {"Document Management"}
                    </Typography>
                  </InfoBox>
                </HeaderBox>
                <Box
                  sx={{
                    flex: 1,
                    overflow: "hidden",
                  }}
                >
                  <DataGrid
                    tasks={documentTypes}
                    columns={documentColumns}
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
                  tabs={["Properties", "Roles"]}
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
            Are you sure you want to delete document type{" "}
            <strong>{currentObj?.documentTypeName || ""}</strong>?
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

export default DocumentManagement;
