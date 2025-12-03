import React from "react";
import { Box, IconButton, Tooltip, styled, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Add, Edit } from "@mui/icons-material";
import SaveIcon from "@mui/icons-material/Save";
import Panel from "./Panel";

const StyledButton = styled(Button)(() => ({
  height: "1.5em",
  width: "auto",
  border: "1px solid black",
  borderRadius: 0,
  // backgroundColor: "#fafafa",
  color: "black",
  "&:hover": {
    backgroundImage: "f5f5f5",
    borderColor: "black",
  },
}));

type RowData = {
  type: string;
  value: string;
};

type column = {
  key: string;
  label: string;
};

type Props = {
  title: string;
  rows: RowData[];
  columns?: column[];
  onChange: (updatedRows: RowData[]) => void;
  onAddClick?: () => void;
  onEditClick?: (index: number) => void;
  onDeleteClick?: (index: number) => void;
};

const GenericTable: React.FC<Props> = ({
  title,
  rows,
  onAddClick,
  onEditClick,
  onDeleteClick,
  columns = [],
}) => {
  return (
    <Panel>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ fontWeight: "bold", mx: 1 }}>{title}</Box>
        <Tooltip title={title}>
          <IconButton onClick={onAddClick}>
            <Add sx={{ border: "1px solid #ccc" }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        sx={{
          border: "1px solid #ddd",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            backgroundColor: "#eee",
            fontWeight: "bold",
            px: 2,
            py: 1,
          }}
        >
          {columns.map((col, idx) => (
            <Box key={idx} sx={{ flex: 1 }}>
              {col.label}
            </Box>
          ))}
          <Box sx={{ width: 60, textAlign: "center" }}>Action</Box>
        </Box>

        {rows.map((row, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              px: 2,
              py: 1,
              borderTop: "1px solid #ddd",
              alignItems: "center",
            }}
          >
            {columns.map((col, idx) => (
              <Box key={idx} sx={{ flex: 1, p: 0.5 }}>
                {row[col.key]}
              </Box>
            ))}
            <Box
              sx={{
                width: 60,
                display: "flex",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <Tooltip title="Edit">
                <IconButton onClick={() => onEditClick?.(index)} size="small">
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton onClick={() => onDeleteClick?.(index)} size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ))}
      </Box>
    </Panel>
  );
};

export default GenericTable;
