import React, { useEffect, useState } from "react";
import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Container,
  IconButton,
  Typography,
  Box,
  Paper,
  Card,
  Tooltip,
  Modal,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { styled } from "@mui/material/styles";
import { Themecolors, fonts } from "api/Colors";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useFormik } from "formik";
import SearchForm from "./SearchForm";
import { fieldData } from "app/user/documents/DocumentsView";
import { HeaderStyled } from "./HeaderBox";
import { SplitView } from "app/formComponents/SplitView";
import DataGrid from "app/formComponents/DataGrid";
import {
  convertIdToLowerCase,
  sampleColumns,
  sampleTasks,
  searchColumns,
} from "app/user/tasks/samples";
import { api } from "api/API";
import SearchFilters from "./SearchFilters";
import UserHeaderComponent, {
  UserHeaderBox,
  UserInfoBox,
} from "./UserHeaderComponent";
import TaskTagDetails from "app/user/TaskTagDetails";
import CloseIcon from "@mui/icons-material/Close";
import { removeEmptyKeys } from "app/user/search/SearchFilter";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import PrimaryButton from "app/components/regularinputs/PrimaryButton";

const StyledFieldContainer = styled(Box)(({ theme }) => ({
  overflowX: "hidden",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  margin: theme.spacing(0.5),
  height: "100%",
  maxHeight: "calc(90vh - 171px)",
  paddingBottom: 0,
}));

const CollapseIconContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  right: theme.spacing(1),
  left: theme.spacing(0.25),
}));

const StyledField = styled(Box)(({ theme }) => ({
  maxWidth: 500,
  padding: theme.spacing(1),
  minWidth: 300,
}));

export const RightAlignedButton = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  width: "100%",
});

interface FormData {
  documentTagType: string;
  selections: Array<{
    questions: number[];
    options: {
      id: string;
      name: string;
    }[];
  }>;
  filterOptions: number[];
  sections: {
    sectionName: string;
    initialValues: Record<string, string>;
    formDetails: {
      groupName: string;
      repeated: boolean;
      form: {
        order: string;
        attributeName: string;
        attributeDescription: string;
        attributeType: string;
      }[];
    }[];
  }[];
}

interface DynamicFormProps {
  data: FormData;
  selectedId: number;
  onApply: (tagId: number, tagName: string) => void;
  refreshGrid: boolean;
  documentTableId: number;
  Name?: string;
  userEmail?: string;
  userImage?: any;
  userId: number;
}

