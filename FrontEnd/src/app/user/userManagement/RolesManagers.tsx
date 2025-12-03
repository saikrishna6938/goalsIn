import React, { useEffect, useState } from "react";
import { Paper, Box, Divider, TablePagination, styled } from "@mui/material";
import UserHeaderComponent from "app/appComponents/UserHeaderComponent";
import ListComponent from "./ListComponent";
import IconButton from "@mui/material/IconButton";
import appStore from "app/mobxStore/AppStore";

interface RolesManagersProps {
  currentObjId?: any;
  userInfoComponent?: React.ReactNode;
  filterType?: Number;
  leftSideRoles?: any[];
  rightSideRoles?: any[];
  onSubmit?: (addedRoles: any[], deletedRoles: any[]) => void;
  leftHeadertitle?: string;
  rightHeadertitle?: string;
  CopyPastButton?: boolean;
}

const RolesManagers: React.FC<RolesManagersProps> = ({
  currentObjId,
  userInfoComponent,
  filterType,
  leftSideRoles,
  rightSideRoles,
  onSubmit,
  leftHeadertitle = "All Roles",
  rightHeadertitle = "Selected Roles",
  CopyPastButton = true,
}) => {
  const [pageLeft, setPageLeft] = useState(0);
  const [rowsPerPageLeft, setRowsPerPageLeft] = useState(5);
  const [pageRight, setPageRight] = useState(0);
  const [rowsPerPageRight, setRowsPerPageRight] = useState(5);
  const [left, setLeft] = useState<any[]>([]);
  const [right, setRight] = useState<any[]>([]);
  const [searchLeftRoles, setSearchLeftRoles] = useState("");
  const [searchRightRoles, setSearchRightRoles] = useState("");
  const [originalRightRoles, setOriginalRightRoles] = useState<any[]>([]);
  const [newlyAddedRoles, setNewlyAddedRoles] = useState<any[]>([]);
  const [deletedRoles, setDeletedRoles] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [copiedRolesBuffer, setCopiedRolesBuffer] = useState<any[]>([]);

  useEffect(() => {
    const uniqueRoles = rightSideRoles.filter(
      (role, index, self) =>
        index === self.findIndex((r) => r.roleNameId === role.roleNameId)
    );
    setRight(uniqueRoles);
    setOriginalRightRoles(uniqueRoles);
    setNewlyAddedRoles([]);
    setDeletedRoles([]);
  }, [rightSideRoles]);

  useEffect(() => {
    let filteredLeftRoles = leftSideRoles.filter(
      (role: any) =>
        !right.some(
          (rightRole: any) => rightRole.roleNameId === role.roleNameId
        )
    );
    if (filterType) {
      filteredLeftRoles = filteredLeftRoles.filter(
        (r) => r.roleTypeId === filterType
      );
    }
    setLeft(filteredLeftRoles);
  }, [leftSideRoles, right]);

  const handleMoveToRight = (roleId: number) => {
    const roleToMove = left.find((role) => role.roleNameId === roleId);
    if (roleToMove) {
      setLeft(left.filter((role) => role.roleNameId !== roleId));
      setRight([...right, roleToMove]);

      const wasInOriginal = originalRightRoles.some(
        (role) => role.roleNameId === roleId
      );

      if (!wasInOriginal) {
        setNewlyAddedRoles((prev) => {
          const alreadyExists = prev.some((r) => r.roleNameId === roleId);
          return alreadyExists ? prev : [...prev, roleToMove];
        });
      }
      setDeletedRoles((prev) =>
        prev.filter((role) => role.roleNameId !== roleId)
      );
    }
  };

  const handleMoveToLeft = (roleId: number) => {
    const roleToMove = right.find((role) => role.roleNameId === roleId);
    if (roleToMove) {
      setRight(right.filter((role) => role.roleNameId !== roleId));
      setLeft([...left, roleToMove]);

      const wasInOriginal = originalRightRoles.some(
        (role) => role.roleNameId === roleId
      );

      if (wasInOriginal) {
        setDeletedRoles((prev) => {
          const alreadyExists = prev.some((r) => r.roleNameId === roleId);
          return alreadyExists ? prev : [...prev, roleToMove];
        });
      }
      setNewlyAddedRoles((prev) =>
        prev.filter((role) => role.roleNameId !== roleId)
      );
    }
  };

  const handleSearchLeftRoles = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchLeftRoles(e.target.value);
  };

  const handleSearchRightRoles = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchRightRoles(e.target.value);
  };

  const handleCopy = () => {
    if (right.length > 0) {
      setCopiedRolesBuffer(right);
      setCopied(true);
    }
  };
  const handlePast = () => {
    if (copiedRolesBuffer.length > 0) {
      const newRoles = copiedRolesBuffer.filter(
        (copiedRole) =>
          !right.some(
            (existing) => existing.roleNameId === copiedRole.roleNameId
          )
      );

      if (newRoles.length === 0) {
        appStore.showToast(
          "No new roles to paste (all are already present",
          "info"
        );

        setCopied(false);

        return;
      }

      const updatedRight = [...right, ...newRoles];
      setRight(updatedRight);

      const updatedLeft = left.filter(
        (role) =>
          !newRoles.some((newRole) => newRole.roleNameId === role.roleNameId)
      );
      setLeft(updatedLeft);

      const trulyNew = newRoles.filter(
        (role) =>
          !originalRightRoles.some(
            (original) => original.roleNameId === role.roleNameId
          )
      );
      setNewlyAddedRoles((prev) => [
        ...prev,
        ...trulyNew.filter(
          (role) => !prev.some((r) => r.roleNameId === role.roleNameId)
        ),
      ]);

      setDeletedRoles((prev) =>
        prev.filter(
          (role) =>
            !newRoles.some((newRole) => newRole.roleNameId === role.roleNameId)
        )
      );

      setCopied(false);
    }
  };

  return (
    <Paper
      sx={{
        display: "flex",
        height: "100%",
        overflow: "hidden",
        flexDirection: "column",
        borderRadius: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <UserHeaderComponent
            copied={copied}
            CopyPastButton={CopyPastButton}
            onPastButtonClick={handlePast}
            onCopyButtonClick={handleCopy}
            userInfoComponent={userInfoComponent}
            ShowsaveButton={true}
            ButtonName={"Update"}
            onButtonClick={() => onSubmit(newlyAddedRoles, deletedRoles)}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            flex: 1,
            overflow: "hidden",
            minHeight: 0,
            mt: "1px",
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              overflowX: "hidden",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              maxHeight: "100%",
            }}
          >
            <ListComponent
              rows={25}
              Headertitle={leftHeadertitle}
              items={left}
              onSearch={handleSearchLeftRoles}
              searchValue={searchLeftRoles}
              rowsPerPage={rowsPerPageLeft}
              page={pageLeft}
              setPage={setPageLeft}
              renderItemText={(role) => role.roleName}
              renderItemId={(role) => role.roleNameId}
              onMoveToRight={handleMoveToRight}
            />
          </Box>
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              display: { xs: "none", md: "block" },
              borderWidth: "1.5px",
              marginX: "5px",
              my: "2px",
            }}
          />
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              maxHeight: "100%",
            }}
          >
            <ListComponent
              rows={25}
              Headertitle={rightHeadertitle}
              items={right}
              onSearch={handleSearchRightRoles}
              searchValue={searchRightRoles}
              rowsPerPage={rowsPerPageRight}
              page={pageRight}
              setPage={setPageRight}
              renderItemText={(role) => role.roleName}
              renderItemId={(role) => role.roleNameId}
              onMoveToLeft={handleMoveToLeft}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default RolesManagers;
