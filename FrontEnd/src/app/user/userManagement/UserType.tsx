import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { api } from "api/API";
import appStore from "app/mobxStore/AppStore";
import RolesManagers from "app/user/userManagement/RolesManagers";
import userStore from "./UserStore";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";

interface Role {
  roleNameId: number;
  roleName: string;
}

interface Props {
  currentObj: {
    id: string | number;
    [key: string]: any;
  };
}

const UserType: React.FC<Props> = observer(({ currentObj }) => {
  const [leftSideRoles, setLeftSideRoles] = useState<Role[]>([]);
  const [rightSideRoles, setRightSideRoles] = useState<Role[]>([]);

  useEffect(() => {
    if (!currentObj?.id) return;
    fetchRight();
  }, [currentObj?.id]);

  useEffect(() => {
    const allUsers: Role[] = toJS(userStore.users).map((item) => ({
      roleNameId: item.userId,
      roleName: `${item.userFirstName} ${item.userLastName}`,
    }));

    const filtered = allUsers.filter(
      (user) =>
        !rightSideRoles.some((right) => right.roleNameId === user.roleNameId)
    );

    setLeftSideRoles(filtered);
  }, [rightSideRoles, userStore.users]);

  const fetchRight = async () => {
    try {
      const res = await api.get(
        `administrator/user-sub-profile-types/by-sub-profile/${currentObj?.id}/users`
      );

      const mappedRight: Role[] = (res?.users || []).map((user: any) => ({
        roleNameId: user.userId,
        roleName: `${user.userFirstName} ${user.userLastName}`,
      }));

      setRightSideRoles(mappedRight);
    } catch (error) {
      console.error("Failed to fetch sub-profile settings:", error);
    }
  };

  const handleSubmit = async (
    newlyAddedRoles: Role[],
    deletedRoles: Role[]
  ) => {
    const rolesToAdd = newlyAddedRoles?.map((r) => r.roleNameId);
    const rolesToDelete = deletedRoles?.map((r) => r.roleNameId);

    try {
      if (rolesToAdd.length === 0 && rolesToDelete.length === 0) {
        appStore.showToast("No changes to submit.", "error");
        return;
      }

      if (rolesToAdd.length > 0) {
        const res = await api.post(
          `administrator/user-sub-profile-types/assign`,
          {
            body: {
              subProfileId: currentObj?.id,
              userIds: rolesToAdd,
            },
          }
        );
        appStore.showToast(res.message || "Settings added.", "success");
      }

      if (rolesToDelete.length > 0) {
        const res = await api.post(
          `administrator/user-sub-profile-types/unassign`,
          {
            body: {
              subProfileId: currentObj?.id,
              userIds: rolesToDelete,
            },
          }
        );
        appStore.showToast(res.message || "Settings removed.", "success");
      }

      await fetchRight();
    } catch (error) {
      console.error("Error while submitting changes:", error);
    }
  };

  return (
    <Box sx={{ height: "100%", overflow: "auto" }}>
      <RolesManagers
        leftSideRoles={leftSideRoles}
        rightSideRoles={rightSideRoles}
        onSubmit={handleSubmit}
        leftHeadertitle="Available Users"
        rightHeadertitle="Selected Users"
        CopyPastButton={false}
      />
    </Box>
  );
});

export default UserType;
