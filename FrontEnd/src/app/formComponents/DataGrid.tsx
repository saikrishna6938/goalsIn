import React, { useEffect, useRef, useState } from "react";
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
  Box,
  Button,
  useTheme,
} from "@mui/material";
import { Fullscreen, Search } from "@mui/icons-material";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { formatDate } from "app/utils/dates";
import { Themecolors, fonts } from "api/Colors";
import { hasUserSettings, UserSettingTypes } from "app/types/User";
import appStore from "app/mobxStore/AppStore";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Tooltip from "@mui/material/Tooltip";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import Skeleton from "@mui/material/Skeleton";

export interface Data {
  [key: string]: string | number | null;
}

export interface ColumnTypes {
  id: string;
  label: string;
  type: "string" | "number" | "date";
}
interface ButtonConfig {
  label: string;
  onClick: (taskId: number) => void;
  sx?: object;
}

interface ButtonGroupConfig {
  buttons: ButtonConfig[];
}

interface TasksGridProps {
  tasks: Data[];
  columns: ColumnTypes[];
  multiSelect?: boolean;
  onSelection: Function;
  filterComponent?: React.ReactNode;
  showButton?: boolean;
  buttonLabel?: string;
  defaultHeight?: string;
  defaultRowsPage?: number;
  buttons?: ButtonGroupConfig[];
  headerRender?: React.ReactNode;
  renderOptions?: React.ReactNode;
  onSelectedRowIds?: (selectedTasks: number[]) => void;
  resetSelectionRowId?: any;
  showSkeletonLoader?: boolean;
}

