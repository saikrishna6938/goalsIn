// TasksGrid.tsx

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  IconButton,
  TableSortLabel,
  Checkbox,
} from "@mui/material";
import { Search } from "@mui/icons-material";

interface Task {
  taskId: number;
  taskName: string;
  createdDate: string;
  // Add other task properties here
}

interface TasksGridProps {
  tasks: Task[];
}

const TasksGrid: React.FC<TasksGridProps> = ({ tasks }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [hoveredTaskId, setHoveredTaskId] = useState<number | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]); // Track selected tasks by taskId

  const [sortColumn, setSortColumn] = useState<
    "taskId" | "taskName" | "createdDate"
  >("taskId");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = sortedTasks.map((task) => task.taskId);
      setSelectedTasks(newSelecteds);
      return;
    }
    setSelectedTasks([]);
  };

  const handleClick = (taskId: number) => {
    const selectedIndex = selectedTasks.indexOf(taskId);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedTasks, taskId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedTasks.slice(1));
    } else if (selectedIndex === selectedTasks.length - 1) {
      newSelected = newSelected.concat(selectedTasks.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedTasks.slice(0, selectedIndex),
        selectedTasks.slice(selectedIndex + 1)
      );
    }

    setSelectedTasks(newSelected);
  };

  const handleSort = (column: "taskId" | "taskName" | "createdDate") => {
    if (column === sortColumn) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(task.taskId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let compareA = a[sortColumn];
    let compareB = b[sortColumn];

    if (sortDirection === "asc") {
      return compareA < compareB ? -1 : compareA > compareB ? 1 : 0;
    } else {
      return compareA > compareB ? -1 : compareA < compareB ? 1 : 0;
    }
  });

  const isRowSelected = (taskId: number) =>
    selectedTasks.indexOf(taskId) !== -1;

  return (
    <Paper sx={{ padding: "16px", margin: "16px" }}>
      <TextField
        variant="outlined"
        label="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          endAdornment: (
            <IconButton>
              <Search />
            </IconButton>
          ),
        }}
        sx={{ marginBottom: "16px" }}
      />
      <TableContainer>
        <Table>
          <TableHead
            sx={{
              height: "60px",
            }}
          >
            <TableRow sx={{ backgroundColor: "#9592a4" }}>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={
                    selectedTasks.length > 0 &&
                    selectedTasks.length < sortedTasks.length
                  }
                  checked={
                    sortedTasks.length > 0 &&
                    selectedTasks.length === sortedTasks.length
                  }
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell sx={{ color: "white", padding: "8px" }}>
                <TableSortLabel
                  active={sortColumn === "taskId"}
                  direction={sortDirection}
                  onClick={() => handleSort("taskId")}
                  sx={{
                    "& .MuiTableSortLabel-root": {
                      justifyContent: "space-between",
                      paddingRight: "24px",
                    },
                    "& .MuiTableSortLabel-icon": {
                      color: "white",
                      marginLeft: "16px", // Adjust as needed
                    },
                    "& span": {
                      flexGrow: 1,
                    },
                    fontSize: "16px", // Adjust the font size as needed
                    fontWeight: "600", // Semi-bold weight
                    color: "white",
                  }}
                >
                  Task Id
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: "white", padding: "8px" }}>
                <TableSortLabel
                  active={sortColumn === "taskName"}
                  direction={sortDirection}
                  onClick={() => handleSort("taskName")}
                  sx={{
                    "& .MuiTableSortLabel-root": {
                      justifyContent: "space-between",
                      paddingRight: "24px",
                    },
                    "& .MuiTableSortLabel-icon": {
                      color: "white",
                      marginLeft: "16px", // Adjust as needed
                    },
                    "& span": {
                      flexGrow: 1,
                    },
                    fontSize: "16px", // Adjust the font size as needed
                    fontWeight: "600", // Semi-bold weight
                    color: "white",
                  }}
                >
                  Task Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: "white", padding: "8px" }}>
                <TableSortLabel
                  active={sortColumn === "createdDate"}
                  direction={sortDirection}
                  onClick={() => handleSort("createdDate")}
                  sx={{
                    "& .MuiTableSortLabel-root": {
                      justifyContent: "space-between",
                      paddingRight: "24px",
                    },
                    "& .MuiTableSortLabel-icon": {
                      color: "white",
                      marginLeft: "16px", // Adjust as needed
                    },
                    "& span": {
                      flexGrow: 1,
                    },
                    fontSize: "16px", // Adjust the font size as needed
                    fontWeight: "600", // Semi-bold weight
                    color: "white",
                  }}
                >
                  Created Date
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTasks
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((task, index) => (
                <TableRow
                  key={task.taskId}
                  hover
                  onClick={() => setSelectedTaskId(task.taskId)}
                  onMouseEnter={() => setHoveredTaskId(task.taskId)}
                  onMouseLeave={() => setHoveredTaskId(null)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor:
                      task.taskId === selectedTaskId
                        ? "#3f51b5" // Change this to a color that makes it evident the row is selected.
                        : index % 2 === 0
                        ? "#f7f7f7"
                        : "inherit",
                    height: "60px", // Adjust the row height as needed
                    "& .MuiTableCell-root": {
                      fontSize: "16px", // Adjust the font size as needed
                      fontWeight: "600", // Semi-bold weight
                    },
                    border:
                      task.taskId === selectedTaskId
                        ? "1.4px solid #bebebe"
                        : "none", // Add border to selected row.
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isRowSelected(task.taskId)}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      padding: "8px",
                      color:
                        task.taskId === hoveredTaskId
                          ? "black"
                          : task.taskId === selectedTaskId
                          ? "white"
                          : "black",
                    }}
                  >
                    {task.taskId}
                  </TableCell>
                  <TableCell
                    sx={{
                      padding: "8px",
                      color:
                        task.taskId === hoveredTaskId
                          ? "black"
                          : task.taskId === selectedTaskId
                          ? "white"
                          : "black",
                    }}
                  >
                    {task.taskName}
                  </TableCell>
                  <TableCell
                    sx={{
                      padding: "8px",
                      color:
                        task.taskId === hoveredTaskId
                          ? "black"
                          : task.taskId === selectedTaskId
                          ? "white"
                          : "black",
                    }}
                  >
                    {task.createdDate}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredTasks.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default TasksGrid;
