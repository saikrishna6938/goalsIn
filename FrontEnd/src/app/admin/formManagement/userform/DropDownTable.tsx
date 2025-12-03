import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  IconButton,
  Autocomplete,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import TextInputField from "app/components/regularinputs/TextInpuField";
import IdLabelDropdown from "./IdLabelDropdown";

export type TableColumn = {
  colName: string;
  colData: any[];
  colType: number;
  colWidth?: string;
  key: string;
  disabled?: boolean;
};

export type RowData = {
  [key: string]: string;
};

interface DropDownTableProps {
  columns: TableColumn[];
  data?: RowData[];
  onAddRow?: (row: RowData) => void;
  onDeleteRow?: (index: number) => void;
  onEditRow?: (index: number, updatedRow: RowData) => void;
  title?: string;
  onResetRef?: React.MutableRefObject<(() => void) | null>;
}

const DropDownTable: React.FC<DropDownTableProps> = ({
  columns,
  data,
  onAddRow,
  onDeleteRow,
  onEditRow,
  title,
  onResetRef,
}) => {
  const [form, setForm] = useState<RowData>({});
  const [rows, setRows] = useState<RowData[]>([]);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);

  useEffect(() => {
    if (onResetRef) {
      onResetRef.current = () => {
        setForm({});
        setEditingRowIndex(null);
      };
    }
  }, [onResetRef]);

  useEffect(() => {
    if (!Array.isArray(data)) return;

    const questionCol = columns.find((col) => col.colName === "Question");

    if (!questionCol?.colData) {
      setRows(data);
      return;
    }

    const questionMap = new Map(
      questionCol.colData.map((item) => [item.order, item.attributeName])
    );

    const updatedRows = data.map((item) => ({
      ...item,
      targetQuestionId:
        questionMap.get(item.targetQuestionId) || item.targetQuestionId,
    }));

    setRows(updatedRows);
  }, [data, columns]);

  const handleAdd = () => {
    if (editingRowIndex !== null) {
      if (onEditRow) {
        onEditRow(editingRowIndex, form);
      }
    } else {
      if (onAddRow) {
        onAddRow(form);
      }
    }
    setForm({});
    setEditingRowIndex(null);
  };

  const handleDelete = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
    onDeleteRow?.(index);

    if (editingRowIndex === index) {
      setEditingRowIndex(null);
      setForm({});
    }
  };

  const handleCellClick = (index: number) => {
    const row = rows[index];
    setForm({ ...row });
    setEditingRowIndex(index);
  };

  const handleInputChange =
    (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const handleSelectChange =
    (key: string) => (e: SelectChangeEvent<string>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const renderField = (column: TableColumn) => {
    const isDisabled = column.disabled ?? false;
    const value = form[column.key] || "";

    switch (column.colType) {
      case 1: // Text input
        return (
          <TextInputField
            label={column.colName}
            value={value}
            onChange={handleInputChange(column.key)}
            disabled={isDisabled}
          />
        );

      case 2: // Number input
        return (
          <TextInputField
            type="number"
            label={column.colName}
            value={value}
            onChange={handleInputChange(column.key)}
            disabled={isDisabled}
          />
        );

      case 3: // Date input
        return (
          <TextField
            type="date"
            size="small"
            fullWidth
            label={column.colName}
            value={value}
            onChange={handleInputChange(column.key)}
            InputLabelProps={{ shrink: true }}
            disabled={isDisabled}
          />
        );

      case 5: {
        const selectedOption =
          column.colData.find(
            (opt: any) => String(opt.id) === String(form[column.key])
          ) || null;

        return (
          <Autocomplete
            size="small"
            fullWidth
            options={column.colData}
            getOptionLabel={(opt: any) => opt.name ?? ""}
            isOptionEqualToValue={(opt: any, val: any) =>
              String(opt.id) === String(val.id)
            }
            value={selectedOption}
            onChange={(_, newValue) => {
              setForm((prev) => ({
                ...prev,
                [column.key]: newValue?.id ?? "",
              }));
            }}
            renderInput={(params) => (
              <TextField {...params} label={column.colName} />
            )}
            disabled={isDisabled}
          />
        );
      }

      case 6: {
        const mappedOptions = column.colData.map((d) => ({
          value: String(d.order),
          label: d.attributeName,
        }));

        const selectedValue =
          mappedOptions.find((opt) => opt.value === String(form[column.key])) ||
          null;

        return (
          <IdLabelDropdown
            label={column.colName}
            options={mappedOptions}
            value={selectedValue}
            onChange={(newVal) => {
              setForm((prev) => ({
                ...prev,
                [column.key]: newVal ? newVal.value : "",
              }));
            }}
          />
        );
      }
    }
  };

  return (
    <Box sx={{ border: "1px solid #ccc", p: 1, borderRadius: "5px", mb: 2 }}>
      <Typography fontWeight={600} mb={1}>
        {title}
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
        {columns.map((col, index) => (
          <Box key={index} width={"100%"}>
            {renderField(col)}
          </Box>
        ))}

        <Button
          onClick={handleAdd}
          variant="outlined"
          sx={{ minWidth: 40, height: 40 }}
        >
          <AddIcon />
        </Button>
      </Box>

      <Box>
        {rows.map((row, index) => (
          <Box
            key={index}
            display="flex"
            alignItems="center"
            onClick={() => handleCellClick(index)}
            sx={{
              borderBottom: "1px solid #ccc",
              py: 0.5,
              px: 0.5,
              cursor: "pointer",
              backgroundColor:
                editingRowIndex === index ? "#f5f5f5" : "transparent",
            }}
          >
            {columns.map((col, idx) => {
              const val = row[col.key];
              const displayValue =
                col.colType === 5 && typeof col.colData[0] === "object"
                  ? col.colData.find((d: any) => String(d.id) === String(val))
                      ?.name || val
                  : val;

              // console.log("hari==", displayValue);
              return (
                <Box key={idx} flex={1} pl={1}>
                  {displayValue}
                </Box>
              );
            })}
            <Box width="40px" textAlign="center">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(index);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DropDownTable;
