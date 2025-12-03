import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import GenericTable from "./GenericTable";
import {
  FormTriggerType,
  TriggerAction,
  FORM_TRIGGER_TYPES,
} from "./FormTriggerType";
import DropDownTable from "./DropDownTable";
import SelectionDropdown from "app/components/regularinputs/SelectionDropdown";
import TextInputField from "app/components/regularinputs/TextInpuField";

const conditionOptions = [
  { id: "Equal", label: "Equal" },
  { id: "Greater", label: "Greater" },
  { id: "Less", label: "Less" },
];

const StyledButton = styled(Button)(() => ({
  float: "right",
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

interface Props {
  data?: any;
  onTiggerData?: (triggers: { [key: string]: TriggerRow[] }) => void;
  questionOrder?: string;
  questionIndex: number;
}

type TriggerRow = {
  triggerType: FormTriggerType;
  condition: "Equal" | "Greater" | "Less";
  compareValue: string;
  actions: TriggerAction[];
};

const ACTION_TYPES: TriggerAction["type"][] = [
  "show",
  "hide",
  "setValue",
  "clearValue",
  "enable",
  "disable",
];

const Trigger: React.FC<Props> = ({
  data,
  onTiggerData,
  questionOrder,
  questionIndex,
}) => {
  const [rows, setRows] = useState<any>([]);
  const [open, setOpen] = useState(false);
  const [newTriggerType, setNewTriggerType] = useState<FormTriggerType | "">(
    ""
  );
  const [newCondition, setNewCondition] = useState<any>("");
  const [compareValue, SetCompareValue] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [actionList, setActionList] = useState<any[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (!data?.documentTypeObject?.sections) return;

    const questionList: { order: string; attributeName: string }[] = [];

    data.documentTypeObject.sections.forEach((section) => {
      section.formDetails?.forEach((group) => {
        group.form?.forEach((question) => {
          const { order, attributeName } = question;
          if (order && attributeName) {
            questionList.push({ order, attributeName });
          }
        });
      });
    });

    setAvailableQuestions(questionList);
  }, [data]);

  useEffect(() => {
    if (!data?.documentTypeObject?.sections || !questionOrder) {
      setRows([]);
      setActionList([]);
      setEditIndex(null);
      return;
    }

    const section = data.documentTypeObject.sections.find((s) =>
      s?.formDetails?.some((g) =>
        g?.form?.some((q) => q?.order === questionOrder)
      )
    );

    let foundTrigger: any = null;

    if (section?.formDetails) {
      for (const group of section.formDetails) {
        const question = group.form?.find((q) => q.order === questionOrder);
        if (question?.triggers) {
          foundTrigger = question.triggers;
          break;
        }
      }
    }

    if (Array.isArray(foundTrigger)) {
      setRows(foundTrigger);
      setNewTriggerType("");
      setNewCondition("");
      SetCompareValue("");
      setActionList([]);
      setEditIndex(null);
    } else {
      setRows([]);
      setNewTriggerType("");
      setNewCondition("");
      SetCompareValue("");
      setActionList([]);
      setEditIndex(null);
    }
  }, [data, questionOrder]);

  const handleOpen = (index: number | null = null) => {
    if (index !== null) {
      const row = rows[index];
      setNewTriggerType(row.triggerType);
      setNewCondition(row.condition);
      SetCompareValue(row.compareValue);
      setEditIndex(index);
      setActionList(row.actions || []);
    } else {
      setNewTriggerType("");
      setNewCondition("");
      SetCompareValue("");
      setEditIndex(null);
      setActionList([]);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewTriggerType("");
    setNewCondition("");
    SetCompareValue("");
    setEditIndex(null);
  };

  const handleSave = () => {
    const trimmedValue = compareValue?.trim();

    const newRow: TriggerRow = {
      triggerType: newTriggerType as FormTriggerType,
      condition: newCondition,
      compareValue: trimmedValue,
      actions: actionList.map((action) => ({
        ...action,
      })),
    };

    let updatedRows = [...rows];
    if (editIndex !== null) {
      updatedRows[editIndex] = newRow;
    } else {
      updatedRows.push(newRow);
    }

    setRows(updatedRows);

    if (questionOrder) {
      const triggerMap = {
        [questionOrder]: updatedRows,
      };
      onTiggerData?.(triggerMap);
    }

    handleClose();
  };

  const handleDelete = (index: number) => {
    const updatedRows = [...rows];
    updatedRows.splice(index, 1);
    setRows(updatedRows);

    if (questionOrder) {
      const triggerMap = {
        [questionOrder]: updatedRows,
      };
      onTiggerData?.(triggerMap);
    }
  };

  const handleAddRow = (data: TriggerAction) => {
    setActionList((prev) => [...prev, data]);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <GenericTable
        title="Trigger"
        rows={rows}
        onChange={setRows}
        onAddClick={() => handleOpen(null)}
        onEditClick={handleOpen}
        onDeleteClick={handleDelete}
        columns={[
          { key: "triggerType", label: "Type" },
          { key: "compareValue", label: "Value" },
          { key: "condition", label: "Condition" },
        ]}
      />

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "45%",
            height: "auto",
            bgcolor: "white",
            p: 3,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" mb={2}>
            {editIndex !== null ? "Edit Trigger" : "Add Trigger"}
          </Typography>

          {/* Trigger Type Dropdown */}
          <SelectionDropdown
            label="Trigger Type"
            options={FORM_TRIGGER_TYPES.map((type) => ({
              id: type,
              label: type,
            }))}
            value={newTriggerType || ""}
            onChange={(val) => setNewTriggerType(val as FormTriggerType)}
            optionValueKey="id"
            optionLabelKey="label"
            fullWidth
          />

          {/* Condition Dropdown */}
          <SelectionDropdown
            label="Condition"
            options={conditionOptions}
            value={newCondition || ""}
            onChange={(val) =>
              setNewCondition(val as "Equal" | "Greater" | "Less")
            }
            optionValueKey="id"
            optionLabelKey="label"
            fullWidth
          />
          <TextInputField
            type="text"
            label="Compare Value"
            value={compareValue}
            onChange={(e) => SetCompareValue(e.target.value)}
            sx={{ mb: 2 }}
          />
          <DropDownTable
            columns={[
              {
                colName: "Action Type",
                colData: ACTION_TYPES.map((type) => ({
                  id: type,
                  name: type,
                })),
                colType: 5,
                colWidth: "200px",
                key: "type",
              },
              {
                colName: "Question",
                colData: availableQuestions,
                colType: 6,
                colWidth: "200px",
                key: "targetQuestionId",
              },
              {
                colName: "Value",
                colData: [],
                colType: 1,
                colWidth: "200px",
                key: "value",
              },
            ]}
            data={actionList}
            onAddRow={handleAddRow}
            onDeleteRow={(index) => {
              const updated = [...actionList];
              updated.splice(index, 1);
              setActionList(updated);
            }}
            onEditRow={(index, updatedRow) => {
              const updated = [...actionList];
              updated[index] = updatedRow;
              setActionList(updated);
            }}
            title={"Action Mapping"}
          />

          {/* Actions */}
          <Box display="flex" justifyContent="flex-end">
            <Button variant="outlined" onClick={handleClose} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave}>
              {editIndex !== null ? "Update" : "Add"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Trigger;
