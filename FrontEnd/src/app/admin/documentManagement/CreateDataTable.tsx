import React, { useState, useEffect } from "react";
import { Box, TextField } from "@mui/material";
import TextInputField from "app/components/regularinputs/TextInpuField";

// Define the structure
interface Field {
  name: string;
  type: string;
}

// Props
interface CreateDataTableProps {
  onChange: (data: { tableName: string; fields: Field[] }) => void;
}

const CreateDataTable: React.FC<CreateDataTableProps> = ({ onChange }) => {
  const [tableName, setTableName] = useState("");
  const [fields, setFields] = useState<Field[]>([
    { name: "customerName", type: "VARCHAR(100)" },
    { name: "feedback", type: "TEXT" },
    { name: "submittedAt", type: "DATETIME" },
  ]);

  const handleTableNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTableName(e.target.value);
  };

  const handleFieldChange = (
    index: number,
    key: keyof Field,
    value: string
  ) => {
    const updatedFields = [...fields];
    updatedFields[index][key] = value;
    setFields(updatedFields);
  };

  useEffect(() => {
    onChange({ tableName, fields });
  }, [tableName, fields, onChange]);

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* Table Name Input */}
      <TextInputField
        label="Table Name"
        value={tableName}
        onChange={handleTableNameChange}
        variant="standard"
      />
      {/* Fixed Fields */}
      {fields.map((field, index) => (
        <Box key={index} display="flex" alignItems="center" gap={2}>
          <TextInputField
            label={field.name}
            value={field.type}
            onChange={(e) => handleFieldChange(index, "type", e.target.value)}
            variant="standard"
          />
        </Box>
      ))}
    </Box>
  );
};

export default CreateDataTable;