const DynamicSearch: React.FC<DynamicFormProps> = ({
  data,
  selectedId,
  onApply,
  refreshGrid,
  documentTableId,
  Name,
  userEmail,
  userImage,
  userId,
}) => {
  const [formValues, setFormValues] = useState<Record<string, string>>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [values, setValues] = useState<any>({});
  const [fields, setFields] = useState([]);
  const [searchTags, setSearchTags] = useState([]);
  const [searchValues, setSearchValues] = useState([]);
  const [load, SetLoad] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, SetSelectedRow] = useState();
  const [showSkeletonLoader, SetShowSkeletonLoader] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDetails, setConfirmDetails] = useState<
    Record<string, string | number>
  >({});
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);

  useEffect(() => {
    console.log(values);
  }, [values]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    setSearchValues([]);
  }, [selectedId]);

  useEffect(() => {
    if (formValues) initdataGrid(formValues);
  }, [refreshGrid]);

  useEffect(() => {
    api.get(`task/search-tags/${documentTableId}`).then((res) => {
      if (res.status) {
        setSearchTags(res.data);
      }
    });
  }, []);

  const initdataGrid = (values) => {
    if (values && Object.keys(values).length > 0) {
      SetShowSkeletonLoader(true);
    }
    api
      .post(`search-document-table`, {
        body: {
          documentTypeId: selectedId,
          userId: userId,
          search: values,
        },
      })
      .then((res) => {
        if (res.data) {
          const values = convertIdToLowerCase(res.data);
          const columns = res.fields
            .filter((f) => f.isVisible === true)
            .map((v) => {
              const type = String(v.type).includes("Int") ? "number" : "string";
              let val = v.name;
              if (String(v.name).toLowerCase() === "id")
                val = val.toLowerCase();

              return { id: val, label: v.name, type: type };
            });
          setFields(columns);
          setSearchValues(values);
        }
        // toggleCollapse();
      })
      .finally(() => SetShowSkeletonLoader(false));
  };

  const handleSubmit = () => {
    let filteredValues = removeEmptyKeys(values);
    initdataGrid(filteredValues);
    setFormValues(filteredValues);
  };

  const clearAllFilters = () => {
    setValues({});
    SetLoad((prv) => prv + 1);
  };
  const isRightAligned = true;

  const handleViewClick = (tagId) => {
    const selected: any = searchValues.find((f) => f.id === tagId);
    SetSelectedRow(selected.id);
    setOpenModal(true);
  };

  const handleApplyClick = (tagId) => {
    const selected: any = searchValues.find((f) => f.id === tagId);
    setSelectedTagId(tagId);
    setOpenDialog(true);
    setConfirmDetails(selected);
  };

  const handleApply = (tagId) => {
    const selected: any = searchValues.find((f) => f.id === tagId);
    onApply(tagId, `${selected.UniversityName} - ${selected.ProgramName}`);
  };

  const buttons = [
    {
      buttons: [
        {
          label: "Apply",
          onClick: handleApplyClick,
        },
        {
          label: "View",
          onClick: handleViewClick,
        },
      ],
    },
  ];

  const renderSearchFields = () => {
    return (
      <Box
        sx={{
          backgroundColor: "white",
          mt: "4px",
          height: "100%",
        }}
      >
        <Box
          sx={{
            backgroundColor: isCollapsed ? "rgb(250 250 250)" : "",
          }}
        >
          {isCollapsed ? (
            <Tooltip title="Search Filters" arrow>
              <IconButton color="primary" onClick={toggleCollapse}>
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Box>
              <IconButton color="primary" onClick={toggleCollapse}>
                <KeyboardArrowLeftIcon />
              </IconButton>
              <Typography
                variant="caption"
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  fontFamily: fonts.poppins,
                }}
              >
                Search Filters
              </Typography>
            </Box>
          )}
        </Box>
        {!isCollapsed && (
          <Box overflow={"hidden"} sx={{ height: "100%", width: "340px" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 1,
                backgroundColor: "#f5f5f5",
                mb: 1,
              }}
            >
              <Button
                variant={"outlined"}
                onClick={clearAllFilters}
                sx={{ height: "30px" }}
              >
                Clear Filter
              </Button>

              <Button
                variant="outlined"
                color="info"
                onClick={() => {
                  handleSubmit();
                }}
                sx={{
                  borderColor: Themecolors.Button1,
                  backgroundColor: Themecolors.Button1,
                  color: Themecolors.Button2,
                  "&:hover": {
                    backgroundImage: Themecolors.B_hv1,
                    borderColor: Themecolors.Button1,
                    backgroundColor: Themecolors.Button1,
                  },
                }}
                disabled={Object.values(values).every((val) => val === "")}
              >
                Search
              </Button>
            </Box>
            <Box>
              <StyledFieldContainer key={"search-bar"}>
                <SearchFilters
                  key={load}
                  data={searchTags}
                  setValues={setValues}
                />
              </StyledFieldContainer>
            </Box>
          </Box>
        )}
      </Box>
    );
  };
  return (
    <Box
      sx={{
        height: "100%",
        maxHeight: "calc(100vh - 100px)",
        overflow: "hidden",
      }}
    >
      <Box flexDirection={"row"} display={"flex"} sx={{ height: "100%" }}>
        <Box>{renderSearchFields()}</Box>
        <Divider
          orientation="vertical"
          flexItem
          sx={{
            margin: "5px 3px 0 3px",
            borderWidth: "1px",
            borderColor: "#eeeeee",
          }}
        />
        <Box
          sx={{
            mt: "2px",
            ml: "3px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Box>
            <UserHeaderComponent
              userInfoComponent={
                <>
                  <UserHeaderBox>
                    <Avatar
                      src={userImage}
                      sx={{
                        transition: "transform .2s",
                        "&:hover": {
                          transform: "scale(1.05)",
                          backgroundImage: Themecolors.UH_hv1,
                        },
                        backgroundColor: Themecolors.UH_Icon_bg1,
                        color: Themecolors.UH_Icon2,
                      }}
                    />
                    <UserInfoBox>
                      <Typography
                        variant="h6"
                        sx={{ color: Themecolors.UH_text3 }}
                      >
                        {Name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: Themecolors.UH_text3 }}
                      >
                        {userEmail}
                      </Typography>
                    </UserInfoBox>
                  </UserHeaderBox>
                </>
              }
            />
          </Box>
          <Box
            sx={{
              height: "100%",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <DataGrid
              key={"search-grid"}
              tasks={searchValues}
              columns={fields ?? []}
              onSelection={(v) => {}}
              showButton={true}
              defaultHeight="100%"
              buttons={buttons}
              showSkeletonLoader={showSkeletonLoader}
            />
          </Box>
        </Box>
      </Box>
      <Box>
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                boxShadow: 24,
                paddingY: "1.5em",
                paddingX: "0.5em",
                borderRadius: "8px",
                width: "60%",
                height: "90%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                alignContent: "center",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "0.23em",
                  right: "0.55em",
                  cursor: "pointer",
                  fontSize: 14,
                }}
                onClick={() => setOpenModal(false)}
              >
                <CloseIcon />
              </Box>
              <Typography
                sx={{
                  mt: "23px",
                  width: "100%",
                  height: "85vh",
                  maxHeight: "100%",
                  overflow: "auto",
                  fontFamily: fonts.inter,
                }}
              >
                <TaskTagDetails
                  taskTagId={selectedRow}
                  taskTableId={documentTableId}
                />
              </Typography>
            </Box>
          </Box>
        </Modal>
      </Box>
      <>
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Confirm details before applying
            <IconButton
              aria-label="close"
              onClick={() => setOpenDialog(false)}
              sx={{
                position: "absolute",
                right: 5,
                top: 3,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {confirmDetails && Object.keys(confirmDetails).length > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 3,
                  mt: 1,
                }}
              >
                {Object.entries(confirmDetails).map(([key, value]) => (
                  <Box key={key}>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", fontWeight: 600, mb: 0.5 }}
                    >
                      {key}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "text.primary", fontWeight: 500 }}
                    >
                      {value !== null && value !== undefined
                        ? String(value)
                        : "NA"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography>No details available</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <PrimaryButton
              label="Cancel"
              startIcon={<CancelIcon />}
              type="button"
              onClick={() => setOpenDialog(false)}
            />
            <PrimaryButton
              label="Apply"
              startIcon={<SaveIcon />}
              type="submit"
              onClick={() => {
                if (selectedTagId) handleApply(selectedTagId);
              }}
            />
          </DialogActions>
        </Dialog>
      </>
    </Box>
  );
};

export default DynamicSearch;
