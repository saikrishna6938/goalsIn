import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  styled,
  IconButton,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Edit } from "@mui/icons-material";
import GenericTable from "./GenericTable";
import NormalDropdown from "app/components/regularinputs/NormalDropdown";
import SelectionDropdown from "app/components/regularinputs/SelectionDropdown";
import TextInputField from "app/components/regularinputs/TextInpuField";

const typeOptions = [
  { id: "min", label: "Minimum" },
  { id: "max", label: "Maximum" },
  { id: "mandatory", label: "Mandatory" },
  { id: "email", label: "E-mail" },
  { id: "greater_than", label: "Greater Than" },
  { id: "less_than", label: "Less Than" },
];

const StyledButton = styled(Button)(() => ({
  height: "1.5em",
  width: "auto",
  border: "1px solid black",
  borderRadius: 0,
  backgroundColor: "#fafafa",
  color: "black",
  "&:hover": {
    backgroundImage: "f5f5f5",
    borderColor: "black",
  },
}));

type Props = {
  data?: any;
  questionIndex: number;
  onValidationChange: (validation: {
    [key: string]: { type: string; value: string }[];
  }) => void;
  questionOrder?: any;
};

type RowData = {
  type: string;
  value: string;
};

const Mandatory: React.FC<Props> = ({
  data,
  questionOrder,
  questionIndex,
  onValidationChange,
}) => {
  const [rows, setRows] = useState<RowData[]>([]);
  const [open, setOpen] = useState(false);
  const [newType, setNewType] = useState("");
  const [newValue, setNewValue] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [hasUserEdited, setHasUserEdited] = useState(false);

  const combinedValidations: { key: string; value: string }[] = [];

  const sections = data?.documentTypeObject?.sections || [];
  for (const section of sections) {
    const schema = section.validationSchema || {};
    for (const key in schema) {
      if (schema.hasOwnProperty(key)) {
        combinedValidations.push({ key, value: schema[key] });
      }
    }
  }

  //set initial validations
  useEffect(() => {
    if (!questionOrder || !data?.documentTypeObject?.sections) {
      setRows([]);
      return;
    }

    let foundValidation: { type: string; value: string }[] | undefined;

    for (const section of data.documentTypeObject.sections) {
      const schema = section.validationSchema;
      if (schema && schema[questionOrder]) {
        foundValidation = schema[questionOrder];
        break;
      }
    }

    if (Array.isArray(foundValidation)) {
      setRows(foundValidation);
    } else {
      setRows([]);
    }

    setNewType("");
    setNewValue("");
    setEditIndex(null);
  }, [questionOrder, data]);

  useEffect(() => {
    if (!hasUserEdited || !questionOrder) return;

    const validationObject: {
      [key: string]: { type: string; value: string }[];
    } = {
      [questionOrder]: rows,
    };

    onValidationChange(validationObject);
    setHasUserEdited(false);
  }, [rows, questionOrder, hasUserEdited]);

  const handleOpen = (index: number | null = null) => {
    if (index !== null) {
      const row = rows[index];
      setNewType(row.type);
      setNewValue(row.value);
      setEditIndex(index);
    } else {
      setNewType("");
      setNewValue("");
      setEditIndex(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewType("");
    setNewValue("");
    setEditIndex(null);
  };
  const handleAddRow = () => {
    if (!newType) return;

    const valueToUse =
      newType === "mandatory" || newType === "email" ? "" : newValue.trim();

    const normalizedType = newType === "mandatory" ? "req" : newType;

    const newRow: RowData = { type: normalizedType, value: valueToUse };

    const updatedRows =
      editIndex !== null
        ? rows.map((r, i) => (i === editIndex ? newRow : r))
        : [...rows, newRow];

    setRows(updatedRows);
    setHasUserEdited(true);
    handleClose();
  };

  const handleDelete = (index: number) => {
    const updatedRows = [...rows];
    updatedRows.splice(index, 1);
    setRows(updatedRows);
    setHasUserEdited(true);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <GenericTable
        title="Validation"
        rows={rows}
        onChange={setRows}
        onAddClick={() => handleOpen(null)}
        onEditClick={handleOpen}
        onDeleteClick={handleDelete}
        columns={[
          { key: "type", label: "Type" },
          { key: "value", label: "Value" },
        ]}
      />
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            width: 300,
            bgcolor: "white",
            p: 3,
            borderRadius: 2,
            boxShadow: 24,
            mx: "auto",
            mt: "15%",
          }}
        >
          <Typography variant="h6" mb={2}>
            {editIndex !== null
              ? "Edit Validation Rule"
              : "Add Validation Rule"}
          </Typography>
          <SelectionDropdown
            label="Type"
            options={typeOptions}
            value={newType || ""}
            onChange={(val) => {
              setNewType(val as string);
              if (val === "mandatory" || val === "email") {
                setNewValue("");
              }
            }}
            optionValueKey="id"
            optionLabelKey="label"
            fullWidth
          />

          {newType !== "mandatory" && newType !== "email" && (
            <TextInputField
              label="Value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}

          <Box display="flex" justifyContent="flex-end">
            <Button variant="outlined" onClick={handleClose} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleAddRow}>
              {editIndex !== null ? "Update" : "Add"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Mandatory;
