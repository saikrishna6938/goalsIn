// QuestionTypeMenuItems.tsx
import React from "react";
import { MenuItem } from "@mui/material";

interface Props {
  onSelect: (type: string) => void;
}

const questionTypes = [
  { id: "1", label: "TextBox" },
  { id: "2", label: "DescriptionBox" },
  { id: "3", label: "Checkbox" },
  { id: "4", label: "RadioButton" },
  { id: "5", label: "UploadButton" },
  { id: "6", label: "NumericBox" },
  { id: "7", label: "CurrencyBox" },
  { id: "8", label: "Dropdown" },
  { id: "9", label: "Date" },
  { id: "10", label: "Document Tag" },
  { id: "11", label: "HtmlContainer" },
];

const QuestionTypeMenuItems: React.FC<Props> = ({ onSelect }) => {
  return (
    <>
      {questionTypes.map(({ id, label }) => (
        <MenuItem key={id} onClick={() => onSelect(id)}>
          {label}
        </MenuItem>
      ))}
    </>
  );
};

export default QuestionTypeMenuItems;
