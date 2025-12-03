import React, { useEffect, useState } from "react";
import {
  Box,
  Divider,
  Paper,
  TablePagination,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UserHeaderComponent from "app/appComponents/UserHeaderComponent";
import HeaderTypography from "app/formComponents/HeaderTypography";
import { Delete } from "@mui/icons-material";
import { api } from "api/API"; // Ensure you have the correct API import
import appStore from "app/mobxStore/AppStore";

interface Props {
  currentObjId: any;
  userInfoComponent?: React.ReactNode;
  onSubmit?: (addedRoles: any[], deletedRoles: any[]) => void;
}

const DocumentRoles: React.FC<Props> = ({
  currentObjId,
  userInfoComponent,
  onSubmit,
}) => {
  const [pageLeft, setPageLeft] = useState(0);
  const [rowsPerPageLeft, setRowsPerPageLeft] = useState(25);
  const [pageRight, setPageRight] = useState(0);
  const [rowsPerPageRight, setRowsPerPageRight] = useState(25);

  const [leftRoles, setLeftRoles] = useState<any[]>([]);
  const [rightRoles, setRightRoles] = useState<any[]>([]);
  const [originalRightRoles, setOriginalRightRoles] = useState<any[]>([]);
  const [newlyAddedRoles, setNewlyAddedRoles] = useState<any[]>([]);
  const [deletedRoles, setDeletedRoles] = useState<any[]>([]);

  const [searchLeftRoles, setSearchLeftRoles] = useState("");
  const [searchRightRoles, setSearchRightRoles] = useState("");

  useEffect(() => {
    if (currentObjId) {
      fetchLeftData();
      fetchRightData();
    }
  }, [currentObjId]);

  // Get left Roles
  const fetchLeftData = async () => {
    try {
      const leftResponse = await api.get("administrator/document-types");
      setLeftRoles(leftResponse || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Get right Roles
  const fetchRightData = async () => {
    try {
      const rightResponse = await api.get(
        `administrator/workflows/document-types/${currentObjId}`
      );

      const uniqueRightRoles =
        rightResponse?.data?.filter(
          (role, index, self) =>
            index ===
            self.findIndex((r) => r.documentTypeId === role.documentTypeId)
        ) || [];

      setRightRoles(uniqueRightRoles);
      setOriginalRightRoles(uniqueRightRoles);
      setNewlyAddedRoles([]);
      setDeletedRoles([]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const filteredLeftRoles = leftRoles.filter(
      (leftRole: any) =>
        !rightRoles.some(
          (rightRole: any) =>
            rightRole.documentTypeId === leftRole.documentTypeId
        )
    );
    setLeftRoles(filteredLeftRoles);
  }, [leftRoles, rightRoles]);

  const handleMoveToRight = (roleId: number) => {
    const roleToMove = leftRoles.find((role) => role.documentTypeId === roleId);
    if (roleToMove) {
      setLeftRoles(leftRoles.filter((role) => role.documentTypeId !== roleId));
      setRightRoles([...rightRoles, roleToMove]);

      const wasInOriginal = originalRightRoles.some(
        (role) => role.documentTypeId === roleId
      );

      if (!wasInOriginal) {
        setNewlyAddedRoles((prev) => {
          const alreadyExists = prev.some((r) => r.documentTypeId === roleId);
          return alreadyExists ? prev : [...prev, roleToMove];
        });
      }

      setDeletedRoles((prev) =>
        prev.filter((role) => role.documentTypeId !== roleId)
      );
    }
  };

  const handleMoveToLeft = (roleId: number) => {
    const roleToMove = rightRoles.find(
      (role) => role.documentTypeId === roleId
    );
    if (roleToMove) {
      setRightRoles(
        rightRoles.filter((role) => role.documentTypeId !== roleId)
      );
      setLeftRoles([...leftRoles, roleToMove]);

      const wasInOriginal = originalRightRoles.some(
        (role) => role.documentTypeId === roleId
      );

      if (wasInOriginal) {
        setDeletedRoles((prev) => {
          const alreadyExists = prev.some((r) => r.documentTypeId === roleId);
          return alreadyExists ? prev : [...prev, roleToMove];
        });
      }

      setNewlyAddedRoles((prev) =>
        prev.filter((role) => role.documentTypeId !== roleId)
      );
    }
  };

  const handleSearchLeftRoles = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchLeftRoles(e.target.value);
  };

  const handleSearchRightRoles = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchRightRoles(e.target.value);
  };

  const filteredLeftRoles = leftRoles.filter((role) =>
    role.documentTypeName.toLowerCase().includes(searchLeftRoles.toLowerCase())
  );

  const filteredRightRoles = rightRoles.filter((role) =>
    role.documentTypeName.toLowerCase().includes(searchRightRoles.toLowerCase())
  );

  const handleSubmit = async (newlyAddedRoles: any[], deletedRoles: any[]) => {
    const workflowID = currentObjId;

    const addedDocumentTypeIds =
      newlyAddedRoles?.map((role) => role.documentTypeId) || [];

    const deletedDocumentTypeIds =
      deletedRoles?.map((role) => role.documentTypeId) || [];

    try {
      if (
        addedDocumentTypeIds.length === 0 &&
        deletedDocumentTypeIds.length === 0
      ) {
        appStore.showToast("No changes to submit.", "error");
        return;
      }

      // POST - Add new document type roles
      if (addedDocumentTypeIds.length > 0) {
        const response = await api.post(
          "administrator/workflows/document-types",
          {
            body: {
              workflowID,
              documentTypeIds: addedDocumentTypeIds,
            },
          }
        );
        appStore.showToast(response.message, "success");
      }

      // DELETE - Remove document type roles
      if (deletedDocumentTypeIds.length > 0) {
        const response = await api.delete(
          "administrator/workflows/document-types",
          {
            body: {
              workflowID,
              documentTypeIds: deletedDocumentTypeIds,
            },
          }
        );
        appStore.showToast(response.message, "success");
      }

      await fetchRightData();
      setNewlyAddedRoles([]);
      setDeletedRoles([]);
    } catch (error) {
      const errorMessage = error?.message;
      appStore.showToast(errorMessage, "error");
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
            userInfoComponent={userInfoComponent}
            ShowsaveButton={true}
            ButtonName={"Update"}
            onButtonClick={() => handleSubmit?.(newlyAddedRoles, deletedRoles)}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            flex: 1,
            overflow: "hidden",
            mt: "1px",
          }}
        >
          {/* Left Side */}
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              maxHeight: "100%",
            }}
          >
            <HeaderTypography
              title={"Available"}
              searchEnabled={true}
              onSearch={handleSearchLeftRoles}
              searchValue={searchLeftRoles}
              TextFieldWidth={"170px"}
            />
            <Box
              sx={{
                overflowY: "auto",
                maxHeight: "calc(100% - 50px)",
                paddingX: 2,
              }}
            >
              {filteredLeftRoles.map((role) => (
                <Box
                  key={role.documentTypeId}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingY: 1,
                    borderBottom: "1px solid #e0e0e0",
                    alignItems: "center",
                    paddingX: 1,
                  }}
                >
                  <Box>
                    <span>{role.documentTypeName}</span>
                    <br />
                    <span>{role.documentGroupName}</span>
                  </Box>
                  <IconButton
                    onClick={() => handleMoveToRight(role.documentTypeId)}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
            <Box sx={{ mt: "auto", borderTop: "1px solid #ccc" }}>
              <TablePagination
                rowsPerPage={rowsPerPageLeft}
                rowsPerPageOptions={[25, 50, 100]}
                page={pageLeft}
                count={filteredLeftRoles.length}
                onPageChange={(e, newPage) => setPageLeft(newPage)}
                onRowsPerPageChange={(e) =>
                  setRowsPerPageLeft(Number(e.target.value))
                }
              />
            </Box>
          </Box>

          {/* Divider */}
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

          {/* Right Side */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              maxHeight: "100%",
            }}
          >
            <HeaderTypography
              title={"Selected"}
              searchEnabled={true}
              onSearch={handleSearchRightRoles}
              searchValue={searchRightRoles}
              TextFieldWidth={"170px"}
            />
            <Box
              sx={{
                overflowY: "auto",
                maxHeight: "calc(100% - 50px)",
                paddingX: 2,
              }}
            >
              {filteredRightRoles.map((role) => (
                <Box
                  key={role.documentTypeId}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingY: 1,
                    borderBottom: "1px solid #e0e0e0",
                    alignItems: "center",
                    paddingX: 1,
                  }}
                >
                  <Box>
                    <span>{role.documentTypeName}</span>
                    <br />
                    <span>{role.documentGroupName}</span>
                  </Box>
                  <IconButton
                    onClick={() => handleMoveToLeft(role.documentTypeId)}
                  >
                    <Delete sx={{ height: "20px", width: "20px" }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
            <Box sx={{ mt: "auto", borderTop: "1px solid #ccc" }}>
              <TablePagination
                rowsPerPage={rowsPerPageRight}
                rowsPerPageOptions={[25, 50, 100]}
                page={pageRight}
                count={filteredRightRoles.length}
                onPageChange={(e, newPage) => setPageRight(newPage)}
                onRowsPerPageChange={(e) =>
                  setRowsPerPageRight(Number(e.target.value))
                }
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default DocumentRoles;
