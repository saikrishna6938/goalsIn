import React, { useState, useEffect } from "react";
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
import DataGrid from "app/formComponents/DataGrid";
import { Themecolors } from "api/Colors";
import CustomButton from "app/components/CustomButton ";
import CloseIcon from "@mui/icons-material/Close";
import { api } from "api/API";
import GenericForm from "app/formComponents/GenericForm";
import * as Yup from "yup";
import appStore from "app/mobxStore/AppStore";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";
import { Delete } from "@mui/icons-material";

interface DataTableDetailsProps {
  currentObject: any;
  reloaddData?: () => void;
}

const columns: any = [
  { id: "name", label: "Field Name", type: "string" },
  { id: "expression", label: "Expression", type: "string" },
  { id: "enabled", label: "Enabled", type: "number" },
];

const fields = [
  {
    name: "name",
    label: "Field Name",
    type: "text",
  },
  {
    name: "expression",
    label: "Expression",
    type: "dropDown",
    options: [
      { id: 1, label: "Like" },
      { id: 2, label: "Lesser" },
      { id: 3, label: "Greater" },
      { id: 4, label: "Equal" },
    ],
  },
  {
    name: "isVisible",
    label: "Visible",
    type: "dropDown",
    options: [
      { id: 0, label: "True" },
      { id: 1, label: "False" },
    ],
  },
  {
    name: "type",
    label: "Type",
    type: "dropDown",
    options: [
      { id: 1, label: "Text" },
      { id: 2, label: "Integer" },
      { id: 3, label: "Varchar" },
      { id: 4, label: "Date" },
    ],
  },
];

const CreateNew = [
  { name: "tableName", label: "Table Name", type: "string", column: 1 },
];

const DataTableDetails: React.FC<DataTableDetailsProps> = ({
  currentObject,
  reloaddData,
}) => {
  const [dataTables, setDataTables] = useState<any>([]);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [deleteModalOpen, SetDeleteModalOpen] = useState(false);
  const [selectedRow, SetSelectedRow] = useState<any>();
  const [addNew, SetAddNew] = useState<any[]>([]);
  const defaultValues: any = {
    tableName: "",
  };
  const [showSkeletonLoader, SetShowSkeletonLoader] = useState(false);

  useEffect(() => {
    SetShowSkeletonLoader(true);
    if (currentObject?.fields && Array.isArray(currentObject.fields)) {
      const mappedData = currentObject.fields.map(
        (field: any, index: number) => ({
          id: index,
          ...field,
          enabled: field.isVisible ? 0 : 1,
        })
      );
      setDataTables(mappedData);
    } else {
      setDataTables([]);
    }
    SetShowSkeletonLoader(false);
  }, [currentObject]);

  const handleOnSubmit = async (values: any) => {
    const payload = {
      tableName: values.tableName || currentObject?.tableName || "",
      fields: addNew,
    };
    console.log("final pay load", payload);
    try {
      const response = await api.post("administrator/data-tables", {
        body: payload,
      });
      appStore.showToast(response.message, "success");
      reloaddData?.();
    } catch (err) {
      appStore.showToast(err, "error");
    }
    SetAddNew([]);
  };

  const handleSelection = (id) => {
    const selected: any = dataTables.find((f) => f.id === id);
    SetSelectedRow(selected);
  };

  const handleAddNew = async () => {
    const expressionOption = fields
      .find((f) => f.name === "expression")
      ?.options.find((opt) => opt.id === formData.expression);

    const typeOption = fields
      .find((f) => f.name === "type")
      ?.options.find((opt) => opt.id === formData.type);

    const newEntry = {
      name: formData.name ?? "",
      expression: expressionOption?.label ?? "",
      isVisible: Number(formData.isVisible),
      type: typeOption?.label ?? "",
    };

    SetAddNew((prev) => [...prev, newEntry]);
    setFormData({});
    setOpenAddModal(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCloseModal = () => {
    setOpenAddModal(false);
    setFormData({});
  };

  const handleDeleteModalOpen = (id) => {
    const selected: any = dataTables.find((f) => f.id === id);
    SetSelectedRow(selected);
    SetDeleteModalOpen(true);
  };

  const buttons = [
    {
      buttons: [
        {
          label: "Delete",
          onClick: handleDeleteModalOpen,
        },
      ],
    },
  ];

  const handleDeleteClick = async (id) => {
    const response = await api.delete("", {
      body: {
        actionId: id,
      },
    });
    SetDeleteModalOpen(false);
    // fetchActionData();
  };

  const initialValues: any = {
    ...defaultValues,
    ...currentObject,
  };

  const validationSchema = Yup.object({
    tableName: Yup.string().required("Table Name is required"),
  });

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        <GenericForm
          fields={CreateNew}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleOnSubmit}
          columns={2}
          showSaveButton={true}
          readOnly={false}
          showHeaderComponent={false}
        />
      </Box>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <DataGrid
          showSkeletonLoader={showSkeletonLoader}
          tasks={dataTables}
          columns={columns}
          defaultHeight="100%"
          onSelection={handleSelection}
          buttons={buttons}
          showButton={true}
          renderOptions={
            currentObject &&
            Object.keys(currentObject).length === 0 && (
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
            )
          }
        />
      </Box>
      {/* Add New */}
      <Modal open={openAddModal} onClose={handleCloseModal}>
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: "1em",
              position: "sticky",
              top: 0,
              backgroundColor: "white",
              zIndex: 1,
            }}
          >
            <Typography sx={{ fontWeight: 550, fontSize: "1.2em" }}>
              Create New Data Table
            </Typography>
            <CloseIcon
              onClick={handleCloseModal}
              sx={{ cursor: "pointer", fontSize: "1.5rem" }}
            />
          </Box>
          <Box
            sx={{
              overflowY: "auto",
              maxHeight: "100%",
              paddingBottom: "2em",
              width: "100%",
            }}
          >
            <Grid container spacing={2}>
              {fields.map((field) => (
                <Grid item xs={12} key={field.name}>
                  <TextField
                    fullWidth
                    name={field.name}
                    label={field.label}
                    value={formData[field.name] ?? ""}
                    onChange={handleChange}
                    variant="standard"
                    select={field.type === "dropDown"}
                  >
                    {field.type === "dropDown" &&
                      field.options.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.label}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>
              ))}
            </Grid>
          </Box>
          <Box
            sx={{
              mt: 1,
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              position: "sticky",
              bottom: 0,
              backgroundColor: "white",
              zIndex: 1,
            }}
          >
            <PrimaryButton
              label="Cancel"
              startIcon={<CancelIcon />}
              type="button"
              onClick={handleCloseModal}
            />
            <PrimaryButton
              label="Submit"
              startIcon={<SaveIcon />}
              type="submit"
              onClick={handleAddNew}
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
              {selectedRow?.name || ""}
            </strong>
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <PrimaryButton
            label="Delete"
            startIcon={<Delete />}
            type="button"
            onClick={() => handleDeleteClick(selectedRow?.id)}
          />
          <PrimaryButton
            label="Cancel"
            startIcon={<CancelIcon />}
            type="button"
            onClick={() => SetDeleteModalOpen(false)}
          />
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataTableDetails;
