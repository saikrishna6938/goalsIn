import React, { useEffect, useState, useRef } from "react";
import { Box, Modal, Typography } from "@mui/material";
import { api } from "api/API";
import appStore from "app/mobxStore/AppStore";
import RolesManagers from "app/user/userManagement/RolesManagers";
import FilterButtonComponent from "app/formComponents/FilterButtonComponent";
import DropDownTable from "app/admin/formManagement/userform/DropDownTable";
import CustomButton from "app/components/CustomButton ";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";

interface Props {
  currentObj: any;
}

const Roles: React.FC<Props> = ({ currentObj }) => {
  const [leftSideRoles, setLeftSideRoles] = useState<any[]>([]);
  const [rightSideRoles, setRightSideRoles] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [actionList, setActionList] = useState<any[]>([]);
  const resetDropDownFormRef = useRef<any>(null);

  useEffect(() => {
    if (open) {
      if (leftSideRoles && leftSideRoles.length > 0) {
        setActionList(
          leftSideRoles.map((role) => ({
            id: role.roleNameId,
            name: role.roleName,
          }))
        );
      } else {
        setActionList([]);
      }
    }
  }, [open, leftSideRoles]);

  useEffect(() => {
    fetchLeft();
  }, []);

  const fetchLeft = async () => {
    try {
      const res = await api.get("administrator/user-settings-types");
      const mapped = res.map((item) => ({
        roleNameId: item.Id,
        roleName: item.Name,
      }));

      setLeftSideRoles(mapped);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (!currentObj?.id) return;
    fetchRight();
  }, [currentObj?.id]);

  const fetchRight = async () => {
    try {
      const res = await api.get(
        `administrator/sub-profile-settings/${currentObj?.id}/names`
      );
      const mapped = res.names.map((name, index) => ({
        roleNameId: index + 1,
        roleName: name,
      }));
      setRightSideRoles(mapped);
    } catch (error) {
      console.error("Failed to fetch sub-profile settings:", error);
    }
  };

  const handleSubmit = async (newlyAddedRoles: any[], deletedRoles: any[]) => {
    const rolesToAdd = newlyAddedRoles?.map((r) => r.roleNameId);
    const rolesToDelete = deletedRoles?.map((r) => r.roleNameId);

    try {
      if (rolesToAdd.length === 0 && rolesToDelete.length === 0) {
        appStore.showToast("No changes to submit.", "error");
        return;
      }

      if (rolesToAdd.length > 0) {
        const res = await api.post(
          `administrator/sub-profile-settings/${currentObj?.id}/names`,
          {
            body: {
              id: currentObj?.id,
              roleNameIds: rolesToAdd,
            },
          }
        );
        appStore.showToast(res.message || "Settings added.", "success");
      }

      if (rolesToDelete.length > 0) {
        const res = await api.delete(
          `administrator/sub-profile-settings/${currentObj?.id}/names`,
          {
            body: {
              id: currentObj?.id,
              roleNameIds: rolesToDelete,
            },
          }
        );
        appStore.showToast(res.message || "Settings removed.", "success");
      }

      await fetchRight();

      const refresh = await api.get(
        `administrator/sub-profile-settings/${currentObj?.id}/names`
      );
      const mapped = refresh.data.names.map((name, index) => ({
        roleNameId: index + 1,
        roleName: name,
      }));
      setRightSideRoles(mapped);
    } catch (error) {
      throw error;
    }
  };

  const handleSaveProfile = async () => {
    if (!actionList || actionList.length === 0) {
      appStore.showToast("Please add at least one profile", "error");
      return;
    }

    let changesMade = false;

    try {
      const deletedRoles = leftSideRoles.filter(
        (role) => !actionList.some((row) => row.id === role.roleNameId)
      );

      for (const row of actionList) {
        const profileId = row?.id;
        const profileName = row?.name?.trim();
        if (!profileName) continue;

        const existing = leftSideRoles?.find((d) => d.roleNameId === profileId);

        if (existing) {
          if (existing.roleName !== profileName) {
            const res = await api.put(
              `administrator/user-settings-types/${profileId}`,
              {
                body: { Name: profileName },
              }
            );
            appStore.showToast(res.message, res.status ? "success" : "error");
            changesMade = true;
          }
        } else {
          const res = await api.post("administrator/user-settings-types", {
            body: { Name: profileName },
          });
          appStore.showToast(res.message, res.status ? "success" : "error");
          changesMade = true;
        }
      }

      for (const role of deletedRoles) {
        try {
          const res = await api.delete(
            `administrator/user-settings-types/${role.roleNameId}`
          );
          appStore.showToast(res.message || "Deleted successfully", "success");
          changesMade = true;
        } catch (err) {
          console.error("Error deleting profile:", err);
          appStore.showToast("Failed to delete profile", "error");
        }
      }

      if (changesMade) {
        setOpen(false);
        fetchLeft();
      } else {
        appStore.showToast("No changes to save", "info");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      appStore.showToast("Failed to save profiles", "error");
    }
  };

  return (
    <>
      <Box sx={{ height: "100%", overflow: "auto" }}>
        <RolesManagers
          leftSideRoles={leftSideRoles}
          rightSideRoles={rightSideRoles}
          onSubmit={handleSubmit}
          leftHeadertitle={"Profile Names"}
          rightHeadertitle={"Selected Users"}
          userInfoComponent={
            <Box sx={{ ml: 2 }}>
              <FilterButtonComponent
                categories={["Setting Name"]}
                onButtonClick={() => setOpen(true)}
              />
            </Box>
          }
        />
      </Box>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "45%",
            bgcolor: "white",
            p: 3,
            borderRadius: 2,
            boxShadow: 24,
            maxHeight: "70%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: "bold", mb: 2 }}>
            Setting Type
          </Typography>
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <DropDownTable
              onResetRef={resetDropDownFormRef}
              columns={[
                {
                  colName: "Id",
                  colData: [],
                  colType: 2,
                  colWidth: "120px",
                  key: "id",
                  disabled: true,
                },
                {
                  colName: "Name",
                  colData: [],
                  colType: 1,
                  colWidth: "200px",
                  key: "name",
                },
              ]}
              data={actionList}
              onAddRow={(newRow) => setActionList((prev) => [...prev, newRow])}
              onEditRow={(index, updatedRow) => {
                const updated = [...actionList];
                updated[index] = updatedRow;
                setActionList(updated);
              }}
              onDeleteRow={(index) => {
                const updated = [...actionList];
                updated.splice(index, 1);
                setActionList(updated);
              }}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            <PrimaryButton
              label="Cancel"
              startIcon={<CancelIcon />}
              type="button"
              onClick={() => setOpen(false)}
            />
            <PrimaryButton
              label="Save"
              startIcon={<SaveIcon />}
              type="submit"
              onClick={handleSaveProfile}
            />
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default Roles;