const DataGrid: React.FC<TasksGridProps> = ({
  tasks,
  columns,
  multiSelect,
  onSelection,
  filterComponent,
  showButton,
  buttonLabel,
  defaultHeight = "78.9vh",
  defaultRowsPage = 20,
  buttons,
  headerRender,
  renderOptions,
  onSelectedRowIds,
  resetSelectionRowId,
  showSkeletonLoader = true,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPage);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRowId, setselectedRowId] = useState<number | null>(null);
  const [hoverId, sethoverId] = useState<number | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]); // Track selected tasks by taskId
  const { palette } = useTheme();
  const [sortColumn, setSortColumn] = useState<string>(columns[0]?.id ?? "");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [skeletonRowCount, setSkeletonRowCount] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const measure = () => {
      const totalHeight =
        containerRef.current?.getBoundingClientRect().height ?? 0;
      const headerHeight = 40;
      const bodyHeight = Math.max(totalHeight - headerHeight, 0);

      const rows = Math.floor(bodyHeight / 50);
      setSkeletonRowCount(rows);
    };

    measure();
    const observer = new ResizeObserver(() => measure());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (resetSelectionRowId) {
      setselectedRowId(null);
    }
  }, [resetSelectionRowId]);

  useEffect(() => {
    if (onSelectedRowIds) {
      onSelectedRowIds(selectedTasks);
    }
  }, [selectedTasks, onSelectedRowIds]);

  useEffect(() => {
    onSelection(selectedRowId);
  }, [selectedRowId]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = sortedTasks.map((task) => task.id);
      setSelectedTasks(newSelecteds as any);
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

  const handleSort = (column: string) => {
    // Modify the type from fixed values to string
    if (column === sortColumn) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  useEffect(() => {
    setPage(0);
  }, [tasks]);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredTasks = tasks.filter(
    (task) =>
      String(task.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(task).some((field) =>
        String(field).toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let compareA: any = a[sortColumn];
    let compareB: any = b[sortColumn];

    // Ascertain the type for the sortColumn
    const columnType = columns.find((col) => col.id === sortColumn)?.type;

    // Adjust comparison based on type
    if (columnType === "number") {
      compareA = parseInt(compareA);
      compareB = parseInt(compareB);
    } else if (columnType === "date") {
      compareA = new Date(compareA);
      compareB = new Date(compareB);
    }

    if (sortDirection === "asc") {
      return compareA < compareB ? -1 : compareA > compareB ? 1 : 0;
    } else {
      return compareA > compareB ? -1 : compareA < compareB ? 1 : 0;
    }
  });

  const getButtonIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case "save":
        return <SaveIcon />;
      case "edit":
        return <EditIcon />;
      case "view":
        return <VisibilityIcon />;
      case "delete":
        return <DeleteIcon />;
      case "edit transition":
        return <SwapHorizIcon />;
      case "apply":
        return <TouchAppIcon />;
      default:
        return <HelpOutlineIcon />;
    }
  };

  const isRowSelected = (taskId: number) =>
    selectedTasks.indexOf(taskId) !== -1;

  return (
    <Box
      sx={{
        borderRadius: 0,
        paddingY: "5px",
        marginBottom: "4px",
        backgroundColor: "#ffffff",
        position: "relative",
        height: defaultHeight,
        display: "flex",
        flexDirection: "column",
        marginTop: "4px",
        // borderBottom: "1px solid #e0e0e0",
        // border: "1px solid #e0e0e0",
        // boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
        // transition: "box-shadow 0.3s ease-in-out",
        // "&:hover": {
        //   boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.2)",
        // },
      }}
    >
      <Box
        sx={{
          backgroundColor: Themecolors.Dg_bg1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          height: "40px",
          padding: "2px",
        }}
      >
        <TextField
          variant="filled"
          label="Search"
          style={{ margin: "2px" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: (
              <IconButton sx={{ color: Themecolors.Dg_Icon2 }}>
                <Search />
              </IconButton>
            ),
          }}
          InputLabelProps={{
            sx: {
              color: Themecolors.Button2,
              transform: "translate(6px, 10px)",
              transition:
                "transform 0.2s ease-in-out, background-color 0.3s ease-in-out",
              "&.Mui-focused": {
                color: Themecolors.Button2,
              },
              "&.MuiInputLabel-shrink": {
                transform: "translate(5px, 0)",
                fontSize: "0.9em",
              },
              fontFamily: fonts.inter,
            },
          }}
          sx={{
            height: "100%",
            boxSizing: "border-box",
            backgroundColor: Themecolors.Button_bg4,
            "& .MuiInputBase-input": {
              height: 5,
              fontFamily: fonts.inter,
            },
            "& .MuiInputBase-root": {
              backgroundColor: Themecolors.Button_bg3,
              display: "flex",
              alignItems: "center",
              height: "100%",
              boxSizing: "border-box",
              fontFamily: fonts.inter,
            },
            "&:hover .MuiInputBase-root": {
              backgroundImage: Themecolors.B_hv3,
            },
          }}
        />

        {filterComponent && filterComponent}
        {headerRender && headerRender}
        {renderOptions && renderOptions}
      </Box>
      <Table>
        <TableHead
          sx={{
            height: "35px",
            backgroundColor: Themecolors.Dg_bg2,
          }}
        >
          <TableRow>
            {multiSelect && (
              <TableCell
                padding="checkbox"
                sx={{
                  border: "0.5px solid #efefef", // Adding border with white color for contrast
                }}
              >
                <Checkbox
                  sx={{
                    "& .MuiSvgIcon-root": {
                      color: "#ffffff",
                    },
                  }}
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
            )}
            {columns.map((column) => (
              <TableCell
                key={column.id}
                sx={{
                  color: palette.primary.dark,
                  marginLeft: "4px",
                  padding: "4px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  border: "0.5px solid #efefef",
                  fontFamily: fonts.inter,
                }}
              >
                <TableSortLabel
                  direction={sortDirection}
                  onClick={() => handleSort(column.id)}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    "& .MuiTableSortLabel-root": {
                      justifyContent: "space-between",
                      paddingRight: "24px",
                      color: "#dedede",
                    },
                    "& .MuiTableSortLabel-icon": {
                      color: Themecolors.Dg_Icon_bg3,
                      marginLeft: "8px",
                      opacity: 0.5,
                    },
                    "& .MuiTableSortLabel-icon:active": {
                      color: Themecolors.Dg_Icon_bg3,
                      marginLeft: "8px",
                    },
                    "& span": {
                      flexGrow: 1,
                    },
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    fontFamily: fonts.inter,
                    color: Themecolors.Dg_text1, // header text color
                    transition: "color 0.3s",
                    "&:hover": {
                      color: Themecolors.Dg_text2, // header active text color
                    },
                    "&:focus": {
                      color: Themecolors.Dg_text1, // header text color
                    },
                  }}
                >
                  {column.label}
                </TableSortLabel>
              </TableCell>
            ))}
            {showButton && (
              <TableCell
                key={"show-button"}
                sx={{
                  color: Themecolors.Dg_text1,
                  padding: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  minWidth: "50px",
                  border: "0.5px solid #efefef", // Ensuring consistency in border across all cells
                  fontFamily: fonts.inter,
                }}
              >
                {"Options"}
              </TableCell>
            )}
          </TableRow>
        </TableHead>
      </Table>

      <TableContainer ref={containerRef} sx={{ flex: "1 1 auto" }}>
        <Table>
          <TableBody sx={{ overflow: "auto" }}>
            {/* Dynamic Rows */}
            {sortedTasks.length === 0 ? (
              showSkeletonLoader ? (
                [...Array(skeletonRowCount)].map((_, idx) => (
                  <TableRow
                    key={idx}
                    sx={{
                      height: "50px",
                      backgroundColor: "#ffffff",
                      "&:hover": { backgroundColor: "#f5f5f5" },
                      borderBottom: "none",
                    }}
                  >
                    <TableCell
                      colSpan={
                        columns.length +
                        (multiSelect ? 1 : 0) +
                        (showButton ? 1 : 0)
                      }
                      sx={{ padding: "4px" }}
                    >
                      <Skeleton
                        variant="rectangular"
                        height={50}
                        width="100%"
                        sx={{
                          borderRadius: "2px",
                          margin: "0 auto",
                          backgroundColor: "#ffffff",
                          backgroundImage:
                            "linear-gradient(90deg, #ffffff 25%, #eeeeee 50%, #ffffff 75%)",
                          backgroundSize: "200% 100%",
                          animation: "wave 1.6s linear infinite",
                          "@keyframes wave": {
                            "0%": { backgroundPosition: "200% 0" },
                            "100%": { backgroundPosition: "-200% 0" },
                          },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    sx={{ fontWeight: 600, fontFamily: fonts.inter, pl: 1 }}
                  >
                    No Data Found
                  </TableCell>
                </TableRow>
              )
            ) : (
              sortedTasks
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((task, index) => (
                  <TableRow
                    key={task.id}
                    hover
                    onClick={() => setselectedRowId(task.id as any)}
                    onMouseEnter={() => sethoverId(task.id as any)}
                    onMouseLeave={() => sethoverId(null)}
                    sx={{
                      cursor: "pointer",
                      backgroundColor:
                        task.id == selectedRowId
                          ? "#e3f2fd"
                          : index % 2 === 0
                          ? "#fafafa"
                          : "inherit",
                      height: "50px",
                      fontFamily: fonts.inter,
                      "& .MuiTableCell-root": {
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        color: "#333",
                        fontFamily: fonts.inter,
                      },
                      border:
                        task.id === selectedRowId
                          ? "1px solid #bebebe"
                          : "none",
                      "&:hover": {
                        backgroundColor: "#e8eaf6",
                      },
                    }}
                  >
                    {multiSelect && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isRowSelected(task.id as any)}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          onChange={() => handleClick(task.id as any)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        sx={{
                          display: "table-cell",

                          padding: "8px",
                          color:
                            task.id === hoverId
                              ? "#333"
                              : task.id === selectedRowId
                              ? "white"
                              : "#333",
                        }}
                      >
                        {column.type === "date" ? (
                          formatDate(task[column.id] as string)
                        ) : column.label === "Enabled" ? (
                          task[column.id] === 0 ? (
                            <ErrorIcon color="error" />
                          ) : (
                            <CheckCircleIcon style={{ color: "green" }} />
                          )
                        ) : (
                          task[column.id]
                        )}
                      </TableCell>
                    ))}

                    {showButton && (
                      <TableCell>
                        <div
                          style={{
                            paddingLeft: "10px",
                          }}
                        >
                          {(buttons || []).map((buttonGroup, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "4px",
                              }}
                            >
                              {buttonGroup.buttons.map(
                                (buttonConfig, btnIdx) => (
                                  <Tooltip
                                    title={buttonConfig.label}
                                    key={btnIdx}
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        buttonConfig.onClick(task.id as number)
                                      }
                                    >
                                      {getButtonIcon(buttonConfig.label)}
                                    </IconButton>
                                  </Tooltip>
                                )
                              )}
                            </Box>
                          ))}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box>
        <TablePagination
          sx={{
            alignSelf: "flex-end",
            overflowY: "hidden",
            padding: 0,
            borderTop: "1px solid  #e0e0e0",
            fontFamily: fonts.inter,
          }}
          rowsPerPageOptions={[20, 50, 100]}
          component="div"
          count={filteredTasks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </Box>
  );
};

export default DataGrid;
