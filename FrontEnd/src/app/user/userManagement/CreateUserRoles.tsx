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
import CloseIcon from "@mui/icons-material/Close";
import RoleForm from "./RoleForm";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const roleColumns: any = [
  { id: "id", label: "ID", type: "number" },
  { id: "roleName", label: "Role Name", type: "string" },
  { id: "roleNameDescription", label: "Role Name Description", type: "string" },
];

const CreateUserRoles: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [currentRole, setCurrentRole] = useState<any>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [resetKey, setResetKey] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.get("administrator/roles/names/get");
      const mapData = res.data.map(({ roleNameId, ...rest }) => ({
        id: roleNameId,
        ...rest,
      }));

      setRoles(mapData);

      if (currentRole?.id) {
        const matchedRole = mapData.find((role) => role.id === currentRole.id);
        if (matchedRole) {
          setCurrentRole(matchedRole);
          return;
        }
      }

      if (mapData.length > 0) {
        setCurrentRole(mapData[0]);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleSelection = (id: number) => {
    if (id === null) {
      setResetKey(false);
      return;
    }

    const selected = roles.find((role) => role?.id === id);
    setCurrentRole(selected);
  };

  const handleTabChange = (_e: any, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleFilterAction = (value: string) => {
    switch (value) {
      case "Create":
        setCurrentRole({});
        setResetKey(true);
        break;

      case "Delete":
        if (currentRole) {
          setOpenDialog(true);
        }
        break;
    }
  };

  const handleDelete = async () => {
    setOpenDialog(false);
    try {
      await api.delete(`administrator/roles/names/delete/${currentRole.id}`);
      fetchRoles();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const renderTab = (tabIndex: number) => {
    switch (tabIndex) {
      case 0:
        return <RoleForm role={currentRole} onReload={fetchRoles} />;

      default:
        return null;
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
                    {"Role Management"}
                  </Typography>
                </InfoBox>
              </HeaderBox>
              <Box sx={{ flex: 1, overflow: "hidden" }}>
                <DataGrid
                  tasks={roles}
                  columns={roleColumns}
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
                tabs={["Roles"]}
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
          <strong>{currentRole?.roleName}</strong>?
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

export default CreateUserRoles;
