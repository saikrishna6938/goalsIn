import { Box } from "@mui/material";
import { api } from "api/API";
import appStore from "app/mobxStore/AppStore";
import RolesManagers from "app/user/userManagement/RolesManagers";
import React, { useEffect, useState } from "react";

interface DocumentState {
  documentStateId: number;
  documentStateName: string;
  documentStateDescription: string;
  documentStateCreatedDate: string;
  documentStateUpdatedDate: string;
  WorkflowID: number;
  steps: number;
}

interface Props {
  currentObj?: DocumentState;
}

enum RoleTypes {
  JobRoles = 1,
  DefaultRole = 2,
  SecurityRole = 3,
  ApprovalRoles = 4,
  PropertyRoles = 5,
}

const Approvers: React.FC<Props> = ({ currentObj }) => {
  const [leftSideRoles, SetLeftSideRoles] = useState<any[]>([]);
  const [rightSideRoles, SetRightSideRoles] = useState<any[]>([]);

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
    fetchRightData();
  }, [currentObj?.documentStateId]);

  const fetchRightData = async () => {
    try {
      const response = await api.get(
        `administrator/workflows/document-states/approvers/${currentObj?.documentStateId}`
      );
      SetRightSideRoles(response.data);
    } catch (err) {
      throw err;
    }
  };

  const handleSubmit = async (newlyAddedRoles: any[], deletedRoles: any[]) => {
    const roleNameIdsToAdd =
      newlyAddedRoles?.map((role) => role.roleNameId) || [];
    const roleNameIdsToDelete =
      deletedRoles?.map((role) => role.roleNameId) || [];

    try {
      // Skip API call if no changes
      if (roleNameIdsToAdd.length === 0 && roleNameIdsToDelete.length === 0) {
        appStore.showToast("No changes to submit.", "error");
        return;
      }

      if (roleNameIdsToAdd.length > 0) {
        const response = await api.post(
          "administrator/workflows/document-states/approvers",
          {
            body: {
              documentStatesId: currentObj?.documentStateId,
              roleNameIds: roleNameIdsToAdd,
            },
          }
        );
        appStore.showToast(
          response.message || "Roles added successfully.",
          "success"
        );
      }

      // DELETE: Remove roles
      if (roleNameIdsToDelete.length > 0) {
        const response = await api.delete(
          "administrator/workflows/document-states/approvers",
          {
            body: {
              documentStatesId: currentObj?.documentStateId,
              roleNameIds: roleNameIdsToDelete,
            },
          }
        );
        appStore.showToast(
          response.message || "Roles removed successfully.",
          "success"
        );
      }

      await fetchRightData();
    } catch (error) {
      console.error("Error submitting role changes:", error);
      appStore.showToast(
        "An error occurred while submitting changes.",
        "error"
      );
    }
  };

  return (
    <Box sx={{ height: "100%", overflow: "auto" }}>
      <RolesManagers
        leftSideRoles={leftSideRoles}
        rightSideRoles={rightSideRoles}
        onSubmit={handleSubmit}
        filterType={RoleTypes.ApprovalRoles}
      />
    </Box>
  );
};

export default Approvers;
