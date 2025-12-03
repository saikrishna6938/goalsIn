import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { api } from "api/API";
import { HeaderBox, InfoBox } from "app/appComponents/HeaderBox";
import DataGrid from "app/formComponents/DataGrid";
import { Split } from "app/formComponents/styles/Split";
import TabBar from "app/formComponents/TabBar";
import React, { useEffect, useState } from "react";
import EntityForm from "./EntityForm";
import FilterButtonComponent from "app/formComponents/FilterButtonComponent";
import appStore from "app/mobxStore/AppStore";
import CustomButton from "app/components/CustomButton ";
import CloseIcon from "@mui/icons-material/Close";
import structureStore from "./StructureStore";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const columns: any = [
  { id: "id", label: "Id", type: "number" },
  { id: "entityName", label: "Name", type: "string" },
  { id: "entityDescription", label: "Description", type: "string" },
  { id: "entityLocation", label: "Location", type: "string" },
  { id: "entityPhone", label: "Phone", type: "number" },
  { id: "roleName", label: "Role Name", type: "string" },
];

const Structure: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [entities, setEntities] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>({});
  const [resetKey, setResetKey] = useState(false);
  const [open, SetOpen] = useState(false);
  const [roleData, SetRoleData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rolesResponse = await api.get("administrator/roles/names/get");
        const roleData = rolesResponse.data;
        structureStore.setRoleData(roleData);
        SetRoleData(roleData);

        const entitiesResponse = await api.get("entities");
        const filterdata = entitiesResponse.entities.map(
          ({ entityId, ...rest }) => {
            const matchedRole = roleData.find(
              (f) => f.roleNameId === rest.userRoleNameId
            );

            return {
              id: entityId,
              ...rest,
              roleName: matchedRole ? matchedRole.roleName : "",
            };
          }
        );
        setEntities(filterdata);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const reloadEntity = async () => {
    try {
      const currentSelectedId = selectedItem?.id;
      const response = await api.get("entities");
      const entityData = response.entities.map(({ entityId, ...rest }) => {
        const matchedRole = roleData.find(
          (f) => f.roleNameId === rest.userRoleNameId
        );
        return {
          id: entityId,
          ...rest,
          roleName: matchedRole ? matchedRole.roleName : "",
        };
      });

      setEntities(entityData);

      if (entityData.length > 0) {
        const selected = entityData.find(
          (entity) => entity.id === currentSelectedId
        );
        setSelectedItem(selected || entityData[0]);
      }
    } catch (error) {
      console.error("Failed to reload entities:", error);
    }
  };

  useEffect(() => {
    if (entities.length > 0 && !selectedItem?.id) {
      const firstEntity = entities[0];
      setSelectedItem(firstEntity);
    }
  }, [entities]);

  const handleOptionsChange = (value: string) => {
    switch (value) {
      case "Create Entity":
        setSelectedItem({});
        setResetKey(true);
        break;
      case "Delete Entity":
        deleteUser();
        break;
      default:
        console.log("Invalid Option");
    }
  };

  const deleteUser = () => {
    SetOpen(true);
  };

  const handleDeleteEntity = async () => {
    SetOpen(false);
    try {
      const response = await api.delete(`delete-entity/${selectedItem.id}`);
      if (response.success) {
        appStore.showToast(response.message, "success");
        reloadEntity();
      } else {
        appStore.showToast(response.message, "error");
      }
    } catch (error) {
      console.error("Failed to reload entities:", error);
    }
  };

  const handleRowSelection = (id: number) => {
    if (id === null) {
      setResetKey(false);
      return;
    }
    const curObj = entities.find((f) => f.id === id);
    setSelectedItem(curObj);
  };

  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleDialogClose = () => {
    SetOpen(false);
  };

  const renderTab = (tabIndex: number) => {
    switch (tabIndex) {
      case 0:
        return (
          <EntityForm
            entity={selectedItem}
            reloadEntities={reloadEntity}
            roleData={roleData}
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
                      {"STRUCTURES"}
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
                    tasks={entities}
                    columns={columns}
                    onSelection={handleRowSelection}
                    resetSelectionRowId={resetKey}
                    defaultHeight="100%"
                    filterComponent={
                      <FilterButtonComponent
                        categories={["Create Entity", "Delete Entity"]}
                        onButtonClick={handleOptionsChange}
                        getIcon={(category) => {
                          switch (category) {
                            case "Create Entity":
                              return <AddCircleIcon />;
                            case "Delete Entity":
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
                  tabs={["Properties"]}
                />
                <Box
                  sx={{
                    height: "100%",
                    overflow: "hidden",
                  }}
                >
                  {renderTab(selectedTab)}
                </Box>
              </div>
            }
          />
        </Box>
      </Box>
      <>
        <Box>
          <Dialog
            open={open}
            onClose={handleDialogClose}
            maxWidth="xs"
            fullWidth
          >
            <IconButton
              onClick={handleDialogClose}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "grey.500",
                cursor: "pointer",
              }}
            >
              <CloseIcon />
            </IconButton>
            {selectedItem && Object.keys(selectedItem).length > 0 ? (
              <>
                <DialogTitle>Confirm</DialogTitle>
                <DialogContent>
                  <Typography>
                    Are you sure want to delete the entity
                    <strong style={{ marginLeft: "7px" }}>
                      {selectedItem?.entityName || ""}
                    </strong>
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <PrimaryButton
                    label="Cancel"
                    startIcon={<CancelIcon />}
                    type="button"
                    onClick={handleDialogClose}
                  />
                  <PrimaryButton
                    label="Delete"
                    startIcon={<DeleteIcon />}
                    type="button"
                    onClick={handleDeleteEntity}
                  />
                </DialogActions>
              </>
            ) : (
              <>
                <DialogContent>
                  <Typography>Please select the entity</Typography>
                </DialogContent>
              </>
            )}
          </Dialog>
        </Box>
      </>
    </div>
  );
};

export default Structure;
