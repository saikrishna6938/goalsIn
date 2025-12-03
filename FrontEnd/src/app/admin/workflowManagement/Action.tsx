import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { api } from "api/API";
import { Themecolors } from "api/Colors";
import DataGrid from "app/formComponents/DataGrid";
import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import CustomButton from "app/components/CustomButton ";
import Transition from "./Transition";
import appStore from "app/mobxStore/AppStore";
import TextInputField from "app/components/regularinputs/TextInpuField";
import SelectionDropdown from "app/components/regularinputs/SelectionDropdown";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";
import SaveIcon from "@mui/icons-material/Save";

interface Props {
  currentObj: any;
  status?: any;
}

const ActionColumns: any = [
  { id: "id", label: "ID", type: "number" },
  { id: "actionName", label: "Name", type: "string" },
  { id: "actionDescription", label: "Description", type: "string" },
  { id: "toStateName", label: "To State Name ", type: "string" },
];

const Action: React.FC<Props> = ({ currentObj, status }) => {
  const [newAction, setNewAction] = useState<any>({
    documentStateId: "",
    actionName: "",
    actionDescription: "",
    optionId: "",
  });
  const [actioData, SetActionData] = useState([]);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedRow, SetSelectedRow] = useState<any>();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [deleteModalOpen, SetDeleteModalOpen] = useState(false);
  const [transitionModalOpen, SetTransitionModalOpen] = useState(false);
  const [transitionPayLoad, SetTransitionPayLoad] = useState<any>({});
  const [transitions, setTransitions] = useState([]);
  const [optionsData, setOptionsData] = useState<any[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await api.get("administrator/options");
        const mappedData = [
          { id: -1, optionName: "None" },
          ...res.data.map(({ optionId, optionName }) => ({
            id: optionId,
            optionName,
          })),
        ];
        setOptionsData(mappedData);
      } catch (error) {
        console.error("Error fetching document types:", error);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    if (currentObj?.documentStateId) {
      setNewAction((prevState) => ({
        ...prevState,
        documentStateId: currentObj.documentStateId,
      }));
    }
  }, [currentObj?.documentStateId]);

  useEffect(() => {
    fetchActionData();
  }, [currentObj?.documentStateId]);

  useEffect(() => {
    fetchTransitions();
  }, [actioData]);

  const fetchTransitions = async () => {
    const transitionsMap: { [key: number]: any[] } = {};

    try {
      for (const action of actioData) {
        const response = await api.get(
          `administrator/workflows/actions/transitions/${action.id}`
        );
        transitionsMap[action.id] = response.data;
      }

      const updatedActions = actioData.map((action: any) => {
        const actionTransitions = transitionsMap[action.id];
        const toStateName = actionTransitions?.[0]?.toStateName;

        return {
          ...action,
          toStateName,
        };
      });
      setTransitions(updatedActions);
    } catch (err) {
      console.error("Error fetching transitions", err);
    }
  };

  const fetchActionData = async () => {
    try {
      const response = await api.get(
        `administrator/workflows/document-states/actions/${currentObj?.documentStateId}`
      );
      const mapdata = response.data.map(({ actionId, ...rest }) => ({
        id: actionId,
        ...rest,
      }));
      SetActionData(mapdata);
    } catch (err) {
      throw err;
    }
  };

  const handleSelection = (id) => {
    const selected: any = actioData.find((f) => f.id === id);
    SetSelectedRow(selected);
  };

  const handleEditClick = (id) => {
    const selected: any = actioData.find((f) => f.id === id);
    setOpenEditModal(true);
    SetSelectedRow(selected);
  };

  const handleDeleteClick = async (id) => {
    console.log("hariasldkhb asdlkfjb");
    const response = await api.delete(
      "administrator/workflows/document-states/actions",
      {
        body: {
          actionId: id,
        },
      }
    );
    SetDeleteModalOpen(false);
    fetchActionData();
  };

  const handleEditModalClose = () => {
    setOpenEditModal(false);
  };

  const handleDeleteModalOpen = (id) => {
    const selected: any = actioData.find((f) => f.id === id);
    SetSelectedRow(selected);
    SetDeleteModalOpen(true);
  };

  const handleTransitionModalOpen = (id) => {
    const selected: any = actioData.find((f) => f.id === id);
    SetSelectedRow(selected);
    SetTransitionModalOpen(true);
  };

  const buttons = [
    {
      buttons: [
        {
          label: "Edit",
          onClick: handleEditClick,
        },

        {
          label: "Delete",
          onClick: handleDeleteModalOpen,
        },
        {
          label: "Edit transition",
          onClick: handleTransitionModalOpen,
        },
      ],
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAction((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const payload = {
      ...newAction,
    };
    try {
      const response = await api.post(
        "administrator/workflows/document-states/actions",
        { body: payload }
      );
      console.log("Action added successfully:", response);
      setNewAction({
        documentStateId: newAction.documentStateId,
        actionName: "",
        actionDescription: "",
        optionId: "",
      });
      appStore.showToast(response.message, "success");
      setOpenAddModal(false);
      fetchActionData();
    } catch (error) {
      console.error("Error adding action:", error);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedRow) return;

    const payload = {
      actionId: selectedRow.id,
      actionName: selectedRow.actionName,
      actionDescription: selectedRow.actionDescription,
      optionId: selectedRow.optionId,
    };

    try {
      const response = await api.put(
        `administrator/workflows/document-states/actions`,
        { body: payload }
      );
      appStore.showToast(response.message, "success");

      setOpenEditModal(false);
      fetchActionData();
    } catch (error) {
      console.error("Error updating action:", error);
    }
  };

  const handleTransitionSubmit = async () => {
    const payLoad = transitionPayLoad;
    const url = "administrator/workflows/actions/transitions";

    let isEditMode = !!transitionPayLoad.transitionId;

    try {
      const response = isEditMode
        ? await api.put(url, { body: payLoad })
        : await api.post(url, { body: payLoad });

      SetTransitionModalOpen(false);
      fetchTransitions();
    } catch (error) {
      console.error("Error during submit:", error);
    }
  };

  const handleModalClose = () => {
    setOpenAddModal(false);
    setNewAction({
      documentStateId: currentObj?.documentStateId || "",
      actionName: "",
      actionDescription: "",
      optionId: "",
    });
  };

  return (
    <Box
      sx={{
        paddingRight: "5px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <DataGrid
        tasks={transitions}
        columns={ActionColumns}
        onSelection={handleSelection}
        buttons={buttons}
        showButton={true}
        defaultHeight="100%"
        renderOptions={
          <Button
            onClick={() => setOpenAddModal(true)}
            sx={{
              fontSize: "0.78rem",
              height: "2.2em",
              margin: "2px",
              mr: "20px",
              border: `1px solid ${Themecolors.Button_bg3}`,
              backgroundColor: Themecolors.Button_bg3,
              color: Themecolors.Button2,
              "&:hover": {
                backgroundImage: Themecolors.B_hv3,
                backgroundColor: Themecolors.Button_bg3,
                border: `1px solid ${Themecolors.Button_bg3}`,
              },
            }}
          >
            Add New
          </Button>
        }
      />
      {/* Edit modal */}
      <Box>
        <Modal open={openEditModal} onClose={handleEditModalClose}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              padding: "2em",
              borderRadius: "8px",
              maxHeight: "90vh",
              maxWidth: "80vw",
              overflowY: "auto",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "0.5em",
                right: "0.5em",
                cursor: "pointer",
              }}
              onClick={handleEditModalClose}
            >
              <CloseIcon />
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextInputField
                  id="action-id"
                  label="Action ID"
                  value={selectedRow?.id?.toString() || ""}
                  onChange={() => {}}
                  type="text"
                  error={false}
                  helperText=""
                  required={false}
                  disabled={true}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextInputField
                  id="action-name"
                  label="Action Name"
                  value={selectedRow?.actionName || ""}
                  onChange={(e) =>
                    SetSelectedRow({
                      ...selectedRow,
                      actionName: e.target.value,
                    })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextInputField
                  id="action-description"
                  label="Action Description"
                  value={selectedRow?.actionDescription || ""}
                  onChange={(e) =>
                    SetSelectedRow({
                      ...selectedRow,
                      actionDescription: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SelectionDropdown
                  label="Select Option"
                  options={optionsData}
                  value={selectedRow?.optionId || ""}
                  onChange={(val) =>
                    SetSelectedRow({
                      ...selectedRow,
                      optionId: val,
                    })
                  }
                  optionValueKey="id"
                  optionLabelKey="optionName"
                />
              </Grid>
            </Grid>
            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <PrimaryButton
                label="Cancel"
                startIcon={<CancelIcon />}
                type="button"
                onClick={handleEditModalClose}
              />
              <PrimaryButton
                label="Submit"
                startIcon={<SaveIcon />}
                type="submit"
                onClick={handleEditSubmit}
              />
            </Box>
          </Box>
        </Modal>
      </Box>

      {/* Add New  Modal*/}
      <Modal open={openAddModal} onClose={handleModalClose}>
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
            maxHeight: "90vh",
            maxWidth: "80vw",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: "3em",
            }}
          >
            <Typography sx={{ fontWeight: 550, fontSize: "1.5em" }}>
              Add New Action
            </Typography>
            <CloseIcon
              onClick={() => setOpenAddModal(false)}
              sx={{ cursor: "pointer", fontSize: "1.5rem" }}
            />
          </Box>

          {/* Form Fields */}
          <Box sx={{ flexGrow: 1, mb: "2em" }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextInputField
                  id="documentStateId"
                  label="Document State ID"
                  value={newAction.documentStateId}
                  onChange={handleInputChange}
                  required
                  disabled={true}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextInputField
                  id="actionName"
                  label="Action Name"
                  name="actionName"
                  value={newAction.actionName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextInputField
                  id="actionDescription"
                  name="actionDescription"
                  label="Action Description"
                  value={newAction.actionDescription}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SelectionDropdown
                  label="Select Option"
                  options={optionsData}
                  value={newAction.optionId}
                  onChange={(val) =>
                    setNewAction((prev) => ({ ...prev, optionId: val }))
                  }
                  optionValueKey="id"
                  optionLabelKey="optionName"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Footer Buttons */}
          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
            }}
          >
            <PrimaryButton
              label="Cancel"
              startIcon={<CancelIcon />}
              type="button"
              onClick={() => setOpenAddModal(false)}
            />
            <PrimaryButton
              label="Submit"
              startIcon={<SaveIcon />}
              type="submit"
              onClick={handleSubmit}
            />
          </Box>
        </Box>
      </Modal>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => SetDeleteModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete Action
            <strong style={{ marginLeft: "5px" }}>
              {selectedRow?.actionName || ""}
            </strong>
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <PrimaryButton
            label="Cancel"
            startIcon={<CancelIcon />}
            type="button"
            onClick={() => SetDeleteModalOpen(false)}
          />
          <PrimaryButton
            label="Delete"
            startIcon={<DeleteIcon />}
            type="button"
            onClick={() => handleDeleteClick(selectedRow?.id)}
          />
        </DialogActions>
      </Dialog>
      <Box>
        <Modal
          open={transitionModalOpen}
          onClose={() => SetTransitionModalOpen(false)}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 3,
              borderRadius: "8px",
              height: "auto",
              width: "60vw",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "0.6em",
                right: "0.6em",
                cursor: "pointer",
              }}
              onClick={() => SetTransitionModalOpen(false)}
            >
              <CloseIcon />
            </Box>
            <Box sx={{ flex: 1, overflowY: "auto", my: "2em" }}>
              <Transition
                currentObj={selectedRow}
                status={status}
                onChangePayload={SetTransitionPayLoad}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1em",
                paddingTop: "1em",
                borderTop: "1px solid #eee",
              }}
            >
              <PrimaryButton
                label="Cancel"
                startIcon={<CancelIcon />}
                type="button"
                onClick={() => SetTransitionModalOpen(false)}
              />
              <PrimaryButton
                label="Submit"
                startIcon={<SaveIcon />}
                type="submit"
                onClick={handleTransitionSubmit}
              />
            </Box>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
};

export default Action;
