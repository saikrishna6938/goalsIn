import {
  Box,
  Divider,
  IconButton,
  Modal,
  Tooltip,
  Typography,
} from "@mui/material";
import { api } from "api/API";
import GenericForm from "app/formComponents/GenericForm";
import appStore from "app/mobxStore/AppStore";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import EditForm from "../formManagement/userform/EditForm";
import CloseIcon from "@mui/icons-material/Close";
import DocumentTagEditForm from "./DocumentTagEditForm";
import FormManagementForm from "../formManagement/userform/FormManagementForm";
import ListComponent from "app/user/userManagement/ListComponent";
import SaveIcon from "@mui/icons-material/Save";
import Panel from "../formManagement/userform/Panel";
import DocumentForm from "app/user/DocumentForm";

interface UserFormProps {
  currentObj?: any;
  onReload?: () => void;
  data?: any[];
}

const fields = [
  { name: "name", label: "Form Name", type: "string", column: 1 },
  { name: "description", label: "Description", type: "textArea", column: 1 },
];

const UserForms: React.FC<UserFormProps> = ({ currentObj, onReload, data }) => {
  const [openPrevForm, SetOpenPrevForm] = useState(false);
  const [openEditForm, SetOpenEditForm] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [LeftRoles, SetLeftRoles] = useState<any[]>([]);
  const [RightRoles, SetRightRoles] = useState<any[]>([]);
  const [OriginalRightRoles, SetOriginalRightRoles] = useState<any[]>([]);
  const [NewlyAddedRoles, SetNewlyAddedRoles] = useState<any[]>([]);
  const [DeletedRoles, SetDeletedRoles] = useState<any[]>([]);
  const [searchLeftRoles, setSearchLeftRoles] = useState("");
  const [searchRightRoles, setSearchRightRoles] = useState("");
  const [rowsPerPageLeft, setRowsPerPageLeft] = useState(5);
  const [pageRight, setPageRight] = useState(0);
  const [rowsPerPageRight, setRowsPerPageRight] = useState(5);
  const [pageLeft, setPageLeft] = useState(0);

  useEffect(() => {
    fetchFormData();
  }, [currentObj]);

  const initialValues = {
    name: currentObj?.name || "",
    description: currentObj?.description || "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Form name is required"),
    description: Yup.string().required("Description is required"),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("administrator/document-types");
        const documentTypes = response;
        const allRoles = documentTypes.map((doc) => ({
          roleName: doc.documentTypeName,
          roleNameId: doc.documentTypeId,
          roleNameDescription: doc.documentTypeDescription,
          documentTagObjectId: doc.documentTypeObjectId,
          ...doc,
        }));
        const rightRoles = allRoles.filter(
          (role) => Number(role.documentTagObjectId) === Number(currentObj?.id)
        );

        const rightRoleIds = new Set(rightRoles.map((r) => r.roleNameId));

        const leftRoles = allRoles.filter(
          (role) =>
            Number(role.documentTagObjectId) !== Number(currentObj?.id) &&
            !rightRoleIds.has(role.roleNameId)
        );

        SetRightRoles(rightRoles);
        SetOriginalRightRoles(rightRoles);
        SetLeftRoles(leftRoles);
        SetNewlyAddedRoles([]);
        SetDeletedRoles([]);
      } catch (err) {
        console.error("Error fetching document types:", err);
      }
    };

    if (currentObj?.id) {
      fetchData();
    }
  }, [currentObj]);

  const fetchFormData = async () => {
    if (!currentObj?.id) return;

    try {
      const response = await api.get(
        `administrator/document-tags/${currentObj.id}`
      );
      const data = response.data;
      const documentTagObject =
        typeof data.documentTagObject === "string"
          ? JSON.parse(data.documentTagObject)
          : data.documentTagObject;

      setFormData({
        ...data,
        documentTypeObject: documentTagObject,
      });
    } catch (err) {
      throw err;
    }
  };

  const handleMoveToRight = (roleId: number) => {
    const roleToMove = LeftRoles.find((role) => role.roleNameId === roleId);
    if (!roleToMove) return;

    SetLeftRoles((prev) => prev.filter((r) => r.roleNameId !== roleId));
    SetRightRoles((prev) => [...prev, roleToMove]);

    if (!OriginalRightRoles.some((r) => r.roleNameId === roleId)) {
      SetNewlyAddedRoles((prev) => [...prev, roleToMove]);
    }

    SetDeletedRoles((prev) => prev.filter((r) => r.roleNameId !== roleId));
  };

  const handleMoveToLeft = (roleId: number) => {
    const roleToMove = RightRoles.find((role) => role.roleNameId === roleId);
    if (!roleToMove) return;

    SetRightRoles((prev) => prev.filter((r) => r.roleNameId !== roleId));
    SetLeftRoles((prev) => [...prev, roleToMove]);

    if (OriginalRightRoles.some((r) => r.roleNameId === roleId)) {
      SetDeletedRoles((prev) => [...prev, roleToMove]);
    }

    SetNewlyAddedRoles((prev) => prev.filter((r) => r.roleNameId !== roleId));
  };

  const handleEditButtonClick = async () => {
    await fetchFormData();
    SetOpenEditForm(true);
  };

  const handlePrevButtonClick = async () => {
    await fetchFormData();
    SetOpenPrevForm(true);
  };

  const handleOnSubmit = async (values: any) => {
    try {
      const isEdit = !!currentObj?.id;
      const url = isEdit
        ? `administrator/document-tags/${currentObj?.id}`
        : `administrator/document-tags`;

      const payload = {
        ...values,
        documentTagObject: JSON.stringify({}),
      };

      if (isEdit && Object.keys(payload).length === 1) {
        appStore.showToast("No changes to update.", "info");
        return;
      }

      const res = isEdit
        ? await api.put(url, { body: payload })
        : await api.post(url, { body: payload });

      appStore.showToast(res.message, res.success ? "success" : "error");
      onReload?.();
    } catch (error) {
      throw error;
    }
  };

  const onSubmit = async (added: any[], removed: any[]) => {
    try {
      if (added.length === 0 && removed.length === 0) {
        appStore.showToast("No changes to submit.", "info");
        return;
      }

      for (const role of added) {
        const payload = {
          documentTagObjectId: currentObj?.id,
        };
        const response = await api.put(
          `administrator/document-types/${role.roleNameId}`,
          {
            body: payload,
          }
        );
        appStore.showToast(
          response.message,
          response.status ? "success" : "error"
        );
      }
      for (const role of removed) {
        const payload = { documentTagObjectId: -1 };
        const response = await api.put(
          `administrator/document-types/${role.roleNameId}`,
          {
            body: payload,
          }
        );
        appStore.showToast(
          response.message,
          response.status ? "success" : "error"
        );
      }
      onReload?.();
    } catch (err) {
      appStore.showToast("Failed to update roles.", "error");
      console.error(err);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        overflowY: "scroll",
      }}
    >
      <Box sx={{ padding: "10px" }}>
        <Box>
          <GenericForm
            fields={fields}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleOnSubmit}
            columns={2}
            showSaveButton={true}
            readOnly={false}
            showHeaderComponent={false}
            showPrevButton={true}
            onPrvButtonClick={handlePrevButtonClick}
            showEditButton={true}
            onEditButtonClick={handleEditButtonClick}
          />
        </Box>
        {currentObj?.id && (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
            }}
          >
            <Box sx={{ mt: 1 }}>
              <Panel padding={"0"}>
                <Box
                  sx={{
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "5px 12px 3px 12px",
                    }}
                  >
                    <Typography
                      sx={{
                        flexGrow: 1,
                        fontWeight: "bold",
                        fontSize: "1.1em",
                      }}
                    >
                      Select DocumentTag
                    </Typography>
                    <Tooltip title="UPDATE">
                      <IconButton
                        type="submit"
                        onClick={() => onSubmit(NewlyAddedRoles, DeletedRoles)}
                        sx={{
                          padding: "10px",
                        }}
                      >
                        <SaveIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flex: 1,
                      flexDirection: { xs: "column", md: "row" },
                      overflow: "hidden",
                      minHeight: 0,
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        minHeight: 0,
                        overflow: "auto",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <ListComponent
                        items={LeftRoles}
                        onSearch={(e) => setSearchLeftRoles(e.target.value)}
                        searchValue={searchLeftRoles}
                        page={pageLeft}
                        setPage={setPageLeft}
                        renderItemText={(role) => role.roleName}
                        renderItemId={(role) => role.roleNameId}
                        onMoveToRight={handleMoveToRight}
                        rowsPerPage={rowsPerPageLeft}
                      />
                    </Box>

                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{
                        display: { xs: "none", md: "block" },
                        borderWidth: "1.5px",
                        marginX: "5px",
                        my: "1px",
                      }}
                    />
                    <Box
                      sx={{
                        flex: 1,
                        minHeight: 0,
                        overflow: "auto",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <ListComponent
                        rows={25}
                        items={RightRoles}
                        onSearch={(e) => setSearchRightRoles(e.target.value)}
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
              </Panel>
            </Box>
          </Box>
        )}
        {/* Edit Form Modal */}
        <Modal open={openEditForm} onClose={() => SetOpenEditForm(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              padding: "1em",
              borderRadius: "8px",
              maxHeight: "85vh",
              width: "90%",
              height: "90%",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "0.25em",
                right: "0.35em",
                width: "38px",
                height: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                borderRadius: "50%",
                padding: "5px",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
              onClick={() => SetOpenEditForm(false)}
            >
              <CloseIcon fontSize="medium" />
            </Box>
            <DocumentTagEditForm
              Data={formData}
              onReload={onReload}
              onClose={() => SetOpenEditForm(false)}
            />
          </Box>
        </Modal>

        {/* Prev Form Modal */}
        <Modal open={openPrevForm} onClose={() => SetOpenPrevForm(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              padding: "1em 2em 2em 2em",
              borderRadius: "8px",
              maxHeight: "85vh",
              maxWidth: "75vw",
              width: "75vw",
              height: "85vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "0.1em",
                right: "0.1em",
                cursor: "pointer",
                borderRadius: "50%",
                padding: "1px",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
              onClick={() => SetOpenPrevForm(false)}
            >
              <CloseIcon fontSize="medium" />
            </Box>
            <DocumentForm Data={formData?.documentTypeObject} />
          </Box>
        </Modal>
      </Box>{" "}
    </Box>
  );
};

export default UserForms;
