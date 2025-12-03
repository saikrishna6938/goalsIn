import React, { useEffect, useState } from "react";
import {
  TextField,
  Grid,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { Themecolors } from "api/Colors";
import { api } from "api/API";
import Toast from "app/formComponents/Toast";
import CloseIcon from "@mui/icons-material/Close";
import { values } from "mobx";
import appStore from "app/mobxStore/AppStore";
import TextInputField from "app/components/regularinputs/TextInpuField";

interface ApplicationEditProps {
  selectedEditRow: Record<string, string>;
  handleModalClose?: () => void;
  documentTypeTableId?: number;
  handleSubmit?: () => void;
  fields?: {
    name: string;
    type: string;
    expression: string;
    isVisible: boolean;
  }[];
}

const ApplicationEdit: React.FC<ApplicationEditProps> = ({
  selectedEditRow,
  handleModalClose,
  documentTypeTableId,
  handleSubmit,
  fields,
}) => {
  const generateInitialFormData = (fields: { name: string }[]) => {
    const formData: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.name && field.name !== "Id") {
        formData[field.name] = "";
      }
    });

    return formData;
  };

  const initialFormData = generateInitialFormData(fields);
  const selectedRowId = selectedEditRow?.id;
  const [editedData, setEditedData] = useState<Record<string, string>>(
    selectedEditRow || initialFormData
  );

  useEffect(() => {
    if (selectedEditRow) {
      setEditedData(selectedEditRow);
    }
  }, [selectedEditRow]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedData({
      ...editedData,
      [event.target.name]: event.target.value,
    });
  };

  const getModifiedFields = () => {
    const modifiedFields: Record<string, string> = {};
    if (selectedEditRow) {
      Object.entries(editedData).forEach(([key, value]) => {
        if (selectedEditRow[key] !== value) {
          modifiedFields[key] = value;
        }
      });
    } else {
      Object.entries(editedData).forEach(([key, value]) => {
        if (value !== "") {
          modifiedFields[key] = value;
        }
      });
    }

    return modifiedFields;
  };

  const handleSave = async () => {
    const modifiedFields = getModifiedFields();
    const payload = {
      ...modifiedFields,
    };

    if (Object.keys(modifiedFields).length > 0) {
      try {
        const endpoint = `update-internal-tag/${documentTypeTableId}/${
          selectedRowId ?? -1
        }`;
        const response = await api[selectedRowId ? "put" : "post"](endpoint, {
          body: payload,
        });

        appStore.showToast(
          response.message,
          response.success ? "success" : "error"
        );
        handleModalClose();
        handleSubmit();
      } catch (error) {
        console.error("Error saving data:", error);
        throw error;
      }
    }
  };

  const renderFormFields = () => {
    const entries = Object.entries(editedData);

    return (
      <Grid container spacing={2}>
        {entries.map(([key, value]) => (
          <Grid item xs={12} sm={6} key={key}>
            <TextInputField
              label={key}
              name={key}
              value={value}
              onChange={handleInputChange}
              variant="standard"
              disabled={key === "id"}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "100%",
            paddingBottom: "10px",
            borderBottom: "1px solid #ccc",
          }}
        >
          {selectedRowId ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  ml: "10px",
                }}
              >
                <Typography variant="body1">
                  Id: <strong>{selectedEditRow?.id}</strong>
                </Typography>
                <Typography>
                  University: <strong>{selectedEditRow?.UniversityName}</strong>
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  alignItems: "flex-start",
                }}
              >
                <Typography variant="body1">
                  Program Name: <strong>{selectedEditRow?.ProgramName}</strong>
                </Typography>
                <Typography variant="body1">
                  Level of Study:{" "}
                  <strong>{selectedEditRow?.LevelOfStudy}</strong>
                </Typography>
              </Box>
            </>
          ) : (
            <Typography variant="h6" sx={{ color: "gray", ml: "10px" }}>
              Add the tag details
            </Typography>
          )}

          <Box>
            <IconButton
              onClick={handleModalClose}
              sx={{
                color: "gray",
                display: "flex",
                justifyContent: "flex-end",
                position: "relative",
                bottom: "10px",
                left: "5px",
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            padding: "15px",
          }}
        >
          <form>{renderFormFields()}</form>
        </Box>
        <Box
          sx={{
            paddingTop: "10px",
            marginRight: "20px",
            borderTop: "1px solid #ccc",
            backgroundColor: "#f9f9f9",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={handleSave}
            sx={{
              height: "2.2em",
              border: `1px solid ${Themecolors.Button1}`,
              backgroundColor: Themecolors.Button1,
              color: Themecolors.Button2,
              "&:hover": {
                backgroundImage: Themecolors.B_hv1,
                backgroundColor: Themecolors.Button1,
                border: `1px solid ${Themecolors.Button1}`,
              },
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default ApplicationEdit;
