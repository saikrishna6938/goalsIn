import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { api } from "api/API";
import { HeaderBox, InfoBox } from "app/appComponents/HeaderBox";
import DataGrid from "app/formComponents/DataGrid";
import { Split } from "app/formComponents/styles/Split";
import TabBar from "app/formComponents/TabBar";
import FilterButtonComponent from "app/formComponents/FilterButtonComponent";
import CustomButton from "app/components/CustomButton ";
import RoleForm from "./RoleForm";
import RoleTypeForm from "./RoleTypeForm";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const roleTypeColumns: any = [
  { id: "id", label: "ID", type: "number" },
  { id: "roleTypeName", label: "Type Name", type: "string" },
  { id: "roleTypeDescription", label: "Description", type: "string" },
];

const RoleTypes: React.FC = () => {
  const [roleTypes, setRoleTypes] = useState<any[]>([]);
  const [currentType, setCurrentType] = useState<any>(null);
  console.log("currentType", currentType);
  const [resetKey, setResetKey] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchRoleTypes();
  }, []);

  const fetchRoleTypes = async () => {
    try {
      const res = await api.get("administrator/types/role-type/get");
      const mapped = res.data.map(({ roleTypeId, ...rest }) => ({
        id: roleTypeId,
        ...rest,
      }));

      setRoleTypes(mapped);

      if (currentType?.id) {
        const match = mapped.find((t) => t.id === currentType.id);
        if (match) {
          setCurrentType(match);
          return;
        }
      }

      if (mapped.length > 0) {
        setCurrentType(mapped[0]);
      }
    } catch (error) {
      console.error("Failed to load role types", error);
    }
  };

  const handleSelection = (id: number) => {
    if (id === null) {
      setResetKey(false);
      return;
    }

    const selected = roleTypes.find((r) => r.id === id);
    setCurrentType(selected);
  };

  const handleFilterAction = (value: string) => {
    switch (value) {
      case "Create":
        setCurrentType({});
        setResetKey(true);
        break;

      case "Delete":
        if (currentType) {
          setOpenDialog(true);
        }
        break;
    }
  };

  const handleDelete = async () => {
    setOpenDialog(false);

    try {
      await api.delete(
        `administrator/types/role-type/delete/${currentType.id}`
      );
      fetchRoleTypes();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const renderTab = (tabIndex: number) => {
    switch (tabIndex) {
      case 0:
        return (
          <RoleTypeForm roleType={currentType} onReload={fetchRoleTypes} />
        );

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
                    {"Role Types"}
                  </Typography>
                </InfoBox>
              </HeaderBox>
              <Box sx={{ flex: 1, overflow: "hidden" }}>
                <DataGrid
                  tasks={roleTypes}
                  columns={roleTypeColumns}
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
                onChange={(_e, val) => setSelectedTab(val)}
                tabs={["Roles Type"]}
              />
              <Box sx={{ height: "100%", overflow: "hidden", mt: "5px" }}>
                {renderTab(selectedTab)}
              </Box>
            </div>
          }
        />
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete role type{" "}
          <strong>{currentType?.roleTypeName}</strong>?
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

export default RoleTypes;
