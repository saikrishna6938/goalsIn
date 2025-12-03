import React, { useEffect, useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  TablePagination,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Delete } from "@mui/icons-material";
import HeaderTypography from "app/formComponents/HeaderTypography";

interface ItemWithRoleNameId {
  roleNameId: number;
}

interface ListComponentProps<T extends ItemWithRoleNameId> {
  items: T[];
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchValue: string;
  onMoveToLeft?: (roleId: number) => void;
  onMoveToRight?: (roleId: number) => void;
  rowsPerPage: number;
  page: number;
  setPage: (page: number) => void;
  renderItemText: (item: T) => string;
  renderItemId: (item: T) => number;
  Headertitle?: string;
  rows?: number;
}

const ListComponent = <T extends ItemWithRoleNameId>({
  items,
  onSearch,
  searchValue,
  onMoveToLeft,
  onMoveToRight,
  page,
  setPage,
  renderItemText,
  renderItemId,
  Headertitle,
  rows = 25,
}: ListComponentProps<T>) => {
  const [localRowsPerPage, setLocalRowsPerPage] = useState(rows);

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setLocalRowsPerPage(parseInt(event.target.value, 10));
  };

  const filteredItems = items
    .filter((item) =>
      renderItemText(item).toLowerCase().includes(searchValue.toLowerCase())
    )
    .slice(page * localRowsPerPage, page * localRowsPerPage + localRowsPerPage);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ width: "100%" }}>
        <HeaderTypography
          title={Headertitle}
          searchEnabled={true}
          onSearch={onSearch}
          searchValue={searchValue}
          TextFieldWidth={"170px"}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          paddingX: "10px",
        }}
      >
        <List>
          {filteredItems.map((item) => (
            <ListItem key={renderItemId(item)} divider>
              <ListItemText
                primary={renderItemText(item)}
                sx={{
                  "& .MuiTypography-root": {
                    fontSize: "0.78rem",
                    whiteSpace: "normal",
                    wordWrap: "break-word",
                  },
                }}
              />
              {onMoveToRight && (
                <Box
                  sx={{
                    borderRadius: "50%",
                    border: "1px solid #e0e0e0",
                    height: "30px",
                    width: "30px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    "&:hover": { backgroundColor: "#eeeeee" },
                    cursor: "pointer",
                  }}
                  onClick={() => onMoveToRight(item.roleNameId)}
                >
                  <AddIcon sx={{ height: "20px", width: "20px" }} />
                </Box>
              )}
              {onMoveToLeft && (
                <Box
                  sx={{
                    borderRadius: "50%",
                    border: "1px solid #e0e0e0",
                    height: "30px",
                    width: "30px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    "&:hover": { backgroundColor: "#eeeeee" },
                    cursor: "pointer",
                  }}
                  onClick={() => onMoveToLeft(item.roleNameId)}
                >
                  <Delete sx={{ height: "20px", width: "20px" }} />
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ marginTop: "auto" }}>
        <TablePagination
          sx={{
            width: "100%",
            boxSizing: "border-box",
            borderTop: "1px solid  #e0e0e0",
            padding: 0,
            "& .MuiToolbar-root": {
              width: "100%",
              paddingLeft: 0,
              paddingRight: 0,
              display: "flex",
              justifyContent: "space-between",
            },
            "& .MuiTablePagination-selectLabel": {
              margin: 0,
            },
            "& .MuiTablePagination-select": {
              margin: 0,
              padding: 0,
            },
            "& .MuiTablePagination-displayedRows": {
              margin: 0,
            },
            "& .MuiTablePagination-actions": {
              margin: 0,
              padding: 0,
            },
          }}
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={items.length}
          rowsPerPage={localRowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Rows :"
        />
      </Box>
    </Box>
  );
};

export default ListComponent;
